/**
 * World ID 4.0 Configuration
 * Handles World ID verification and integration
 */

export interface WorldIdConfig {
  appId: string;
  action: string;
  signal: string;
  apiKey: string;
  verifyUrl: string;
}

export interface VerificationProof {
  proof: string;
  nullifier_hash: string;
  credential_type: string;
  human_readable_details: string;
}

export interface VerificationResult {
  success: boolean;
  user_id?: string;
  verified?: boolean;
  error?: string;
  nullifier_hash?: string;
}

/**
 * Get World ID configuration from environment
 */
export function getWorldIdConfig(): WorldIdConfig {
  const appId = process.env.VITE_WORLD_ID_APP_ID;
  const apiKey = process.env.WORLD_ID_API_KEY;
  const verifyUrl = process.env.WORLD_ID_VERIFY_URL;

  if (!appId || !apiKey || !verifyUrl) {
    throw new Error(
      "World ID configuration incomplete. Please set VITE_WORLD_ID_APP_ID, WORLD_ID_API_KEY, and WORLD_ID_VERIFY_URL"
    );
  }

  return {
    appId,
    action: process.env.VITE_WORLD_ID_ACTION || "verify_human",
    signal: process.env.VITE_WORLD_ID_SIGNAL || "user_id",
    apiKey,
    verifyUrl,
  };
}

/**
 * Validate World ID proof format
 */
export function validateProofFormat(proof: VerificationProof): boolean {
  if (!proof.proof || typeof proof.proof !== "string") {
    return false;
  }

  if (!proof.nullifier_hash || typeof proof.nullifier_hash !== "string") {
    return false;
  }

  if (!proof.credential_type) {
    return false;
  }

  return true;
}

/**
 * Generate user ID from nullifier hash
 * This ensures consistent user identification across sessions
 */
export function generateUserIdFromNullifier(
  nullifierHash: string
): string {
  // Use nullifier hash as basis for user ID
  // In production, you might want to hash this further
  return `user_${nullifierHash.substring(0, 16)}`;
}

/**
 * Format verification error message
 */
export function formatVerificationError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Verification failed";
}

/**
 * Check if proof is expired
 * World ID proofs are typically valid for 5 minutes
 */
export function isProofExpired(
  proofTimestamp: number,
  maxAgeMs: number = 5 * 60 * 1000
): boolean {
  const now = Date.now();
  return now - proofTimestamp > maxAgeMs;
}

/**
 * Sanitize nullifier hash for database storage
 */
export function sanitizeNullifierHash(hash: string): string {
  // Remove any non-alphanumeric characters except hyphens
  return hash.replace(/[^a-zA-Z0-9-]/g, "");
}

/**
 * Create World ID verification response
 */
export function createVerificationResponse(
  success: boolean,
  data?: {
    user_id?: string;
    nullifier_hash?: string;
  },
  error?: string
): VerificationResult {
  if (success && data) {
    return {
      success: true,
      user_id: data.user_id,
      verified: true,
      nullifier_hash: data.nullifier_hash,
    };
  }

  return {
    success: false,
    error: error || "Verification failed",
  };
}

/**
 * Log World ID verification attempt
 */
export function logVerificationAttempt(
  nullifierHash: string,
  success: boolean,
  error?: string
): void {
  const timestamp = new Date().toISOString();
  const status = success ? "SUCCESS" : "FAILED";

  console.log(
    `[World ID] ${timestamp} - ${status} - Nullifier: ${sanitizeNullifierHash(
      nullifierHash
    ).substring(0, 8)}...${error ? ` - Error: ${error}` : ""}`
  );
}

/**
 * World ID environment check
 */
export function checkWorldIdEnvironment(): {
  configured: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!process.env.VITE_WORLD_ID_APP_ID) {
    issues.push("VITE_WORLD_ID_APP_ID not configured");
  }

  if (!process.env.WORLD_ID_API_KEY) {
    issues.push("WORLD_ID_API_KEY not configured");
  }

  if (!process.env.WORLD_ID_VERIFY_URL) {
    issues.push("WORLD_ID_VERIFY_URL not configured");
  }

  return {
    configured: issues.length === 0,
    issues,
  };
}
