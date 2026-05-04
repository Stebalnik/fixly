import { cleaningLegacyRoutes } from "./cleaning";
import { coreLegacyRoutes } from "./core";
import { electricalLegacyRoutes } from "./electrical";
import { handymanLegacyRoutes } from "./handyman";
import { appliancesLegacyRoutes } from "./appliances";
import { miscLegacyRoutes } from "./misc";
import { paintingLegacyRoutes } from "./painting";
import { plumbingLegacyRoutes } from "./plumbing";
import { propertyMaintenanceLegacyRoutes } from "./propertyMaintenance";
import { remodelingLegacyRoutes } from "./remodeling";
import { roofingLegacyRoutes } from "./roofing";
import { flooringLegacyRoutes } from "./flooring";
import type { LegacyServiceRoute, LegacyServiceRouteMap } from "./types";

export type { LegacyRouteType, LegacyServiceRoute } from "./types";

export const legacyServiceRoutes: LegacyServiceRouteMap = {
  ...coreLegacyRoutes,
  ...handymanLegacyRoutes,
  ...plumbingLegacyRoutes,
  ...electricalLegacyRoutes,
  ...cleaningLegacyRoutes,
  ...paintingLegacyRoutes,
  ...roofingLegacyRoutes,
  ...remodelingLegacyRoutes,
  ...propertyMaintenanceLegacyRoutes,
  ...miscLegacyRoutes,
  ...appliancesLegacyRoutes,
    ...flooringLegacyRoutes,
};

export function getLegacyServiceRoute(
  path: string
): LegacyServiceRoute | null {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");
  return legacyServiceRoutes[normalizedPath] ?? null;
}