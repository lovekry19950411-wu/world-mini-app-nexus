export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const appId = process.env.VITE_WORLD_APP_ID || '';
    const rpId = process.env.VITE_WORLD_RP_ID || '';
    const signingKey = process.env.RP_SIGNING_KEY || '';

    // Log to debug
    console.log('appId:', appId ? 'SET' : 'MISSING');
    console.log('rpId:', rpId ? 'SET' : 'MISSING');
    console.log('signingKey:', signingKey ? 'SET' : 'MISSING');

    const { createRPRequestJWT } = await import('@worldcoin/idkit-server');
    
    const token = await createRPRequestJWT({
      app_id: appId as `app_${string}`,
      action: 'verify-human',
      signal: '',
      credential_types: ['orb'],
    }, {
      rp_id: rpId,
      signing_key: signingKey,
    });

    return res.status(200).json({ rp_context: token });
  } catch (error) {
    console.error('RP context error:', error);
    return res.status(500).json({ error: String(error) });
  }
}
