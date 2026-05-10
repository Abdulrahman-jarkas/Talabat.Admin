const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7082';

const PROXY_CONFIG = [
  {
    context: [
      // BFF Management Routes
      "/bff",

      // OIDC Handler Routes
      "/signin-oidc",
      "/signout-callback-oidc",

      // API Routes
      "/api",
      "/talabat-api",
    ],
    target,
    secure: false
  }
]

module.exports = PROXY_CONFIG;
