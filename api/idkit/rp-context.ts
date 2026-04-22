export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const appId = process.env.VITE_WORLD_APP_ID || '';
    const apiKey = process.env.VITE_WORLD_RP_ID || '';

    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/request-permission`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          app_id: appId,
          action: 'verify-human',
        }),
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
