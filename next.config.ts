import type { NextConfig } from "next";

// O perfil público não carrega script de terceiros nem faz requisição para
// fora, então a CSP pode ser restritiva. `unsafe-inline` aparece porque o Next
// injeta estilos e scripts de hidratação inline; trocar por nonce exigiria
// middleware por requisição em todas as rotas.
// Em desenvolvimento o webpack embrulha os módulos em eval() para o HMR, então
// sem 'unsafe-eval' a hidratação não acontece e o `npm run dev` fica quebrado.
// O build de produção não usa eval, e lá a diretiva não é liberada.
const isDevelopment = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // O avatar do perfil é editável e pode apontar para qualquer host https.
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
