import { describe, it, expect } from 'vitest';

describe('Thirdweb Configuration', () => {
  it('should have THIRDWEB_PROJECT_ID configured', () => {
    const projectId = process.env.THIRDWEB_PROJECT_ID;
    expect(projectId).toBeDefined();
    expect(projectId).toBe('prj_cmo2exwmt0p06ao0ly7xx0eyv');
  });

  it('should have THIRDWEB_CLIENT_ID configured', () => {
    const clientId = process.env.THIRDWEB_CLIENT_ID;
    expect(clientId).toBeDefined();
    expect(clientId).toBe('97be35194227cd826cb1360db80df9b5');
  });

  it('should have NEXUS_CONTRACT_ADDRESS configured', () => {
    const contractAddress = process.env.NEXUS_CONTRACT_ADDRESS;
    expect(contractAddress).toBeDefined();
    expect(contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('should have WORLD_CHAIN_RPC configured', () => {
    const rpc = process.env.WORLD_CHAIN_RPC;
    expect(rpc).toBeDefined();
    expect(rpc).toContain('http');
  });

  it('should have WORLD_CHAIN_ID configured', () => {
    const chainId = process.env.WORLD_CHAIN_ID;
    expect(chainId).toBeDefined();
    expect(chainId).toBe('480');
  });
});
