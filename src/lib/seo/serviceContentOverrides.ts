import { handymanOverrides } from "./overrides/handyman";
import { plumbingOverrides } from "./overrides/plumbing";
import { electricalOverrides } from "./overrides/electrical";
import { appliancesOverrides } from "./overrides/appliances";
import { cleaningOverrides } from "./overrides/cleaning";
import { remodelingOverrides } from "./overrides/remodeling";

export const serviceContentOverrides = {
  ...handymanOverrides,
  ...plumbingOverrides,
  ...electricalOverrides,
  ...appliancesOverrides,
  ...cleaningOverrides,
  ...remodelingOverrides,
};