export type IntentGroup =
  | "urgency"
  | "availability"
  | "price"
  | "trust"
  | "property"
  | "cleaning"
  | "commercial";

export type IntentPriority = 1 | 2 | 3;

export type ServiceIntent = {
  slug: string;
  title: string;
  seoTitleSuffix: string;
  description: string;
  group: IntentGroup;
  priority: IntentPriority;
  indexable: boolean;
};