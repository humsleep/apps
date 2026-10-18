// Turns every <a data-store> into the App Store button once config.js has an address.
(function () {
  var links = document.querySelectorAll("a[data-store]");
  for (var i = 0; i < links.length; i++) {
    var a = links[i];
    if (typeof APP_STORE_URL === "string" && APP_STORE_URL) {
      a.href = APP_STORE_URL;
      a.removeAttribute("aria-disabled");
      a.textContent = a.getAttribute("data-store");
    }
  }
})();
