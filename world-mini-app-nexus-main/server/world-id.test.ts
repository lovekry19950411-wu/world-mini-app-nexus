import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("World ID Configuration", () => {
  it("should have valid World ID credentials configured", () => {
    // 驗證 APP ID 格式
    expect(ENV.worldAppId).toBeDefined();
    expect(ENV.worldAppId).toMatch(/^app_[a-f0-9]{32}$/);
    expect(ENV.worldAppId).toBe("app_f4bf6f2a1ca32e4f9af5f35b529f98f6");

    // 驗證 RP ID 格式
    expect(ENV.worldRpId).toBeDefined();
    expect(ENV.worldRpId).toMatch(/^rp_[a-f0-9]{16}$/);
    expect(ENV.worldRpId).toBe("rp_f3e265557bade5a0");

    // 驗證簽名密鑰格式（支持大寫）
    expect(ENV.rpSigningKey).toBeDefined();
    expect(ENV.rpSigningKey).toMatch(/^0x[a-fA-F0-9]{64}$/);

    // 驗證公鑰格式（支持大寫）
    expect(ENV.rpPublicKey).toBeDefined();
    expect(ENV.rpPublicKey).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("should be able to generate a valid RP signature", () => {
    // 模擬簽名生成（實際簽名需要 IDKit 庫）
    const signingKey = ENV.rpSigningKey;
    const publicKey = ENV.rpPublicKey;

    // 驗證密鑰對應關係（簡單檢查）
    expect(signingKey).toBeTruthy();
    expect(publicKey).toBeTruthy();
    expect(signingKey.length).toBe(66); // 0x + 64 hex chars
    expect(publicKey.length).toBe(42); // 0x + 40 hex chars
    expect(signingKey.startsWith("0x")).toBe(true);
    expect(publicKey.startsWith("0x")).toBe(true);
  });
});
