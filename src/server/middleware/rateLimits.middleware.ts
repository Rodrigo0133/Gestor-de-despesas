import { rateLimit } from "express-rate-limit";

export const dashboard_limit = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Demasiados pedidos. Tenta novamente dentro de um minuto.",
  },
});

export const login_limit = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Demasiadas tentativas de autenticação. Tenta novamente dentro de um minuto.",
  },
})