
export type Subcategory = {
  slug: string;
  title: string;
  shortTitle: string;
  parentSlug: string;
  description: string;
  commonProblems: string[];
  priceMin: number;
  priceMax: number;
  priceUnit: "flat" | "hourly" | "sqft";
  relatedSlugs: string[];
  formFields: string[];
};

export type SubcategoryMap = Record<string, Subcategory>;