import { SignJWT } from 'jose';
import { createPrivateKey } from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const signingKey = (process.env.RP_SIGNING_KEY || '').replace('0x', '');
    if (!signingKey || signingKey.length < 64) {
      return res.status(500).json({ error: 'RP_SIGNING_KEY not configured' });
    }
    const rawKey = Buffer.from(signingKey, 'hex');
    const p256Header = Buffer.from(
      '3041020100301306072a8648ce3d020106082a8648ce3d030107042730250201010420',
      'hex'
    );
    const pkcs8Der = Buffer.concat([p256Header, rawKey]);
    const privateKey = createPrivateKey({ key: pkcs8Der, format: 'der', type: 'pkcs8' });
    const nonce = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const appId = process.env.WORLD_APP_ID;
    const rpId = process.env.WORLD_RP_ID;
    const token = await new SignJWT({
      app_id: appId,
      rp_id: rpId,
      action: req.body?.action || 'nexus',
      nonce,
    })
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(privateKey);
    return res.status(200).json({
      sig: token,
      nonce,
      created_at: new Date(now * 1000).toISOString(),
      expires_at: new Date((now + 3600) * 1000).toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
