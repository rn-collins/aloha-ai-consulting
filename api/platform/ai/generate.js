'use strict';

const crypto = require('crypto');
const { generate, GatewayError } = require('../../../lib/platform/ai-gateway');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  try {
    const result = await generate(req.body || {}, { requestId });
    return res.status(200).json({ ok: true, requestId, result });
  } catch (error) {
    if (error instanceof GatewayError) {
      return res.status(error.status).json({ ok: false, requestId, error: error.code, message: error.message, details: error.details });
    }
    return res.status(500).json({ ok: false, requestId, error: 'internal_error' });
  }
};
