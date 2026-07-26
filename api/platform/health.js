module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const configured = {
    supabaseUrl: Boolean(process.env.SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.SUPABASE_ANON_KEY),
    supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  };

  const persistenceReady = Object.values(configured).every(Boolean);
  const environment = process.env.PLATFORM_ENV || process.env.VERCEL_ENV || 'development';

  return res.status(persistenceReady ? 200 : 503).json({
    ok: persistenceReady,
    service: 'aloha-ai-platform',
    environment,
    version: 'foundation-v1',
    boundaries: {
      publicLab: 'browser-local',
      authenticatedPlatform: persistenceReady ? 'configured' : 'awaiting-environment-variables',
      externalDelivery: 'disabled-until-approval-gate'
    },
    configured,
    timestamp: new Date().toISOString()
  });
};
