/** Customer-facing pages Anvita generates for a business. No app shell. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-bg text-fg">{children}</div>;
}
