import { signRequest } from '@worldcoin/idkit-core/signing';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { action } = req.body || { action: 'verify-human' };

    const { sig, nonce, createdAt, expiresAt } = signRequest({
      signingKeyHex: process.env.RP_SIGNING_KEY!,
      action: action || 'verify-human',
    });

    return res.status(200).json({
      sig,
      nonce,
      created_at: createdAt,
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error('RP sign error:', error);
    return res.status(500).json({ error: String(error) });
  }
}
