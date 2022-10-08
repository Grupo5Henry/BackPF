
//const BACK_URL = 'http://localhost:3001';
const BACK_URL = "https://backpf-production.up.railway.app";
const FRONT_URL = "http://localhost:3000";
//const CORS_URL = 'http://localhost:3000'; //si usamos un wildcard ('*') deja de funcionar la autenticación via Google, pero la local sigue funcionando.
const CORS_URL = "*";
const GOOGLE_CLIENT_ID =
  "825786877679-ue1auo16l6hlu9bh92isbl9g5faol1rg.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";


module.exports = {
  BACK_URL,
  FRONT_URL,
  CORS_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
};
