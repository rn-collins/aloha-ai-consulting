const crypto = require('crypto');

const required = ['SUPABASE_URL','SUPABASE_ANON_KEY'];

function config() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    const error = new Error(`Missing platform configuration: ${missing.join(', ')}`);
    error.statusCode = 503;
    throw error;
  }
  return {
    url: process.env.SUPABASE_URL.replace(/\/$/, ''),
    anon: process.env.SUPABASE_ANON_KEY,
    service: process.env.SUPABASE_SERVICE_ROLE_KEY || null
  };
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const index = part.indexOf('=');
    return [part.slice(0,index).trim(), decodeURIComponent(part.slice(index + 1))];
  }));
}

function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearCookie(name) { return cookie(name, '', 0); }

async function supabase(path, {method='GET', body, accessToken, service=false, headers={}}={}) {
  const cfg = config();
  if (service && !cfg.service) {
    const error = new Error('Service-role access is not configured');
    error.statusCode = 503;
    throw error;
  }
  const key = service ? cfg.service : cfg.anon;
  const response = await fetch(`${cfg.url}${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken || key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const error = new Error(data?.message || data?.msg || `Supabase request failed (${response.status})`);
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

async function session(req) {
  const cookies = parseCookies(req);
  let accessToken = cookies.aloha_access;
  const refreshToken = cookies.aloha_refresh;
  if (!accessToken && !refreshToken) return null;
  try {
    const user = await supabase('/auth/v1/user', {accessToken});
    return {user, accessToken, refreshed:false};
  } catch (error) {
    if (!refreshToken) return null;
    const auth = await supabase('/auth/v1/token?grant_type=refresh_token', {method:'POST', body:{refresh_token:refreshToken}});
    return {user:auth.user, accessToken:auth.access_token, refreshToken:auth.refresh_token, expiresIn:auth.expires_in, refreshed:true};
  }
}

async function requireSession(req, res) {
  const current = await session(req);
  if (!current) {
    res.status(401).json({ok:false,error:'authentication_required'});
    return null;
  }
  if (current.refreshed) {
    res.setHeader('Set-Cookie', [cookie('aloha_access', current.accessToken, current.expiresIn || 3600), cookie('aloha_refresh', current.refreshToken, 60*60*24*30)]);
  }
  return current;
}

function hash(value) { return crypto.createHash('sha256').update(String(value)).digest('hex'); }
function slug(value) { return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,63); }
function jsonError(res, error) {
  const status = Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 500;
  const code = status === 500 ? 'internal_error' : 'request_failed';
  res.status(status).json({ok:false,error:code});
}
function method(req,res,allowed) {
  res.setHeader('Cache-Control','no-store');
  if (!allowed.includes(req.method)) { res.setHeader('Allow',allowed); res.status(405).json({ok:false,error:'method_not_allowed'}); return false; }
  return true;
}

module.exports = {config,supabase,session,requireSession,cookie,clearCookie,hash,slug,jsonError,method};
