"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const peso = n => "₱" + n.toFixed(2);

/* ---------- Fare data ---------- */
const FARE = {
  items: [
    { label: "Base fare", note: "First 2 km", amt: 45.0 },
    { label: "Distance fee", note: "5.2 km × ₱4.50/km", amt: 23.4 },
    { label: "Service fee", note: "Platform & insurance", amt: 6.0 },
    { label: "Rush-hour adjustment", note: "High demand 5–8 PM", amt: 8.0, extra: true },
  ],
  raincoat: false,
};
const RAIN = { label: "Rent-A-Raincoat", note: "Safety add-on", amt: 49.0, extra: true };
const fareItems = () => FARE.raincoat ? [...FARE.items, RAIN] : FARE.items;
const fareTotal = () => fareItems().reduce((s, i) => s + i.amt, 0);

function renderFare() {
  const total = fareTotal();
  $("#fareList").innerHTML = fareItems().map(i =>
    `<div class="line ${i.extra ? "extra" : ""}"><span>${i.label}<small>${i.note}</small></span><b>${peso(i.amt)}</b></div>`
  ).join("");
  $("#fareTotal").textContent = peso(total);
  $("#confirmBook").textContent = `Confirm Booking · ${peso(total)}`;
  $$(".tot, .bookPrice, #paidAmt").forEach(e => e.textContent = peso(total));
}
$("#rainBtn").onclick = () => {
  FARE.raincoat = !FARE.raincoat;
  $("#rainBtn").classList.toggle("on", FARE.raincoat);
  $("#rainPlus").textContent = FARE.raincoat ? "✓" : "+";
  renderFare();
};

/* ---------- Map (SVG) ---------- */
function mapSVG(withRoute) {
  const roads = [
    "M0 330 L390 300", "M0 420 L390 400", "M0 250 L390 220", "M60 0 L100 844", "M180 0 L210 844",
    "M300 0 L280 844", "M0 560 L390 540", "M0 150 L390 130", "M120 100 L330 260", "M20 700 L370 640",
    "M0 70 L390 60", "M0 640 L390 620",
  ].map(d => `<path d="${d}" stroke="#fff" stroke-width="9" fill="none"/>`).join("");
  const creek = `<path d="M70 120 C110 220 90 300 160 380 S250 470 220 560" stroke="#9ADBF2" stroke-width="4" fill="none"/>`;
  const hwy = `<path d="M0 360 C120 330 250 340 390 320" stroke="#7C93B0" stroke-width="16" fill="none"/>
    <rect x="214" y="330" width="34" height="16" rx="3" fill="#6BA36B"/><text x="220" y="342" font-size="10" fill="#fff" font-weight="700">R-6</text>`;
  const labels = `<text x="22" y="318" font-size="11" fill="#5B6B7C">Sumulong Hwy</text>
    <text x="230" y="470" font-size="11" fill="#5B6B7C">Marcos Hwy</text>
    <circle cx="70" cy="215" r="11" fill="#F36C21"/><text x="84" y="219" font-size="11" fill="#F36C21" font-weight="700">Jollibee</text>
    <circle cx="300" cy="150" r="11" fill="#13AEE6"/><text x="238" y="130" font-size="11" fill="#13AEE6" font-weight="700">SM City Masinag</text>
    <text x="30" y="620" font-size="11" fill="#5B6B7C">Antipolo City</text>`;
  const route = withRoute
    ? `<path d="M120 300 L120 360 L260 345 L300 200" stroke="#13AEE6" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M300 200 m0 -22 a10 10 0 1 1 0.01 0" fill="#F36C21"/><circle cx="300" cy="200" r="7" fill="#F36C21" stroke="#fff" stroke-width="2"/>
       <circle cx="120" cy="300" r="14" fill="#1E7FD8" opacity=".22"/><circle cx="120" cy="300" r="7" fill="#fff" stroke="#1E7FD8" stroke-width="4"/>
       <circle cx="190" cy="352" r="15" fill="#13AEE6" stroke="#fff" stroke-width="3"/><g transform="translate(175 337) scale(1.25)" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.2" cy="16.4" r="3.4"/><circle cx="18.8" cy="16.4" r="3.4"/><path d="M5.2 16.4l4.3-5.9H15l3.8 5.9"/><path d="M8.8 10.5L7.4 8h3.4"/></g>`
    : `<circle cx="150" cy="300" r="50" fill="#2B8CE0" opacity=".18"/><circle cx="150" cy="300" r="9" fill="#2B8CE0" stroke="#fff" stroke-width="3"/>`;
  return `<svg viewBox="0 0 390 794" preserveAspectRatio="xMidYMid slice"><rect width="390" height="794" fill="#F2F2F3"/>${roads}${creek}${hwy}${labels}${route}</svg>`;
}
$$(".map").forEach(m => m.innerHTML = mapSVG(m.dataset.route === "1"));

/* ---------- Navigation ---------- */
let current = "booking", timerId = null;
function go(id) {
  current = id;
  closeDrawer();
  $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  $$("#steps li").forEach(li => li.classList.toggle("on", li.dataset.go === id));
  $("#paySheet").classList.remove("open");
  if (id === "matched") startMatching();
  if (id === "chat") openChat();
  if (id === "qr") startQR(); else clearInterval(timerId);
}
document.addEventListener("click", e => {
  const t = e.target.closest("[data-go]");
  if (!t) return;
  if (t.dataset.cash) { $("#paidMethod").textContent = "Cash"; showSuccess(); return; }
  go(t.dataset.go);
});
$("#confirmBook").onclick = () => go("matched");
$("#restart").onclick = $("#backHome").onclick = () => { resetChat(); go("booking"); };
$("#whyBtn").onclick = () => $("#whyBox").classList.toggle("open");

/* drawer */
const openDrawer = () => { $("#drawer").classList.add("on"); $("#scrim").classList.add("on"); };
function closeDrawer() { $("#drawer").classList.remove("on"); $("#scrim").classList.remove("on"); }
$("#menuBtn").onclick = $("#menuBtn2").onclick = openDrawer;
$("#scrim").onclick = closeDrawer;

/* ---------- Toast ---------- */
const ic = id => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><use href="#${id}"/></svg>`;
let toastT;
function toast(title, msg, icon = ic("i-bell")) {
  const t = $("#toast");
  t.innerHTML = `<i>${icon}</i><div><b>${title}</b><small>${msg}</small></div>`;
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("show"), 3500);
}

/* ---------- Matching ---------- */
let matchT;
function startMatching() {
  $("#matchBanner").textContent = "Looking for bikers near you…";
  $("#riderCard").classList.remove("show");
  clearTimeout(matchT);
  matchT = setTimeout(() => {
    $("#matchBanner").textContent = "Your biker will arrive in 4 mins.";
    $("#riderCard").classList.add("show");
    toast("Biker found", "Miguel Reyes is on the way.", ic("i-moto"));
    setTimeout(() => {
      if (!chatStarted && !welcomed) {
        welcomed = true;
        addMsg("in", "Good evening po! I'm on my way to your pickup point.");
        unread++; updateBadge();
        if (current !== "chat") toast("New message", "Miguel Reyes: Good evening po! I'm on my way…", ic("i-chat"));
      }
    }, 1800);
  }, 1800);
}

/* ---------- Chat ---------- */
const msgs = $("#msgs");
let chatStarted = false, unread = 0, welcomed = false;
const fmt = d => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

function resetChat() { msgs.innerHTML = `<span class="day">Today</span>`; chatStarted = false; welcomed = false; unread = 0; updateBadge(); }
resetChat();

function addMsg(who, text) {
  const el = document.createElement("div");
  el.className = "m " + who;
  el.innerHTML = `${text}<div class="t"><span>${fmt(new Date())}</span>${who === "out" ? `<span class="tick">✓</span>` : ""}</div>`;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
  return el;
}
function updateBadge() {
  const b = $("#badge"), ib = $("#inboxBadge");
  b.textContent = unread; b.classList.toggle("on", unread > 0);
  ib.textContent = unread; ib.style.display = unread > 0 ? "grid" : "none"; ib.style.position = "static"; ib.style.display = unread > 0 ? "inline-grid" : "none";
}
function openChat() { unread = 0; updateBadge(); chatStarted = true; msgs.scrollTop = msgs.scrollHeight; }
function sendMsg(text) {
  if (!text.trim()) return;
  const el = addMsg("out", text.replace(/</g, "&lt;"));
  const tick = $(".tick", el);
  setTimeout(() => { tick.textContent = "✓✓"; }, 600);
  setTimeout(() => { tick.classList.add("read"); }, 1500);
  setTimeout(() => {
    $("#chatStatus").textContent = "typing…";
    const ty = document.createElement("div");
    ty.className = "typing"; ty.innerHTML = "<i></i><i></i><i></i>";
    msgs.appendChild(ty); msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => {
      ty.remove();
      $("#chatStatus").textContent = "Online · arriving in 3 mins";
      const replies = ["Noted po!", "Sige po, malapit na ako.", "Opo, nasa labas na po ako ng gate.", "Salamat po!"];
      addMsg("in", replies[Math.floor(Math.random() * replies.length)]);
    }, 1700);
  }, 1900);
}
$("#composer").onsubmit = e => { e.preventDefault(); const i = $("#msgInput"); sendMsg(i.value); i.value = ""; };
$$(".quick button").forEach(b => b.onclick = () => sendMsg(b.textContent));

/* ---------- QR (decorative demo pattern) ---------- */
function drawQR() {
  const N = 25, c = 8;
  let seed = 48213;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const inFinder = (x, y) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  let rects = "";
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let on;
    if (inFinder(x, y)) {
      const fx = x >= N - 8 ? x - (N - 8) : x, fy = y >= N - 8 ? y - (N - 8) : y;
      if (fx > 6 || fy > 6) on = false;
      else on = Math.max(Math.abs(fx - 3), Math.abs(fy - 3)) !== 2;
    } else on = rnd() > 0.5;
    if (on) rects += `<rect x="${x * c}" y="${y * c}" width="${c}" height="${c}"/>`;
  }
  $("#qrcode").innerHTML = `<svg viewBox="0 0 ${N * c} ${N * c}" fill="#1B2733" shape-rendering="crispEdges">${rects}</svg>`;
}
function startQR() {
  drawQR();
  let s = 299;
  clearInterval(timerId);
  const tick = () => {
    $("#timer").textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    if (s-- <= 0) { s = 299; drawQR(); }
  };
  tick(); timerId = setInterval(tick, 1000);
}

/* ---------- Passenger scan & pay ---------- */
$("#doScan").onclick = () => $("#paySheet").classList.add("open");
$$(".w").forEach(w => w.onclick = () => { $$(".w").forEach(x => x.classList.remove("on")); w.classList.add("on"); });
$("#simPay").onclick = () => {
  const b = $("#simPay"), wallet = $(".w.on").textContent;
  b.textContent = `Confirming in ${wallet}…`; b.disabled = true;
  setTimeout(() => {
    b.textContent = "Pay in e-wallet"; b.disabled = false;
    $("#paidMethod").textContent = `QR · ${wallet}`;
    showSuccess();
  }, 1700);
};
function showSuccess() {
  $("#paidAmt").textContent = peso(fareTotal());
  $("#paidTime").textContent = fmt(new Date());
  go("success");
  toast("Payment successful", `${peso(fareTotal())} paid · Ref RHC-48213`, ic("i-check"));
}

/* ---------- Init ---------- */
function clock() { $("#clock").textContent = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); }
clock(); setInterval(clock, 30000);
renderFare(); go("booking");