(() => {
  const copy = {
    expired: ["State · expired", "The synthetic hold expired.", "No seat or payment exists. A live journey would return to session selection and require a fresh availability check."],
    error: ["State · support hold", "The demonstration reached a safe stop.", "Nothing was submitted or charged. A live journey would preserve the participant's deadline, show a support route, and prevent duplicate actions."],
    closed: ["State · registration closed", "This session is not accepting registrations.", "No waitlist is implied. A live waitlist would be separate, optional, uncharged, and require affirmative consent."],
    clarify: ["State · clarify", "Human review needs one bounded question.", "A live reviewer could ask one non-sensitive question. The participant would not be asked to disclose case facts or confidential material."],
    deferred: ["State · deferred", "The case is not ready for this clinic.", "No payment or seat exists. A live response would explain the minimum non-sensitive condition needed to reconsider fit."],
    declined: ["State · declined", "This case does not fit the group clinic boundary.", "No payment or seat exists. A live response would provide a neutral reason category and an appropriate referral or safer next step."]
  };
  const render = (container, state, title, detail) => {
    container.innerHTML = `<p class="eyebrow">${state}</p><h3>${title}</h3><p>${detail}</p>`;
    container.focus();
  };
  document.querySelectorAll("[data-journey]").forEach((form) => {
    const result = form.querySelector("[data-journey-result]");
    const initial = result.innerHTML;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const boxes = [...form.querySelectorAll('input[type="checkbox"]')];
      const missing = boxes.filter((box) => !box.checked).length;
      if (missing) {
        render(result, "State · needs attention", "The synthetic fit check is incomplete.", `${missing} required condition${missing === 1 ? "" : "s"} remain unchecked. Nothing was submitted, stored, sent, booked, or charged.`);
        return;
      }
      if (form.dataset.journey === "clinic") {
        render(result, "State · screening preview", "The synthetic case could proceed to human review.", "This is not acceptance. A live reviewer—not an automated score—would decide accept, clarify, defer, or decline before payment.");
      } else {
        render(result, "State · eligible preview", "The synthetic participant could proceed to session selection.", "Registration remains inactive. No session, price, inventory, checkout, confirmation, or participant record exists.");
      }
    });
    form.addEventListener("reset", () => requestAnimationFrame(() => { result.innerHTML = initial; result.focus(); }));
  });
  document.querySelectorAll("[data-preview-state]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = button.closest(".program-section").querySelector("[data-journey-result]");
      const [state, title, detail] = copy[button.dataset.previewState];
      render(result, state, title, detail);
    });
  });
})();
