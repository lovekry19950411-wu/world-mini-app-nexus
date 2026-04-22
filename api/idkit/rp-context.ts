export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const nonce = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 3600000).toISOString();
    const action = req.body?.action || 'verify-human';
    
    const message = JSON.stringify({ nonce, createdAt, expiresAt, action });
    
    const { createSign } = await import('crypto');
    const signingKey = (process.env.RP_SIGNING_KEY || '').replace('0x', '');
    
    const sign = createSign('SHA256');
    sign.update(message);
    const sig = '0x' + sign.sign({
      key: Buffer.from(signingKey, 'hex'),
      format: 'der',
      type: 'pkcs8',
      dsaEncoding: 'ieee-p1363',
    } as any, 'hex');

    return res.status(200).json({
      sig,
      nonce,
      created_at: createdAt,
      expires_at: expiresAt,
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
