import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SignJWT, importPKCS8 } from 'jose';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signingKey = process.env.RP_SIGNING_KEY!;
    const appId = process.env.VITE_WORLD_APP_ID!;
    const rpId = process.env.VITE_WORLD_RP_ID!;

    const privateKey = await importPKCS8(
      `-----BEGIN PRIVATE KEY-----\n${Buffer.from(signingKey.replace('0x', ''), 'hex').toString('base64')}\n-----END PRIVATE KEY-----`,
      'ES256'
    );

    const token = await new SignJWT({
      app_id: appId,
      rp_id: rpId,
      action: 'verify-human',
    })
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(privateKey);

    return res.status(200).json({ rp_context: token });
  } catch (error) {
    console.error('RP context error:', error);
    return res.status(500).json({ error: 'Failed to generate RP context' });
  }
}
