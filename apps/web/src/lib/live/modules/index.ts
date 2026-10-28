/**
 * Live data loaders per route. Before a screen renders in live mode, the loader for its route fills the
 * lib/mock collections that screen reads (the same pattern as store.ts), so components work unchanged
 * on demo data and on the real workspace. Each module file also exports the mutations its screens call.
 */
type Loader = (pathname: string) => Promise<unknown>;

const lazy =
  (mod: () => Promise<{ load: Loader }>): Loader =>
  async (pathname) =>
    (await mod()).load(pathname);

export const ROUTE_LOADERS: { prefix: string; load: Loader }[] = [
  { prefix: "/pipeline", load: lazy(() => import("./sell")) },
  { prefix: "/calendar", load: lazy(() => import("./sell")) },
  { prefix: "/payments", load: lazy(() => import("./sell")) },
  { prefix: "/agent", load: lazy(() => import("./agent")) },
  { prefix: "/settings", load: lazy(() => import("./settings")) },
  { prefix: "/integrations", load: lazy(() => import("./settings")) },
  { prefix: "/prospecting", load: lazy(() => import("./outbound")) },
  { prefix: "/sequences", load: lazy(() => import("./outbound")) },
  { prefix: "/campaigns", load: lazy(() => import("./outbound")) },
  { prefix: "/reviews", load: lazy(() => import("./growth")) },
  { prefix: "/analytics", load: lazy(() => import("./growth")) },
  { prefix: "/automations", load: lazy(() => import("./growth")) },
  { prefix: "/marketing", load: lazy(() => import("./marketing")) },
];

export const loaderFor = (pathname: string) =>
  ROUTE_LOADERS.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`))?.load;
