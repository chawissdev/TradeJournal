// Single-user gate. Only this email may sign in.
// Override in Vercel with env ALLOWED_EMAIL if you ever change address.
export const ALLOWED_EMAIL = (
  process.env.ALLOWED_EMAIL ?? "skychawiss@gmail.com"
)
  .trim()
  .toLowerCase();

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ALLOWED_EMAIL;
}
