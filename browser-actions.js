(function () {
  'use strict';

  var liveRegion;

  function announce(message, tone) {
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.className = 'visually-hidden';
      liveRegion.setAttribute('role', tone === 'error' ? 'alert' : 'status');
      liveRegion.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveRegion);
    }
    liveRegion.setAttribute('role', tone === 'error' ? 'alert' : 'status');
    liveRegion.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
    liveRegion.textContent = '';
    window.setTimeout(function () { liveRegion.textContent = String(message || ''); }, 0);
    return message;
  }

  function legacyCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    area.remove();
    return copied;
  }

  function copyText(text, options) {
    var settings = options || {};
    var value = String(text == null ? '' : text);
    var success = settings.success || 'Copied to the clipboard.';
    var failure = settings.failure || 'Copy is unavailable. Select the text and copy it manually.';
    if (!value) {
      announce(settings.empty || 'There is no content to copy.', 'error');
      return Promise.resolve({ ok: false, reason: 'empty' });
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value).then(function () {
        announce(success);
        return { ok: true, method: 'clipboard' };
      }, function () {
        if (legacyCopy(value)) {
          announce(success);
          return { ok: true, method: 'legacy' };
        }
        announce(failure, 'error');
        return { ok: false, reason: 'permission-denied-or-unavailable' };
      });
    }
    if (legacyCopy(value)) {
      announce(success);
      return Promise.resolve({ ok: true, method: 'legacy' });
    }
    announce(failure, 'error');
    return Promise.resolve({ ok: false, reason: 'clipboard-unavailable' });
  }

  function download(options) {
    var settings = options || {};
    var filename = String(settings.filename || '').trim();
    var mimeType = String(settings.mimeType || 'text/plain;charset=utf-8');
    if (!filename || settings.content == null) {
      announce(settings.failure || 'The file could not be prepared.', 'error');
      return { ok: false, reason: 'invalid-export-contract' };
    }
    try {
      var blob = settings.content instanceof Blob ? settings.content : new Blob([settings.content], { type: mimeType });
      var href = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = href;
      link.download = filename;
      link.hidden = true;
      if (settings.license) link.dataset.license = settings.license;
      if (settings.version) link.dataset.version = settings.version;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(href); }, 0);
      announce(settings.success || ('Downloaded ' + filename + '.'));
      return { ok: true, filename: filename, mimeType: mimeType };
    } catch (error) {
      announce(settings.failure || 'The browser could not save this file.', 'error');
      return { ok: false, reason: 'download-failed' };
    }
  }

  function storage(storageType) {
    var target = storageType === 'local' ? window.localStorage : window.sessionStorage;
    return {
      get: function (key) {
        try { return { ok: true, value: target.getItem(key) }; }
        catch (error) { return { ok: false, value: null, reason: 'storage-unavailable' }; }
      },
      set: function (key, value) {
        try { target.setItem(key, value); return { ok: true }; }
        catch (error) { announce('Browser storage is unavailable. Your work will remain in this page only.', 'error'); return { ok: false, reason: 'storage-unavailable' }; }
      },
      remove: function (key) {
        try { target.removeItem(key); return { ok: true }; }
        catch (error) { return { ok: false, reason: 'storage-unavailable' }; }
      }
    };
  }

  window.AlohaActions = Object.freeze({
    version: '1.0.0',
    announce: announce,
    copy: copyText,
    copyText: copyText,
    download: download,
    storage: storage
  });
}());
