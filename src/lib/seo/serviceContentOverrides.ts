import { handymanOverrides } from "./overrides/handyman";
import { plumbingOverrides } from "./overrides/plumbing";
import { electricalOverrides } from "./overrides/electrical";
import { appliancesOverrides } from "./overrides/appliances";

export const serviceContentOverrides = {
  ...handymanOverrides,
  ...plumbingOverrides,
  ...electricalOverrides,
  ...appliancesOverrides,
};