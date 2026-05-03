import { handymanOverrides } from "./overrides/handyman";
import { plumbingOverrides } from "./overrides/plumbing";

export const serviceContentOverrides = {
  ...handymanOverrides,
  ...plumbingOverrides,
};