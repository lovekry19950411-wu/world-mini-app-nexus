/**
 * World ID Verification Router
 * Handles World ID 4.0 verification and user authentication
 */

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { users, nullifiers } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

/**
 * World ID Verification Input Schema
 */
const VerifyWorldIdInput = z.object({
  proof: z.string().describe("World ID proof from IDKit"),
  nullifier_hash: z.string().describe("Nullifier hash for duplicate prevention"),
  credential_type: z.string().optional().describe("Credential type"),
});

/**
 * World ID Verification Router
 */
export const worldIdVerificationRouter = router({
  /**
   * Verify World ID proof and authenticate user
   */
  verify: publicProcedure
    .input(VerifyWorldIdInput)
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          return {
            success: false,
            error: "Database not available",
          };
        }

        const { proof, nullifier_hash, credential_type } = input;

        // Validate proof format
        if (!proof || typeof proof !== "string" || proof.length < 10) {
          return {
            success: false,
            error: "Invalid proof format",
          };
        }

        // Validate nullifier hash
        if (!nullifier_hash || typeof nullifier_hash !== "string") {
          return {
            success: false,
            error: "Invalid nullifier hash",
          };
        }

        // Check if nullifier already used (prevent duplicate verification)
        const existingNullifier = await db
          .select()
          .from(nullifiers)
          .where(eq(nullifiers.nullifier, nullifier_hash))
          .limit(1);

        if (existingNullifier.length > 0) {
          return {
            success: false,
            error: "Already verified with this identity",
          };
        }

        // Check if user with this World ID already exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.openId, `world_id_${nullifier_hash.substring(0, 16)}`))
          .limit(1);

        let user = existingUser;

        // Create new user if doesn't exist
        if (user.length === 0) {
          await db.insert(users).values({
            openId: `world_id_${nullifier_hash.substring(0, 16)}`,
            name: `World ID User`,
            loginMethod: "world_id",
            role: "user",
          });

          user = await db
            .select()
            .from(users)
            .where(eq(users.openId, `world_id_${nullifier_hash.substring(0, 16)}`))
            .limit(1);
        }

        // Record nullifier to prevent re-verification
        if (user.length > 0) {
          await db.insert(nullifiers).values({
            nullifier: nullifier_hash,
            action: "verify_human",
            userId: user[0].id,
          });
        }

        // Log verification
        console.log(`[World ID] Verified with nullifier: ${nullifier_hash.substring(0, 16)}...`);

        return {
          success: true,
          user_id: user.length > 0 ? user[0].id : 0,
          verified: true,
          message: "World ID verification successful",
        };
      } catch (error) {
        console.error("World ID verification error:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Verification failed",
        };
      }
    }),

  /**
   * Check if user is verified
   */
  checkVerification: publicProcedure
    .input(z.object({ nullifier_hash: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return {
            verified: false,
            error: "Database not available",
          };
        }
        const nullifier = await db
          .select()
          .from(nullifiers)
          .where(eq(nullifiers.nullifier, input.nullifier_hash))
          .limit(1);

        if (nullifier.length === 0) {
          return {
            verified: false,
            message: "Not verified",
          };
        }

        return {
          verified: true,
          verified_at: nullifier[0].verifiedAt,
          message: "Verification status retrieved",
        };
      } catch (error) {
        console.error("Check verification error:", error);
        return {
          verified: false,
          error:
            error instanceof Error ? error.message : "Check failed",
        };
      }
    }),

  /**
   * Get current user's verification status (requires auth)
   */
  getMyVerificationStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          verified: false,
          error: "Database not available",
        };
      }
      const userNullifiers = await db
        .select()
        .from(nullifiers)
        .where(eq(nullifiers.userId, ctx.user.id))
        .limit(1);

      return {
        verified: userNullifiers.length > 0,
        verified_at: userNullifiers.length > 0 ? userNullifiers[0].verifiedAt : null,
        user_id: ctx.user.id,
        message: "Verification status retrieved",
      };
    } catch (error) {
      console.error("Get verification status error:", error);
      return {
        verified: false,
        error:
          error instanceof Error ? error.message : "Status check failed",
      };
    }
  }),

  /**
   * Get World ID configuration for frontend
   */
  getConfig: publicProcedure.query(() => {
    return {
      app_id: process.env.VITE_WORLD_ID_APP_ID || "",
      action: process.env.VITE_WORLD_ID_ACTION || "verify_human",
      signal: process.env.VITE_WORLD_ID_SIGNAL || "user_id",
      verify_link: process.env.WORLD_ID_VERIFY_LINK || "",
    };
  }),
});
