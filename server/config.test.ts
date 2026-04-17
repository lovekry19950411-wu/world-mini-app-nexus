import { describe, it, expect } from "vitest";
import { checkWorldIdEnvironment } from "./_core/worldIdConfig";
import { checkContractEnvironment } from "./_core/contractIntegration";

describe("Configuration Validation", () => {
  it("should have World ID App ID configured", () => {
    const appId = process.env.VITE_WORLD_ID_APP_ID;
    expect(appId).toBeDefined();
    expect(appId).toMatch(/^app_/);
  });

  it("should have World ID API Key configured", () => {
    const apiKey = process.env.WORLD_ID_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^rp_/);
  });

  it("should have valid contract address format", () => {
    const contractAddress = process.env.NEXUS_CONTRACT_ADDRESS;
    expect(contractAddress).toBeDefined();
    expect(contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("should have valid RPC URL", () => {
    const rpcUrl = process.env.WORLD_CHAIN_RPC;
    expect(rpcUrl).toBeDefined();
    expect(rpcUrl).toMatch(/^https?:\/\//);
  });

  it("should have World Chain ID configured", () => {
    const chainId = process.env.WORLD_CHAIN_ID || "480";
    expect(parseInt(chainId)).toBe(480);
  });

  it("should have World ID verify URL configured", () => {
    const verifyUrl = process.env.WORLD_ID_VERIFY_URL || "https://api.worldcoin.org/v1/verify";
    expect(verifyUrl).toBeDefined();
    expect(verifyUrl).toMatch(/^https?:\/\//);
  });

  it("should have World ID action configured", () => {
    const action = process.env.VITE_WORLD_ID_ACTION;
    expect(action).toBeDefined();
    expect(action).toBe("verify_human");
  });
});
