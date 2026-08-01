(function () {
  'use strict';

  var form = document.querySelector('[data-contextual-intake]');
  if (!form) return;

  var query = new URLSearchParams(window.location.search);
  var allowedBranches = new Set(Array.from(form.elements.inquiry_type.options).map(function (option) { return option.value; }));
  var context = {
    source_route: safe(query.get('source')) || 'direct',
    offer_id: safe(query.get('offer')) || 'not-sure',
    offer_label: safe(query.get('label')) || 'I am not sure yet',
    audience: safe(query.get('audience')),
    industry: safe(query.get('industry')),
    inquiry_type: allowedBranches.has(query.get('branch')) ? query.get('branch') : 'not-sure'
  };
  var attributionKey = 'aloha-ai-conversion-attribution/v1';
  var attributionTtlMs = 30 * 60 * 1000;
  retainAttribution('contact-view');

  Object.keys(context).forEach(function (name) {
    if (form.elements[name]) form.elements[name].value = context[name];
  });
  var title = document.querySelector('[data-intake-context-title]');
  var summary = document.querySelector('[data-intake-context-summary]');
  if (title) title.textContent = context.offer_label;
  if (summary) summary.textContent = context.source_route === 'direct'
    ? 'You arrived directly. Choose the closest inquiry type; “I am not sure” is a valid answer.'
    : 'This intake preserved your starting route: ' + context.source_route + '. You can change the inquiry type below.';

  var review = document.querySelector('[data-intake-review]');
  var recordNode = document.querySelector('[data-intake-record]');
  var status = document.querySelector('[data-intake-status]');
  var currentRecord = null;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var values = Object.fromEntries(new FormData(form).entries());
    currentRecord = {
      schema: 'aloha-ai-scoping-record/v1',
      created_at: new Date().toISOString(),
      transmission_state: 'not-submitted',
      context: pick(values, ['source_route', 'offer_id', 'offer_label', 'audience', 'industry', 'inquiry_type']),
      decision: pick(values, ['problem', 'desired_change', 'organization', 'decision_maker', 'urgency', 'decision_date']),
      operating_context: pick(values, ['systems', 'data_classification', 'jurisdiction', 'authority', 'budget', 'maintenance']),
      requested_next_step: pick(values, ['preferred_next_step', 'timing']),
      boundaries: {
        sensitive_documents_requested: false,
        creates_professional_relationship: false,
        capacity_reserved: false
      }
    };
    recordNode.textContent = JSON.stringify(currentRecord, null, 2);
    review.hidden = false;
    status.textContent = 'Scoping record created locally. It has not been submitted.';
    retainAttribution('record-created');
    review.focus();
  });

  form.addEventListener('reset', function () {
    window.setTimeout(function () {
      Object.keys(context).forEach(function (name) { if (form.elements[name]) form.elements[name].value = context[name]; });
      currentRecord = null;
      review.hidden = true;
      status.textContent = 'Intake reset. Nothing was submitted.';
    }, 0);
  });

  document.querySelector('[data-copy-record]').addEventListener('click', function () {
    if (!currentRecord) return;
    var text = JSON.stringify(currentRecord, null, 2);
    copyText(text, 'Scoping record copied. It has not been submitted.');
  });

  document.querySelector('[data-download-record]').addEventListener('click', function () {
    if (!currentRecord) return;
    if (!window.AlohaActions) return;
    var result = window.AlohaActions.download({
      content: JSON.stringify(currentRecord, null, 2),
      filename: 'aloha-ai-scoping-record-v1.json',
      mimeType: 'application/json;charset=utf-8',
      version: '1.0.0',
      license: 'Private visitor-generated scoping record; not submitted.'
    });
    status.textContent = result.ok ? 'Scoping record downloaded. It has not been submitted.' : 'The scoping record could not be downloaded. Its text remains available above.';
  });

  var booking = document.querySelector('[data-contextual-booking]');
  if (booking) booking.addEventListener('click', function () {
    retainAttribution('booking-opened');
    status.textContent = 'Opening the current booking provider. Your scoping record is not attached or submitted.';
  });

  var copyBooking = document.querySelector('[data-copy-booking-summary]');
  if (copyBooking) copyBooking.addEventListener('click', function () {
    if (!currentRecord) return;
    copyText(bookingSummary(currentRecord), 'Booking summary copied. Paste it into the booking note; it was not sent automatically.');
  });

  var clearAttribution = document.querySelector('[data-clear-attribution]');
  if (clearAttribution) clearAttribution.addEventListener('click', function () {
    try { window.sessionStorage.removeItem(attributionKey); } catch (error) {}
    status.textContent = 'Local source and offer context cleared. Nothing was submitted.';
  });

  function copyText(text, successMessage) {
    if (!window.AlohaActions) {
      status.textContent = 'Copy is unavailable. Select the visible text and copy it manually.';
      return;
    }
    window.AlohaActions.copyText(text, {
      success: successMessage,
      failure: 'Copy is unavailable. Select the visible text and copy it manually.'
    }).then(function (result) { status.textContent = result.ok ? successMessage : 'Copy is unavailable. Select the visible text and copy it manually.'; });
  }

  function bookingSummary(record) {
    return [
      'Aloha AI scoping context (not submitted through the website)',
      'Offer: ' + (record.context.offer_label || 'I am not sure'),
      'Inquiry type: ' + (record.context.inquiry_type || 'not-sure'),
      'Source: ' + (record.context.source_route || 'direct'),
      'Preferred next step: ' + (record.requested_next_step.preferred_next_step || ''),
      'Timing: ' + (record.requested_next_step.timing || ''),
      '',
      'I will describe the problem during the call. No sensitive material is included in this note.'
    ].join('\n');
  }

  function retainAttribution(eventName) {
    var now = Date.now();
    var payload = {
      schema: attributionKey,
      event: eventName,
      source_route: context.source_route,
      offer_id: context.offer_id,
      inquiry_type: context.inquiry_type,
      recorded_at: new Date(now).toISOString(),
      expires_at: new Date(now + attributionTtlMs).toISOString()
    };
    try {
      var prior = JSON.parse(window.sessionStorage.getItem(attributionKey) || 'null');
      if (prior && Date.parse(prior.expires_at) <= now) window.sessionStorage.removeItem(attributionKey);
      window.sessionStorage.setItem(attributionKey, JSON.stringify(payload));
    } catch (error) {}
    window.dispatchEvent(new CustomEvent('aloha-ai:conversion', { detail: payload }));
  }

  function pick(source, keys) {
    return keys.reduce(function (result, key) { result[key] = source[key] || ''; return result; }, {});
  }

  function safe(value) {
    return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 500);
  }
}());
