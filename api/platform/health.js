module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const persistenceReady = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  const platformEnabled = process.env.PLATFORM_PUBLIC_AUTH_ENABLED === 'true';
  const environment = process.env.PLATFORM_ENV || process.env.VERCEL_ENV || 'development';

  return res.status(persistenceReady && platformEnabled ? 200 : 503).json({
    ok: persistenceReady && platformEnabled,
    service: 'aloha-ai-platform',
    environment,
    version: 'foundation-v1',
    boundaries: {
      publicLab: 'browser-local',
      authenticatedPlatform: persistenceReady && platformEnabled ? 'available' : 'unavailable',
      externalDelivery: 'disabled-until-approval-gate'
    },
    timestamp: new Date().toISOString()
  });
};
