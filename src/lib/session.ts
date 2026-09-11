import { cookies } from "next/headers";

const COOKIE = "learner_id";

export function getOrCreateLearnerId() {
  const store = cookies();
  const existing = store.get(COOKIE)?.value;

  if (existing) return existing;

  // Cookie creation is handled by middleware.
  // This fallback keeps the function safe if called without the cookie.
  return crypto.randomUUID();
}