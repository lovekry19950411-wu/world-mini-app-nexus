import { SignJWT } from 'jose';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const appId = process.env.VITE_WORLD_APP_ID || '';
    const rpId = process.env.VITE_WORLD_RP_ID || '';
    const signingKey = (process.env.RP_SIGNING_KEY || '').replace('0x', '');
    const { createPrivateKey } = await import('crypto');
    const privateKey = createPrivateKey({
      key: Buffer.from(signingKey, 'hex'),
      format: 'der',
      type: 'pkcs8',
    });
    const token = await new SignJWT({ app_id: appId, rp_id: rpId })
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(privateKey);
    return res.status(200).json({ rp_context: token });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
