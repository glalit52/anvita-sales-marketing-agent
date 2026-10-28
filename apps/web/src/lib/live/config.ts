/**
 * Live mode: when NEXT_PUBLIC_API_URL is set, the app signs in against the Anvita API and the connected
 * screens read and write real data. Without it the app runs on the bundled demo data (the GitHub Pages demo).
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
export const LIVE = API_URL !== "";
