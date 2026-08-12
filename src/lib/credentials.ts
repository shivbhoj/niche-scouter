/**
 * Pure credential validation, deliberately free of any next-auth import
 * so it can be unit tested (and reused) without pulling in the auth
 * runtime.
 */

export const MIN_PASSWORD_LENGTH = 6;
/**
 * bcrypt only consumes the first 72 bytes, so anything beyond that is
 * silently ignored rather than adding strength — two different long
 * passwords would verify against the same hash. Rejecting is clearer
 * than truncating, and stops a huge body being fed to a slow hash.
 */
export const MAX_PASSWORD_LENGTH = 72;
export const MAX_EMAIL_LENGTH = 254;

export function validateCredentials(rawEmail: unknown, rawPassword: unknown) {
  if (typeof rawEmail !== "string" || typeof rawPassword !== "string") return null;

  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword;

  if (!email || email.length > MAX_EMAIL_LENGTH) return null;
  // Deliberately permissive; real deliverability is proven by sending
  // mail, not by a regex.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (password.length < MIN_PASSWORD_LENGTH) return null;
  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_LENGTH) return null;

  return { email, password };
}
