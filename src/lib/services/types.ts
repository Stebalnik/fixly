export type Category = {
  slug: string;
  title: string;
  shortTitle?: string;
  description?: string;
  icon?: string;
  subcategories: string[];
};

export type Subcategory = {
  slug: string;
  title: string;
  shortTitle: string;
  parentSlug: string;
  description: string;
  commonProblems: string[];
  priceMin: number;
  priceMax: number;
  priceUnit: "flat" | "hourly" | "estimate";
  relatedSlugs: string[];
  formFields: string[];
};