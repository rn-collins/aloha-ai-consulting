/* Aloha AI University — shared behavior (progressive enhancement) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---- Mobile menu ---- */
  var burger = document.querySelector(".nav__burger");
  var links = document.getElementById("nav-links");
  if (burger && links) {
    var close = function () {
      links.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    };
    var toggle = function () {
      var open = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    };
    burger.addEventListener("click", toggle);
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) {
        close();
        burger.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1000) close();
    });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Current year ---- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Email reveal (footer + contact) ---- */
  document.querySelectorAll("[data-email-reveal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var a = ["collins", "ra"].join(".") + "@" + ["northeastern", "edu"].join(".");
      var out = document.getElementById(btn.getAttribute("aria-controls"));
      if (out) out.innerHTML = '<a id="email-reveal" href="mailto:' + a + '">' + a + "</a>";
      btn.setAttribute("disabled", "disabled");
      btn.textContent = "Email revealed";
    });
  });
})();
