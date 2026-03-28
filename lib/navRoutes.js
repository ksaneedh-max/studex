export const TAB_ROUTES = [
  "/attendance",
  "/marks",
  "/dashboard",
  "/timetable",
  "/planner",
];

export function getRouteIndex(pathname) {
  return TAB_ROUTES.findIndex(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function getSwipeDirection(fromPath, toPath) {
  const fromIndex = getRouteIndex(fromPath);
  const toIndex = getRouteIndex(toPath);

  if (fromIndex === -1 || toIndex === -1) return 1;
  if (toIndex === fromIndex) return 0;

  return toIndex > fromIndex ? 1 : -1;
}