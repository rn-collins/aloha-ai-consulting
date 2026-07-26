'use strict';

const PROVIDERS = Object.freeze({
  anthropic: { env: 'ANTHROPIC_API_KEY', endpoint: 'https://api.anthropic.com/v1/messages' },
  openai: { env: 'OPENAI_API_KEY', endpoint: 'https://api.openai.com/v1/responses' },
  google: { env: 'GOOGLE_GENERATIVE_AI_API_KEY', endpoint: 'https://generativelanguage.googleapis.com' }
});

class GatewayError extends Error {
  constructor(code, message, status = 500, details = {}) {
    super(message); this.name = 'GatewayError'; this.code = code; this.status = status; this.details = details;
  }
}

function requireProvider(provider) {
  const config = PROVIDERS[provider];
  if (!config) throw new GatewayError('unsupported_provider', `Unsupported model provider: ${provider}`, 400);
  if (!process.env[config.env]) throw new GatewayError('provider_not_configured', `${provider} is not configured`, 503);
  return config;
}

function normalizeRequest(input = {}) {
  const provider = String(input.provider || '').toLowerCase();
  const model = String(input.model || '').trim();
  const messages = Array.isArray(input.messages) ? input.messages : [];
  if (!provider || !model || messages.length === 0) {
    throw new GatewayError('invalid_request', 'provider, model, and messages are required', 400);
  }
  return {
    provider,
    model,
    messages: messages.map(({ role, content }) => ({ role: String(role), content: String(content) })),
    temperature: Number.isFinite(input.temperature) ? Math.max(0, Math.min(1, input.temperature)) : 0,
    maxTokens: Number.isInteger(input.maxTokens) ? Math.max(1, Math.min(8192, input.maxTokens)) : 1200,
    policyVersion: String(input.policyVersion || 'v1'),
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {}
  };
}

function evaluatePreflight(request) {
  const text = request.messages.map(message => message.content).join('\n');
  const checks = [
    { key: 'prompt_injection', outcome: /ignore (all|any|previous)|system prompt|developer message/i.test(text) ? 'block' : 'pass' },
    { key: 'secret_request', outcome: /(api key|password|service role|access token)/i.test(text) ? 'block' : 'pass' },
    { key: 'guaranteed_outcome', outcome: /guarantee(d)?|risk[- ]free|certain return/i.test(text) ? 'warn' : 'pass' },
    { key: 'human_review_required', outcome: 'warn' }
  ];
  return { checks, blocked: checks.some(check => check.outcome === 'block') };
}

async function generate(input, context = {}) {
  const request = normalizeRequest(input);
  requireProvider(request.provider);
  const preflight = evaluatePreflight(request);
  if (preflight.blocked) {
    throw new GatewayError('guardrail_block', 'The request was blocked before model execution', 422, { checks: preflight.checks });
  }

  // Provider adapters are intentionally isolated. No request is sent until the
  // corresponding adapter is implemented, evaluated, and explicitly enabled.
  throw new GatewayError('adapter_disabled', 'Provider adapter exists as a contract but external model execution is disabled', 503, {
    provider: request.provider,
    model: request.model,
    policyVersion: request.policyVersion,
    preflight: preflight.checks,
    requestId: context.requestId || null
  });
}

module.exports = { PROVIDERS, GatewayError, normalizeRequest, evaluatePreflight, generate };
