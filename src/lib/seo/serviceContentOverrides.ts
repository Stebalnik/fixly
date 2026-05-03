import { handymanOverrides } from "./overrides/handyman";
// потом добавишь:
/// import { plumbingOverrides } from "./overrides/plumbing";

export const serviceContentOverrides = {
  ...handymanOverrides,
  // ...plumbingOverrides
};