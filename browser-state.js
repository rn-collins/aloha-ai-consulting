(function () {
  'use strict';

  function byId(id) { return document.getElementById(id); }
  function focus(target) { if (target && typeof target.focus === 'function') { target.setAttribute('tabindex', '-1'); target.focus(); } }
  function show(target) { if (target) target.hidden = false; }
  function hide(target) { if (target) target.hidden = true; }

  function create(options) {
    var settings = options || {};
    var form = typeof settings.form === 'string' ? byId(settings.form) : settings.form;
    var result = typeof settings.result === 'string' ? byId(settings.result) : settings.result;
    var errors = typeof settings.errors === 'string' ? byId(settings.errors) : settings.errors;
    var status = typeof settings.status === 'string' ? byId(settings.status) : settings.status;
    var trigger = form && form.querySelector('[type="submit"]');
    var initial = settings.initial || 'Complete the required inputs to create a private, on-device result.';

    function setStatus(message, tone) {
      if (status) { status.textContent = message; status.dataset.state = tone || 'ready'; show(status); }
      if (window.AlohaActions) window.AlohaActions.announce(message, tone === 'error' ? 'error' : undefined);
    }
    function invalid(messages) {
      var list = (messages || []).filter(Boolean);
      if (errors) {
        errors.innerHTML = '<p><strong>Complete this before generating a result.</strong></p><ul>' + list.map(function (message) { return '<li>' + escapeHtml(message) + '</li>'; }).join('') + '</ul>';
        show(errors); focus(errors);
      }
      hide(result);
      setStatus(list.length + ' input ' + (list.length === 1 ? 'issue' : 'issues') + ' must be resolved.', 'error');
      return { ok: false, errors: list };
    }
    function complete(html, message) {
      hide(errors);
      if (result) { result.innerHTML = html; show(result); focus(result); }
      setStatus(message || 'Result generated in this browser.', 'complete');
      return { ok: true };
    }
    function reset() {
      hide(errors);
      if (result) { result.innerHTML = '<p class="muted">' + escapeHtml(initial) + '</p>'; hide(result); }
      setStatus('Cleared. No result is active.', 'reset');
      focus(trigger || form);
    }
    function unknown(value) { return value === '__unknown'; }
    function notApplicable(value) { return value === '__na'; }
    return Object.freeze({ invalid: invalid, complete: complete, reset: reset, setStatus: setStatus, unknown: unknown, notApplicable: notApplicable });
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (mark) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[mark];
    });
  }

  window.AlohaState = Object.freeze({ version: '1.0.0', create: create, escapeHtml: escapeHtml });
}());
