/**
 * Smart Contract Integration
 * Handles NEXUS token contract interactions
 */

export interface ContractConfig {
  chainId: number;
  contractAddress: string;
  rpcUrl: string;
  privateKey?: string;
}

export interface MintRequest {
  to: string;
  amount: string; // in wei
}

export interface TransferRequest {
  from: string;
  to: string;
  amount: string; // in wei
}

export interface BalanceRequest {
  address: string;
}

/**
 * Format token amount (convert from wei)
 */
export function formatTokenAmount(
  amount: string,
  decimals: number = 18
): string {
  const divisor = Math.pow(10, decimals);
  const num = parseFloat(amount) / divisor;
  return num.toFixed(4);
}

/**
 * Parse token amount (convert to wei)
 */
export function parseTokenAmount(
  amount: string,
  decimals: number = 18
): string {
  const multiplier = Math.pow(10, decimals);
  const num = parseFloat(amount) * multiplier;
  return Math.floor(num).toString();
}

/**
 * Get contract configuration from environment
 */
export function getContractConfig(): ContractConfig {
  const contractAddress = process.env.NEXUS_CONTRACT_ADDRESS;
  const rpcUrl = process.env.WORLD_CHAIN_RPC;
  const chainId = parseInt(process.env.WORLD_CHAIN_ID || "480");

  if (!contractAddress || !rpcUrl) {
    throw new Error(
      "Contract configuration incomplete. Please set NEXUS_CONTRACT_ADDRESS and WORLD_CHAIN_RPC"
    );
  }

  return {
    chainId,
    contractAddress,
    rpcUrl,
    privateKey: process.env.CONTRACT_PRIVATE_KEY,
  };
}

/**
 * Verify contract address format
 */
export function isValidContractAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Verify RPC URL format
 */
export function isValidRpcUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Contract environment check
 */
export function checkContractEnvironment(): {
  configured: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  const contractAddress = process.env.NEXUS_CONTRACT_ADDRESS;
  if (!contractAddress) {
    issues.push("NEXUS_CONTRACT_ADDRESS not configured");
  } else if (!isValidContractAddress(contractAddress)) {
    issues.push("NEXUS_CONTRACT_ADDRESS has invalid format");
  }

  const rpcUrl = process.env.WORLD_CHAIN_RPC;
  if (!rpcUrl) {
    issues.push("WORLD_CHAIN_RPC not configured");
  } else if (!isValidRpcUrl(rpcUrl)) {
    issues.push("WORLD_CHAIN_RPC has invalid format");
  }

  const chainId = process.env.WORLD_CHAIN_ID;
  if (!chainId) {
    issues.push("WORLD_CHAIN_ID not configured");
  } else if (parseInt(chainId) !== 480) {
    issues.push("WORLD_CHAIN_ID should be 480 for World Chain");
  }

  return {
    configured: issues.length === 0,
    issues,
  };
}

/**
 * Create contract interaction response
 */
export function createContractResponse(
  success: boolean,
  data?: {
    txHash?: string;
    balance?: string;
    fee?: string;
  },
  error?: string
) {
  if (success && data) {
    return {
      success: true,
      ...data,
    };
  }

  return {
    success: false,
    error: error || "Contract interaction failed",
  };
}

/**
 * Log contract interaction
 */
export function logContractInteraction(
  method: string,
  success: boolean,
  error?: string
): void {
  const timestamp = new Date().toISOString();
  const status = success ? "SUCCESS" : "FAILED";

  console.log(
    `[Contract] ${timestamp} - ${status} - Method: ${method}${
      error ? ` - Error: ${error}` : ""
    }`
  );
}

/**
 * Validate contract call parameters
 */
export function validateContractParams(
  method: string,
  params: unknown[]
): { valid: boolean; error?: string } {
  if (!method || typeof method !== "string") {
    return { valid: false, error: "Invalid method name" };
  }

  if (!Array.isArray(params)) {
    return { valid: false, error: "Parameters must be an array" };
  }

  return { valid: true };
}

/**
 * Get World Chain information
 */
export function getWorldChainInfo() {
  return {
    name: "World Chain",
    chainId: 480,
    nativeCurrency: "WLD",
    explorer: "https://worldscan.org",
    rpcUrl: process.env.WORLD_CHAIN_RPC || "https://worldchain-mainnet.g.alchemy.com/v2/demo",
  };
}
