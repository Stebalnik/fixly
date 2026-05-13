import type { MarketRelations } from "@/lib/geo/types";

export const curatedMarketRelations: Record<string, Partial<MarketRelations>> =
  {
    "atlanta-ga": {
      neighborhoods: [
        { slug: "midtown", name: "Midtown" },
        { slug: "buckhead", name: "Buckhead" },
        { slug: "downtown-atlanta", name: "Downtown Atlanta" },
        { slug: "old-fourth-ward", name: "Old Fourth Ward" },
        { slug: "virginia-highland", name: "Virginia-Highland" },
      ],

      metroMarkets: [
        "decatur-ga",
        "sandy-springs-ga",
        "brookhaven-ga",
        "marietta-ga",
      ],
    },

    "chicago-il": {
      neighborhoods: [
        { slug: "lincoln-park", name: "Lincoln Park" },
        { slug: "wicker-park", name: "Wicker Park" },
        { slug: "logan-square", name: "Logan Square" },
        { slug: "river-north", name: "River North" },
        { slug: "hyde-park", name: "Hyde Park" },
      ],

      metroMarkets: [
        "evanston-il",
        "oak-park-il",
        "skokie-il",
        "cicero-il",
        "naperville-il",
      ],
    },

    "dallas-tx": {
      neighborhoods: [
        { slug: "uptown", name: "Uptown" },
        { slug: "oak-lawn", name: "Oak Lawn" },
        { slug: "deep-ellum", name: "Deep Ellum" },
        { slug: "bishop-arts-district", name: "Bishop Arts District" },
        { slug: "lakewood", name: "Lakewood" },
      ],

      metroMarkets: [
        "irving-tx",
        "garland-tx",
        "plano-tx",
        "richardson-tx",
        "arlington-tx",
      ],
    },

    "new-york-ny": {
      neighborhoods: [
        { slug: "upper-west-side", name: "Upper West Side" },
        { slug: "upper-east-side", name: "Upper East Side" },
        { slug: "soho", name: "SoHo" },
        { slug: "chelsea", name: "Chelsea" },
        { slug: "greenwich-village", name: "Greenwich Village" },
      ],

      metroMarkets: [
        "brooklyn-ny",
        "queens-ny",
        "bronx-ny",
        "yonkers-ny",
        "new-rochelle-ny",
      ],
    },

    "miami-fl": {
      neighborhoods: [
        { slug: "brickell", name: "Brickell" },
        { slug: "wynwood", name: "Wynwood" },
        { slug: "coconut-grove", name: "Coconut Grove" },
        { slug: "coral-way", name: "Coral Way" },
        { slug: "design-district", name: "Design District" },
      ],

      metroMarkets: [
        "miami-beach-fl",
        "coral-gables-fl",
        "hialeah-fl",
        "north-miami-fl",
        "doral-fl",
      ],
    },
  };