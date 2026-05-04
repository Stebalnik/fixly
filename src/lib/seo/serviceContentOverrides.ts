import { handymanOverrides } from "./overrides/handyman";
import { plumbingOverrides } from "./overrides/plumbing";
import { electricalOverrides } from "./overrides/electrical";
import { appliancesOverrides } from "./overrides/appliances";
import { cleaningOverrides } from "./overrides/cleaning";
import { remodelingOverrides } from "./overrides/remodeling";
import { roofingOverrides } from "./overrides/roofing";
import { flooringOverrides } from "./overrides/flooring";
import { lawnOverrides } from "./overrides/lawn";
import { paintingOverrides } from "./overrides/painting";
import { pressureOverrides } from "./overrides/pressure";
import { hvacOverrides } from "./overrides/hvac";
import { garageOverrides } from "./overrides/garage"
import { pestOverrides } from "./overrides/pest";
import { movingOverrides } from "./overrides/moving";
import { maintenanceOverrides } from "./overrides/maintenance";

export const serviceContentOverrides = {
  ...handymanOverrides,
  ...plumbingOverrides,
  ...electricalOverrides,
  ...appliancesOverrides,
  ...cleaningOverrides,
  ...remodelingOverrides,
  ...roofingOverrides,
  ...flooringOverrides,
  ...lawnOverrides,
  ...paintingOverrides,
  ...pressureOverrides,
  ...hvacOverrides,
  ...garageOverrides,
  ...pestOverrides,
  ...movingOverrides,
  ...maintenanceOverrides,
};