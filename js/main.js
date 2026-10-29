/**
 * Non-scrolling panel portfolio — vanilla JS, no dependencies.
 * Ibrahim Bin Hassan
 *
 * - The home view (About) always fills the screen.
 * - Each nav item slides a panel in from the right over a scrim.
 * - Inside a panel, a left rail switches the content on the right.
 */

document.addEventListener("DOMContentLoaded", () => {
  const scrim = document.getElementById("scrim");
  const navLinks = Array.from(document.querySelectorAll(".nav-link, .brand"));
  const panels = Array.from(document.querySelectorAll(".panel"));
  const menu = document.getElementById("menu");
  const menuBtn = document.getElementById("menu-btn");

  let openId = null;        // currently open panel id, or null (home)
  let lastTrigger = null;   // element to return focus to on close

  /* ---- Active nav state --------------------------------------------------- */
  const setActiveNav = (panelName) => {
    document.querySelectorAll(".nav-link").forEach((link) => {
      const match = link.getAttribute("data-panel") === panelName;
      link.classList.toggle("active", match);
      if (match) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  /* ---- Open / close panels ------------------------------------------------ */
  const closePanel = (returnFocus = true) => {
    if (openId) {
      const el = document.getElementById(openId);
      if (el) el.classList.remove("open");
    }
    scrim.classList.remove("show");
    openId = null;
    setActiveNav("about");
    if (returnFocus && lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  };

  const openPanel = (name, trigger) => {
    const panel = document.getElementById("panel-" + name);
    if (!panel) { closePanel(); return; }        // "about" or unknown → home

    if (openId && openId !== panel.id) {
      const prev = document.getElementById(openId);
      if (prev) prev.classList.remove("open");
    }

    lastTrigger = trigger || lastTrigger;
    panel.classList.add("open");
    scrim.classList.add("show");
    openId = panel.id;
    setActiveNav(name);

    const closeBtn = panel.querySelector(".close");
    if (closeBtn) closeBtn.focus();
  };

  /* ---- Delegated clicks on anything with data-panel ----------------------- */
  document.querySelectorAll("[data-panel]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const name = el.getAttribute("data-panel");
      if (menu) menu.classList.remove("open");
      if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
      if (name === "about") closePanel();
      else openPanel(name, el);
    });
  });

  /* ---- Close controls ----------------------------------------------------- */
  panels.forEach((panel) => {
    const closeBtn = panel.querySelector(".close");
    if (closeBtn) closeBtn.addEventListener("click", () => closePanel());
  });

  if (scrim) scrim.addEventListener("click", () => closePanel());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (openId) closePanel();
      else if (menu && menu.classList.contains("open")) {
        menu.classList.remove("open");
        if (menuBtn) { menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); }
      }
    }
  });

  /* ---- Mobile menu -------------------------------------------------------- */
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  /* ---- Build the interactive left-rail switcher inside each panel --------- */
  panels.forEach((panel) => {
    const container = panel.querySelector(".cols-2, .cols-3, .cols-contact");
    if (!container) return;
    const items = Array.from(container.children).filter((c) => c.hasAttribute("data-label"));
    if (items.length < 2) return;

    const layout = document.createElement("div");
    layout.className = "switch-layout";
    const rail = document.createElement("div");
    rail.className = "switch-rail";
    rail.setAttribute("role", "tablist");
    rail.setAttribute("aria-orientation", "vertical");

    container.replaceWith(layout);
    layout.appendChild(rail);
    layout.appendChild(container);
    container.classList.add("switch-stack");

    const tabs = [];

    const select = (idx, focusTab) => {
      items.forEach((item, i) => { item.hidden = i !== idx; });
      tabs.forEach((tab, i) => {
        const on = i === idx;
        tab.classList.toggle("active", on);
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
      });
      if (focusTab) tabs[idx].focus();
    };

    items.forEach((item, i) => {
      const base = panel.id + "-tab-" + i;
      if (!item.id) item.id = base + "-panel";   // keep an existing id (e.g. #contact-form)
      item.classList.add("switch-item");
      item.setAttribute("role", "tabpanel");
      item.setAttribute("tabindex", "0");
      item.setAttribute("aria-labelledby", base);
      item.hidden = i !== 0;

      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "switch-tab" + (i === 0 ? " active" : "");
      tab.id = base;
      tab.textContent = item.getAttribute("data-label");
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", item.id);
      tab.setAttribute("aria-selected", String(i === 0));
      tab.tabIndex = i === 0 ? 0 : -1;
      tab.addEventListener("click", () => select(i));
      rail.appendChild(tab);
      tabs.push(tab);
    });

    rail.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); select((i + 1) % tabs.length, true); }
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
      else if (e.key === "Home") { e.preventDefault(); select(0, true); }
      else if (e.key === "End") { e.preventDefault(); select(tabs.length - 1, true); }
    });
  });

  /* ---- Contact form: honest mailto handoff -------------------------------- */
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const val = (id) => (document.getElementById(id)?.value || "").trim();
      const name = val("sender-name");
      const email = val("sender-email");
      const message = val("sender-message");

      const subject = encodeURIComponent(`[Portfolio] Message from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

      showToast("Opening your email app…");
      window.location.href = `mailto:Ibrahim..bin.hsn@gmail.com?subject=${subject}&body=${body}`;
    });
  }
});

/* Toast helper */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 4000);
}
