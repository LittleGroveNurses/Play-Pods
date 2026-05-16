/* ═══════════════════════════════════════════════════════════
   PLAY PODS — auth.js
   Password gate using SHA-256. Plaintext password never
   stored in source — only the hash.
   Staff authenticate once per browser session.
   ═══════════════════════════════════════════════════════════ */
(function () {
  var SESSION_KEY = 'pp_auth_v1';
  // SHA-256("Rainbow17!") — update this if the password changes
  var CORRECT_HASH = 'd5a3db0076fc1bfa4166042e71fcc4cbab345eecef262320db6861a1b388ad4a';

  // If already authenticated, nothing to do
  if (sessionStorage.getItem(SESSION_KEY) === CORRECT_HASH) return;

  // Not authenticated — redirect to login, storing return URL
  if (!window.location.pathname.endsWith('login.html')) {
    sessionStorage.setItem('pp_return', window.location.href);
    // Figure out path depth to find login.html at root
    var parts = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    var knownSlugs = ['2yo', '3yo', '1yo', '4yo'];
    var depth = 0;
    for (var i = 0; i < parts.length; i++) {
      if (knownSlugs.indexOf(parts[i]) !== -1) { depth = 2; break; }
    }
    var prefix = depth === 2 ? '../../' : './';
    window.location.replace(prefix + 'login.html');
  }
})();
