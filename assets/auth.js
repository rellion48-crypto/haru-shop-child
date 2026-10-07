/* ===========================================================
   로그인 상태를 묻는 코드는 이 파일 한 곳에만 있습니다.
   모든 화면이 <script type="module" src="assets/auth.js"> 로 불러 씁니다.
   - 헤더의 <span id="auth-nav"> 안에 로그인/마이페이지/로그아웃을 그린다
   - <body data-require-login> 인 화면은 로그인 확인이 끝나기 전에는 숨기고,
     로그인하지 않았으면 login.html 로 돌려보낸다
   - data-logout 이 붙은 단추를 누르면 로그아웃하고 첫 화면으로 간다
   =========================================================== */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, onAuthStateChanged, sendEmailVerification, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// index.html 에 있는 설정과 같은 값
const firebaseConfig = {
  apiKey: "AIzaSyAopBL38Hpv4C7VIDG1Od8V6DGPh6wc1Ws",
  authDomain: "gansik-shop.firebaseapp.com",
  projectId: "gansik-shop",
  storageBucket: "gansik-shop.firebasestorage.app",
  messagingSenderId: "860199711922",
  appId: "1:860199711922:web:1f268269d214a3b3fc45ab"
};

// 같은 화면의 다른 코드가 이미 앱을 만들었으면 그것을 쓴다
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const slot = document.getElementById("auth-nav");
const needLogin = document.body.hasAttribute("data-require-login");
let leaving = false; // 로그아웃 단추로 나가는 중이면 login.html 로 보내지 않는다

function el(tag, text, attrs) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  Object.keys(attrs || {}).forEach(k => node.setAttribute(k, attrs[k]));
  return node;
}

// 헤더에 로그인 상태를 그린다 (이메일은 화면에만 쓰고 어디에도 보내지 않는다)
function renderNav(user) {
  if (!slot) return;
  slot.textContent = "";
  if (!user) {
    slot.appendChild(el("a", "로그인", { href: "login.html" }));
    return;
  }
  slot.appendChild(el("span", user.email, { class: "auth-email" }));
  slot.appendChild(el("a", "마이페이지", { href: "mypage.html" }));
  slot.appendChild(el("button", "로그아웃", { type: "button", class: "auth-logout", "data-logout": "" }));
}

onAuthStateChanged(auth, async user => {
  renderNav(user);
  if (!needLogin) return;

  if (!user) {
    if (leaving) return;
    // 원래 가려던 화면 이름을 달아서 login.html 로 보낸다
    let page = location.pathname.split("/").pop() || "index.html";
    if (!/\.html$/.test(page)) page += ".html";
    location.replace("login.html?next=" + encodeURIComponent(page));
    return;
  }

  // 열 때마다 인증 여부를 서버에 새로 묻는다 (못 묻게 되면 저장된 값을 쓴다)
  try { await user.reload(); } catch (e) { /* 저장된 값 사용 */ }
  document.querySelectorAll("[data-verify-box]").forEach(node => { node.hidden = user.emailVerified; });

  // 로그인 확인이 끝났으니 숨겨 둔 내용을 보여 준다
  document.querySelectorAll("[data-auth-email]").forEach(node => { node.textContent = user.email; });
  document.querySelectorAll("[data-auth-gate]").forEach(node => { node.hidden = false; });
});

document.addEventListener("click", e => {
  if (!e.target.closest("[data-logout]")) return;
  leaving = true;
  signOut(auth)
    .then(() => { location.href = "index.html"; })
    .catch(() => { leaving = false; });
});

// 「인증 메일 다시 보내기」 단추
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-resend-verify]");
  if (!btn || !auth.currentUser) return;
  const msg = document.querySelector("[data-verify-msg]");
  const say = text => { if (msg) msg.textContent = text; };
  btn.disabled = true;
  auth.languageCode = "ko";
  sendEmailVerification(auth.currentUser)
    .then(() => say("인증 메일을 보냈습니다. 메일함과 스팸함을 확인해 주세요."))
    .catch(err => say(err && err.code === "auth/too-many-requests" ? "잠시 뒤에 다시 눌러 주세요." : (err && err.code) || "오류가 발생했습니다"))
    .finally(() => { btn.disabled = false; });
});
