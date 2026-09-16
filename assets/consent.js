/* ===========================================================
   동의 배너 — 광고·분석 저장 신호를 기본 거부로 두고,
   손님이 고른 값을 브라우저에 기억합니다.
   이 파일은 태그 관리자 스크립트보다 먼저 실행되어야 합니다.
   =========================================================== */

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});

(function () {
  const KEY = "haru_consent";

  function grant() {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted'
    });
  }

  function showLink() {
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = "동의 다시 고르기";
    link.style.cssText = "position:fixed;left:12px;bottom:8px;font-size:12px;color:#666;background:#fff;padding:2px 6px;border-radius:4px;z-index:9999;";
    link.addEventListener("click", e => {
      e.preventDefault();
      link.remove();
      showBanner();
    });
    document.body.appendChild(link);
  }

  function showBanner() {
    const bar = document.createElement("div");
    bar.id = "consent-banner";
    bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;padding:12px;background:#222;color:#fff;font-size:14px;z-index:10000;";
    bar.innerHTML = "<span>이 사이트는 광고·분석을 위해 저장을 사용할 수 있습니다.</span>";

    const reject = document.createElement("button");
    reject.type = "button";
    reject.textContent = "거부";
    reject.style.cssText = "padding:6px 14px;border:0;border-radius:4px;background:#555;color:#fff;cursor:pointer;";

    const accept = document.createElement("button");
    accept.type = "button";
    accept.textContent = "수락";
    accept.style.cssText = "padding:6px 14px;border:0;border-radius:4px;background:#2ecc71;color:#04331d;cursor:pointer;";

    reject.addEventListener("click", () => {
      localStorage.setItem(KEY, "denied");
      bar.remove();
      showLink();
    });

    accept.addEventListener("click", () => {
      grant();
      localStorage.setItem(KEY, "granted");
      bar.remove();
      showLink();
    });

    bar.appendChild(reject);
    bar.appendChild(accept);
    document.body.appendChild(bar);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem(KEY);
    if (saved === "granted") {
      grant();
      showLink();
    } else if (saved === "denied") {
      showLink();
    } else {
      showBanner();
    }
  });
})();
