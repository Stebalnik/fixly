import { handymanOverrides } from "./overrides/handyman";
import { plumbingOverrides } from "./overrides/plumbing";
import { electricalOverrides } from "./overrides/electrical";
import { appliancesOverrides } from "./overrides/appliances";
import { cleaningOverrides } from "./overrides/cleaning";

export const serviceContentOverrides = {
  ...handymanOverrides,
  ...plumbingOverrides,
  ...electricalOverrides,
  ...appliancesOverrides,
  ...cleaningOverrides,
};