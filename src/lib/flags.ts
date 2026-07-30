/**
 * Switches for things that are built but not turned on.
 *
 * These live in a plain module, not in auth-actions.ts, because that file is
 * "use server": a client component cannot import a constant from it. Keeping
 * the flag here means the server action and the button that triggers it read
 * the SAME value — flip it once and both the UI and the behaviour follow.
 */

/**
 * Is the Google provider configured in Supabase?
 *
 * Flip to true ONLY after enabling it in Supabase → Authentication →
 * Providers → Google, with a client ID/secret from Google Cloud.
 *
 * This flag is needed because signInWithOAuth() happily builds an authorize
 * URL even when the provider is off — the failure only happens after the
 * browser has already left the app, and Supabase answers with raw JSON
 * ("Unsupported provider: provider is not enabled"). Sending someone to that
 * is worse than telling them here.
 */
export const GOOGLE_ATIVO = false;
