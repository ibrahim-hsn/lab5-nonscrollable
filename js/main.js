/**
 * Single-screen portfolio.
 * The top bar opens and closes panels; the page itself never scrolls.
 * Vanilla JavaScript, no dependencies.
 */

const EMAIL = "Ibrahim..bin.hsn@gmail.com";

document.addEventListener("DOMContentLoaded", () => {
  const panels = new Map(
    [...document.querySelectorAll(".panel")].map((el) => [el.id.replace("panel-", ""), el])
  );
  const triggers = [...document.querySelectorAll("[data-panel]")];
  const scrim = document.getElementById("scrim");
  const menu = document.getElementById("menu");
  const menuBtn = document.getElementById("menu-btn");

  // On phones, multi-column panels become tabs so nothing needs scrolling.
  document.querySelectorAll(".panel").forEach((panel) => {
    const group = panel.querySelector(".cols-2, .cols-3, .cols-contact");
    if (!group) return;
    const panes = [...group.children];
    const bar = document.createElement("div");
    bar.className = "tabs";
    bar.setAttribute("role", "tablist");
    const select = (i) => {
      panes.forEach((p, n) => p.classList.toggle("pane-on", n === i));
      [...bar.children].forEach((b, n) => b.setAttribute("aria-selected", String(n === i)));
    };
    panes.forEach((p, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tab";
      b.setAttribute("role", "tab");
      b.textContent = p.dataset.label;
      b.addEventListener("click", () => select(i));
      bar.appendChild(b);
    });
    group.before(bar);
    select(0);
  });

  let current = null;
  let lastTrigger = null;

  function setMenu(open) {
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  function show(name, { focus = true, trigger = null } = {}) {
    const next = panels.has(name) ? name : null;
    if (trigger) lastTrigger = trigger;

    panels.forEach((el, key) => el.classList.toggle("open", key === next));
    scrim.classList.toggle("on", next !== null);

    const active = next || "about";
    triggers.forEach((t) => {
      if (t.classList.contains("nav-link")) {
        t.setAttribute("aria-current", String(t.dataset.panel === active));
      }
    });

    history.replaceState(null, "", "#" + active);

    if (next && focus) {
      panels.get(next).querySelector(".close").focus({ preventScroll: true });
    } else if (!next && focus && lastTrigger) {
      lastTrigger.focus({ preventScroll: true });
    }
    current = next;
  }

  triggers.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const name = link.dataset.panel;
      setMenu(false);
      // Clicking the link for the open panel closes it.
      show(name === current ? "about" : name, { trigger: link });
    });
  });

  document.querySelectorAll(".panel .close").forEach((btn) =>
    btn.addEventListener("click", () => show("about"))
  );

  scrim.addEventListener("click", () => show("about", { focus: false }));

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (menu.classList.contains("open")) setMenu(false);
    else if (current) show("about");
  });

  menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));

  // Open the panel named in the URL, e.g. index.html#projects
  const fromHash = () => show(location.hash.slice(1), { focus: false });
  window.addEventListener("hashchange", fromHash);
  fromHash();

  // Contact form: opens the visitor's email app with the message filled in.
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get("name");
      const subject = encodeURIComponent(`Portfolio message from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${data.get("email")}\n\n${data.get("message")}`
      );
      showToast("Opening your email app to send this message.");
      form.reset();
      window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    });
  }
});

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 4000);
}
