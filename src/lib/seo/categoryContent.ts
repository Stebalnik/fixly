export type CategoryFaqItem = {
  question: string;
  answer: string;
};

export type CategorySeoContent = {
  metaTitle: string;
  metaDescription: string;
  subtitle: string;
  description: string;
  whyChoose: string[];
  faq: CategoryFaqItem[];
};

export type Geo = {
  city: string;
  state: string;
};

export const getCategorySeoContent = (
  geo: Geo
): Record<string, CategorySeoContent> => ({
  electrical: {
    metaTitle: `Electrical Services in ${geo.city} | Licensed Electricians Near You | Fixly`,
    metaDescription: `Find licensed electricians in ${geo.city}, ${geo.state} for electrical repair, wiring, panel upgrades, lighting, and emergency service. Fast response, upfront pricing, and trusted local pros.`,
    subtitle:
      "Licensed Electricians for Safe, Fast, and Professional Electrical Work",
    description: `Looking for reliable electrical services in ${geo.city}? Fixly connects you with licensed electricians for everything from quick electrical repairs to full system upgrades.

Whether you need an electrician near you for outlet repair, ceiling fan installation, wiring upgrades, or panel replacement, our local professionals deliver safe, code-compliant work you can trust. We help homeowners and small businesses across ${geo.state} get fast service, transparent pricing, and high-quality results without the hassle.

Popular services include electrical troubleshooting, lighting installation, breaker panel upgrades, EV charger installation, and emergency electrical repairs. Book an electrician in minutes and get your job done right the first time.`,
    whyChoose: [
      "Licensed and insured electricians you can trust",
      "Same-day and emergency service availability",
      "Upfront pricing with no hidden fees",
      "Code-compliant, safety-first electrical work",
      "Trusted by homeowners and small businesses in your area",
    ],
    faq: [
      {
        question: `How much do electrical services cost in ${geo.city}?`,
        answer:
          "Electrical service costs vary depending on the job type, complexity, and materials. Small repairs like outlet or switch replacement typically start from $90–$150, while larger projects such as panel upgrades or wiring may cost more. You’ll always see transparent pricing before confirming your booking.",
      },
      {
        question: "How do I find a licensed electrician near me?",
        answer: `Fixly makes it easy to hire licensed electricians in ${geo.city}. Submit your request and get matched with qualified local professionals who are experienced, insured, and ready to handle your electrical job safely.`,
      },
      {
        question: "Do you offer emergency electrical services?",
        answer: `Yes. Emergency electricians may be available in ${geo.city} for urgent issues such as power outages, breaker failures, burning smells, or exposed wiring.`,
      },
      {
        question: "What electrical services can I book?",
        answer:
          "You can hire electricians for outlet and switch repair, lighting installation, ceiling fans, wiring replacement, circuit breaker and panel upgrades, EV charger installation, and full electrical inspections.",
      },
      {
        question: "Are your electricians licensed and insured?",
        answer:
          "Yes. All electricians available through Fixly are licensed, insured, and experienced in residential and light commercial electrical work.",
      },
      {
        question: "Do you provide electrical inspections?",
        answer:
          "Yes. You can book electrical safety inspections to identify outdated wiring, overloaded circuits, and potential hazards.",
      },
    ],
  },


  cleaning: {
  metaTitle: `Cleaning Services in ${geo.city} | House Cleaners Near You | Fixly`,
  metaDescription: `Book professional cleaning services in ${geo.city}, ${geo.state} for regular house cleaning, deep cleaning, move-out cleaning, and recurring maid service. Trusted local cleaners, flexible scheduling, and upfront pricing.`,
  subtitle: "Professional House Cleaning for Regular, Deep, and Move-Out Jobs",
  description: `Need reliable cleaning services in ${geo.city}? Fixly helps homeowners request professional house cleaning, maid service, deep cleaning, and move-out cleaning from trusted local cleaners.

Whether you need a one-time clean before guests arrive, recurring weekly or bi-weekly service, or a detailed move-out cleaning before handing back keys, local cleaning pros can review your request and respond with clear next steps.

Common requests include kitchen cleaning, bathroom cleaning, dusting, vacuuming, mopping, sanitizing, appliance cleaning, window add-ons, and eco-friendly cleaning options. Submit your cleaning request in minutes and find cleaners near you without calling multiple companies.`,
  whyChoose: [
    "Vetted local cleaning professionals",
    "Flexible scheduling for one-time or recurring cleaning",
    "Regular, deep, move-in, and move-out cleaning options",
    "Eco-friendly supplies available on request",
    "Clear pricing based on home size, scope, and frequency",
  ],
  faq: [
    {
      question: `How much does house cleaning cost in ${geo.city}?`,
      answer:
        "Standard house cleaning often starts around $100–$140, depending on home size, number of rooms, cleaning frequency, and the condition of the home. Deep cleaning and move-out cleaning usually cost more because they require more time and detail.",
    },
    {
      question: "Can I book recurring cleaning near me?",
      answer: `Yes. You can request weekly, bi-weekly, or monthly cleaning in ${geo.city}. Recurring service is a good option if you want your home to stay consistently clean without scheduling a new appointment every time.`,
    },
    {
      question: "Do cleaners bring their own supplies?",
      answer:
        "Many cleaning professionals bring their own supplies and equipment. You can also mention product preferences, allergies, pets, or eco-friendly cleaning requests when submitting your job.",
    },
    {
      question: "What is included in a standard home cleaning?",
      answer:
        "A standard cleaning usually includes dusting, vacuuming, mopping, bathroom cleaning, kitchen surfaces, sinks, countertops, trash removal, and general tidying. Add-ons may include windows, inside appliances, baseboards, carpet, or upholstery.",
    },
    {
      question: "Do you offer deep cleaning and move-out cleaning?",
      answer:
        "Yes. You can request deep cleaning, move-in cleaning, or move-out cleaning for houses, apartments, rentals, and small properties. These jobs can include appliances, cabinets, bathrooms, floors, baseboards, and final touch-ups.",
    },
    {
      question: "Do I need to be home during the cleaning?",
      answer:
        "Not always. Many homeowners arrange access instructions in advance. You can include details in your request so the cleaner understands how to enter, what areas to clean, and any special instructions.",
    },
  ],
},

  painting: {
  metaTitle: `Painting Services in ${geo.city} | Interior & Exterior Painters Near You | Fixly`,
  metaDescription: `Hire professional painters in ${geo.city}, ${geo.state} for interior painting, exterior painting, popcorn ceiling removal, and fence or deck staining. Clean results, fast booking, and trusted local pros.`,
  subtitle: "Interior & Exterior Painting with Clean, Professional Results",
  description: `Looking for professional painting services in ${geo.city}? Fixly helps homeowners connect with skilled painters for interior painting, exterior painting, wall texturing, and surface refinishing.

Whether you need to refresh a single room, repaint your entire home, remove popcorn ceilings, or stain a fence or deck, local painters handle prep, materials, and finishing with attention to detail. From drywall patching and sanding to priming and final coats, every step is done for a smooth, long-lasting result.

Popular requests include house painters near you, interior wall painting, exterior home painting, popcorn ceiling removal, fence and deck staining, and texture upgrades. Submit your project and get connected with trusted local professionals in minutes.`,
  whyChoose: [
    "Experienced interior and exterior painting professionals",
    "Full prep work: patching, sanding, priming, and finishing",
    "Popcorn ceiling removal and modern wall texturing",
    "Flexible scheduling for small and large painting projects",
    "Clean, detailed work with long-lasting results",
  ],
  faq: [
    {
      question: `How much does painting cost in ${geo.city}?`,
      answer:
        "Interior painting typically starts around $250–$600 per room depending on size, wall condition, and prep work. Exterior painting costs vary based on home size, surfaces, and accessibility. Final pricing depends on project scope and materials.",
    },
    {
      question: "Do painters provide paint and materials?",
      answer:
        "Yes. Many painters can include paint, primer, and materials in the quote, or you can supply your preferred paint brand and color. You can specify this when submitting your request.",
    },
    {
      question: "Do you offer popcorn ceiling removal?",
      answer:
        "Yes. You can request popcorn ceiling removal followed by smoothing or modern texturing. This service includes safe removal, surface prep, and finishing.",
    },
    {
      question: "Do you handle drywall repair before painting?",
      answer:
        "Yes. Painters can repair drywall, patch holes or cracks, sand surfaces, and apply primer before painting to ensure a smooth and even finish.",
    },
    {
      question: "How long does exterior painting take?",
      answer:
        "Most exterior painting projects take 2–5 days depending on home size, weather conditions, and the amount of prep work required.",
    },
    {
      question: "Can I hire painters for fences and decks?",
      answer:
        "Yes. You can book painting or staining for fences, decks, and other outdoor wood surfaces to improve appearance and protect against weather damage.",
    },
  ],
},

  "lawn-care": {
  metaTitle: `Lawn Care & Landscaping in ${geo.city} | Lawn Service Near You | Fixly`,
  metaDescription: `Book lawn care services in ${geo.city}, ${geo.state} including mowing, edging, fertilizing, weed control, aeration, and yard cleanup. Reliable local lawn service with flexible scheduling and upfront pricing.`,
  subtitle: "Professional Lawn Care to Keep Your Yard Healthy, Clean, and Green",
  description: `Looking for reliable lawn care services in ${geo.city}? Fixly helps homeowners request mowing, edging, landscaping, and seasonal yard maintenance from trusted local lawn care professionals.

Whether you need regular lawn mowing, weed control, fertilizing, aeration, or a full seasonal cleanup, local pros can handle everything from basic maintenance to complete yard improvement. Services are available for small yards, standard residential properties, and larger outdoor spaces.

Common requests include lawn mowing near you, yard cleanup, hedge trimming, mulching, fertilization, weed and pest control, and landscaping maintenance. Submit your request in minutes and get connected with local lawn care professionals who keep your yard looking its best year-round.`,
  whyChoose: [
    "Local lawn care professionals experienced with regional grass and conditions",
    "Flexible scheduling for one-time or recurring service",
    "Full-service lawn care: mowing, edging, trimming, and cleanup",
    "Seasonal services including fertilizing, aeration, and overseeding",
    "Transparent pricing based on yard size and service scope",
  ],
  faq: [
    {
      question: `How much does lawn care cost in ${geo.city}?`,
      answer:
        "Lawn mowing typically starts around $45–$80 depending on yard size, terrain, and accessibility. Additional services like fertilizing, aeration, weed control, and cleanup will increase the total cost based on scope.",
    },
    {
      question: "Can I book recurring lawn care service near me?",
      answer: `Yes. You can request weekly or bi-weekly lawn care in ${geo.city} to keep your yard consistently maintained without scheduling each visit manually.`,
    },
    {
      question: "What lawn care services can I request?",
      answer:
        "You can request lawn mowing, edging, trimming, fertilizing, weed control, aeration, overseeding, yard cleanup, hedge trimming, mulching, and general landscaping maintenance.",
    },
    {
      question: "Do you handle large yards and properties?",
      answer:
        "Yes. Lawn care professionals can service small residential lawns, medium-sized yards, and larger properties depending on your needs.",
    },
    {
      question: "Are lawn care services available year-round?",
      answer:
        "Yes. Lawn care services may include mowing during the growing season, leaf cleanup in fall, fertilization and aeration, and seasonal yard preparation throughout the year.",
    },
    {
      question: "Do you offer weed control and fertilizing?",
      answer:
        "Yes. You can request weed control, fertilizing, and lawn treatment services to improve grass health, thickness, and overall appearance.",
    },
  ],
},

  "pressure-washing": {
  metaTitle: `Pressure Washing Services in ${geo.city} | Power Washing Near You | Fixly`,
  metaDescription: `Book pressure washing services in ${geo.city}, ${geo.state} for driveways, siding, decks, fences, and patios. Remove dirt, mold, and stains with safe, professional cleaning.`,
  subtitle: "Professional Pressure Washing for Driveways, Siding, Decks, and Fences",
  description: `Looking for pressure washing services in ${geo.city}? Fixly helps homeowners request exterior cleaning for driveways, siding, fences, decks, patios, and more.

Over time, dirt, mold, mildew, and algae build up on outdoor surfaces, affecting both appearance and safety. Local pressure washing professionals use the right combination of pressure washing and soft washing techniques to clean surfaces without damage.

Common requests include driveway cleaning, house washing, fence washing, deck and patio cleaning, roof and gutter cleaning, and mold or algae removal. Submit your request and connect with local pros who can restore your home's curb appeal quickly and safely.`,
  whyChoose: [
    "Driveway, siding, fence, deck, and patio cleaning",
    "Soft washing for delicate surfaces like siding and wood",
    "Professional equipment for deep and even cleaning",
    "Eco-friendly cleaning solutions available",
    "Fast scheduling for residential and small commercial jobs",
  ],
  faq: [
    {
      question: `How much does pressure washing cost in ${geo.city}?`,
      answer:
        "Driveway pressure washing typically starts around $100–$150 depending on size and condition. Full home exterior washing may start around $250–$400, with final pricing based on surface area and level of buildup.",
    },
    {
      question: "What surfaces can be pressure washed?",
      answer:
        "Pressure washing can be used for driveways, sidewalks, patios, decks, fences, siding, brick, and some roofs. The exact method depends on the surface and condition.",
    },
    {
      question: "Is pressure washing safe for siding and wood?",
      answer:
        "Yes, when done correctly. Professionals often use soft washing for siding, painted surfaces, and wood to avoid damage while still removing dirt, mold, and algae.",
    },
    {
      question: "How often should I pressure wash my home?",
      answer:
        "Most homeowners pressure wash driveways and patios once a year. Siding and exterior surfaces are typically cleaned every 1–2 years depending on weather, shade, and moisture.",
    },
    {
      question: "Do you remove mold, mildew, and algae?",
      answer:
        "Yes. Pressure washing services can include treatments that remove mold, mildew, and algae and help prevent them from returning.",
    },
    {
      question: "Do you offer fence and deck cleaning?",
      answer:
        "Yes. You can request fence washing and deck cleaning to restore wood, remove buildup, and improve the look and lifespan of outdoor surfaces.",
    },
  ],
},

  "junk-removal": {
  metaTitle: `Junk Removal in ${geo.city} | Same-Day Junk Hauling Near You | Fixly`,
  metaDescription: `Book junk removal services in ${geo.city}, ${geo.state} for furniture, appliances, yard waste, and debris. Fast pickup, heavy lifting included, eco-friendly disposal options.`,
  subtitle: "Fast, Affordable Junk Removal — We Handle Loading, Hauling, and Disposal",
  description: `Need junk removal services in ${geo.city}? Fixly helps homeowners quickly get rid of unwanted items with fast, reliable junk hauling from local professionals.

Whether you're clearing out a garage, moving out, replacing furniture, or cleaning up after a renovation, local pros handle everything from heavy lifting to proper disposal. No need to rent a truck or make multiple trips — just submit your request and get it picked up.

Common requests include furniture removal, mattress disposal, appliance hauling, yard waste cleanup, construction debris removal, and full cleanouts for garages, basements, and attics. Many jobs can be scheduled same-day or next-day depending on availability.`,
  whyChoose: [
    "Same-day and next-day junk pickup options",
    "Furniture, appliances, yard waste, and debris removal",
    "Heavy lifting and hauling handled by professionals",
    "Recycling and donation options when available",
    "Transparent pricing based on load size and item type",
  ],
  faq: [
    {
      question: `How much does junk removal cost in ${geo.city}?`,
      answer:
        "Junk removal pricing typically starts around $80–$120 for small loads. The final cost depends on volume, type of items, weight, and ease of access.",
    },
    {
      question: "What items can be removed?",
      answer:
        "You can request removal of furniture, mattresses, appliances, electronics, yard waste, construction debris, boxes, and general household junk.",
    },
    {
      question: "Do you offer same-day junk removal near me?",
      answer:
        `Yes. Same-day or next-day junk removal may be available in ${geo.city} depending on job size and local availability.`,
    },
    {
      question: "Can you remove large or heavy items?",
      answer:
        "Yes. Professionals can remove large items such as couches, refrigerators, washers, dryers, hot tubs, and bulky equipment safely.",
    },
    {
      question: "Do you recycle or donate items?",
      answer:
        "Many junk removal services include recycling and donation options for usable items. Materials like metal, electronics, and furniture may be diverted from landfills when possible.",
    },
    {
      question: "Do you handle full cleanouts?",
      answer:
        "Yes. You can request full cleanouts for garages, basements, attics, storage units, offices, and rental properties.",
    },
  ],
},

  roofing: {
  metaTitle: `Roofing Services in ${geo.city} | Roof Repair & Replacement Near You | Fixly`,
  metaDescription: `Hire roofing contractors in ${geo.city}, ${geo.state} for roof repair, replacement, installation, and storm damage restoration. Licensed roofers, fast response, and free estimates available.`,
  subtitle: "Roof Repair, Replacement & Installation by Licensed Local Roofers",
  description: `Looking for roofing services in ${geo.city}? Fixly helps homeowners connect with experienced roofing contractors for everything from small leak repairs to full roof replacement and new installations.

Whether you're dealing with storm damage, missing shingles, roof leaks, or planning a full upgrade, local roofers can inspect your roof, recommend the right solution, and complete the job with quality materials and proper installation.

Common requests include roof repair near you, roof replacement, shingle installation, metal roofing, storm damage restoration, and roof inspections. Many pros can also assist with insurance-related claims after hail or wind damage. Submit your request and get connected with trusted local roofing professionals.`,
  whyChoose: [
    "Roof repair, replacement, and new installation services",
    "Storm damage restoration and insurance claim support",
    "Roof inspections and preventive maintenance",
    "Multiple roofing materials including shingles and metal",
    "Licensed and insured roofing contractors",
  ],
  faq: [
    {
      question: `How much does roof repair cost in ${geo.city}?`,
      answer:
        "Minor roof repairs such as fixing leaks or replacing shingles may start around $300–$600. Larger repairs or structural issues will cost more depending on the extent of damage and materials required.",
    },
    {
      question: "How much does a roof replacement cost?",
      answer:
        "A full roof replacement typically ranges from $7,000 to $20,000+ depending on roof size, pitch, materials, and labor. You can request an inspection to get an accurate estimate for your property.",
    },
    {
      question: "Do roofers handle storm damage and insurance claims?",
      answer:
        `Yes. Many roofing professionals in ${geo.city} can assess storm damage, provide documentation, and assist with insurance-related repairs after hail, wind, or heavy rain.`,
    },
    {
      question: "How long does a roof replacement take?",
      answer:
        "Most residential roof replacements are completed in 1–3 days depending on roof size, complexity, and weather conditions.",
    },
    {
      question: "What types of roofing materials are available?",
      answer:
        "Common options include asphalt shingles, architectural shingles, metal roofing, and flat or low-slope roofing systems. The best option depends on your budget and property type.",
    },
    {
      question: "Do you offer roof inspections?",
      answer:
        "Yes. You can request roof inspections to check for leaks, damage, or wear and tear, especially after storms or before buying or selling a home.",
    },
  ],
},

  awnings: {
  metaTitle: `Awning Installation & Repair in ${geo.city} | Retractable & Canopy Services | Fixly`,
  metaDescription: `Book awning services in ${geo.city}, ${geo.state} for installation, repair, replacement, and removal. Retractable, fixed, and commercial awnings with fast scheduling and upfront pricing.`,
  subtitle: "Awning Installation, Repair & Replacement for Homes and Businesses",
  description: `Looking for awning installation or repair in ${geo.city}? Fixly helps homeowners and businesses connect with local professionals for retractable awnings, fixed canopies, and custom outdoor shade solutions.

Whether you need a new patio awning, storefront canopy, seasonal setup, or removal of an old unit, local pros handle everything from mounting and alignment to fabric replacement and motorized system installation. Services are available for both residential and commercial properties.

Common requests include retractable awning installation near you, canopy setup, awning repair, frame restoration, fabric replacement, seasonal takedown, and lighting installation. Submit your request and get matched with experienced local contractors.`,
  whyChoose: [
    "Retractable, fixed, and commercial awning solutions",
    "Manual and motorized awning installation options",
    "Frame repair, fabric replacement, and full unit upgrades",
    "Seasonal setup, takedown, and removal services",
    "Residential and commercial installation experience",
  ],
  faq: [
    {
      question: `How much does awning installation cost in ${geo.city}?`,
      answer:
        "Awning installation costs vary depending on type, size, and mounting conditions. Basic installations may start around $250–$500, while larger or motorized systems can cost more.",
    },
    {
      question: "Do you install motorized retractable awnings?",
      answer:
        "Yes. You can request installation of manual or motorized retractable awnings, including remote-controlled and automated systems.",
    },
    {
      question: "Can you remove or replace old awnings?",
      answer:
        "Yes. Professionals can safely remove old or damaged awnings and install replacements, including new frames, fabric, or complete systems.",
    },
    {
      question: "Do you repair awning frames and fabric?",
      answer:
        "Yes. You can request repairs for bent frames, torn fabric, faulty motors, and mounting issues to extend the life of your awning.",
    },
    {
      question: "Do you offer seasonal awning setup and takedown?",
      answer:
        "Yes. Seasonal services may include spring installation, fall removal, and preparation for storage or weather protection.",
    },
    {
      question: "Can awnings be installed for commercial properties?",
      answer:
        "Yes. You can request awning installation, repair, and replacement for storefronts, restaurants, offices, and other commercial spaces.",
    },
  ],
},

  "fence-installation-repair-services": {
  metaTitle: `Fence Installation & Repair in ${geo.city} | Fence Contractors Near You | Fixly`,
  metaDescription: `Hire fence contractors in ${geo.city}, ${geo.state} for fence installation, repair, and gate services. Wood, vinyl, chain-link, and aluminum fences with fast quotes and professional results.`,
  subtitle: "Fence Installation, Repair & Gate Services for Homes and Businesses",
  description: `Looking for fence installation or repair in ${geo.city}? Fixly helps homeowners connect with experienced fence contractors for new fence installation, repairs, and gate work.

Whether you need a privacy fence for your backyard, a secure perimeter fence, or repairs to an existing fence, local pros handle everything from layout and materials to installation and finishing. Services are available for residential properties, rentals, and small commercial spaces.

Common requests include fence installation near you, wood fence repair, vinyl fence replacement, chain-link fencing, aluminum fencing, gate installation, and post repair. Submit your request and get connected with local professionals who can complete your project quickly and correctly.`,
  whyChoose: [
    "Wood, vinyl, chain-link, aluminum, and composite fencing options",
    "New fence installation and full or partial repairs",
    "Gate installation, replacement, and adjustment",
    "Post repair, alignment, and structural reinforcement",
    "Fast turnaround for residential fencing projects",
  ],
  faq: [
    {
      question: `How much does fence installation cost in ${geo.city}?`,
      answer:
        "Fence installation typically ranges from $15–$40 per linear foot depending on material, height, terrain, and labor. Custom designs and difficult access may increase the cost.",
    },
    {
      question: "What types of fences can I install?",
      answer:
        "Common options include wood privacy fences, vinyl fencing, chain-link fences, aluminum fencing, wrought iron, and composite materials. The best choice depends on your budget and goals.",
    },
    {
      question: "Can an existing fence be repaired instead of replaced?",
      answer:
        "Yes. Many fences can be repaired by replacing damaged boards, fixing leaning posts, reinforcing sections, or adjusting gates instead of installing a new fence.",
    },
    {
      question: "Do you install and repair gates?",
      answer:
        "Yes. You can request gate installation, repair, or replacement for residential fences, including hinges, latches, and alignment adjustments.",
    },
    {
      question: "How long does fence installation take?",
      answer:
        "Most residential fence installations are completed in 1–3 days depending on project size, materials, weather, and site conditions.",
    },
    {
      question: "Do I need a permit for fence installation?",
      answer:
        "Permit requirements vary depending on location and fence type. Local contractors can help you understand requirements and handle necessary approvals if needed.",
    },
  ],
},

  remodeling: {
  metaTitle: `Home Remodeling Services in ${geo.city} | Kitchen, Bathroom & Renovation Contractors | Fixly`,
  metaDescription: `Hire remodeling contractors in ${geo.city}, ${geo.state} for kitchen remodels, bathroom renovations, basement finishing, and full home remodeling. Get quotes, timelines, and expert guidance.`,
  subtitle: "Kitchen, Bathroom, Basement & Whole-Home Remodeling by Local Pros",
  description: `Planning a home remodeling project in ${geo.city}? Fixly helps homeowners connect with experienced remodeling contractors for kitchen renovations, bathroom upgrades, basement finishing, and full home remodels.

Whether you're updating a single room or transforming your entire home, local pros handle everything from planning and design to construction and finishing. Projects can include layout changes, cabinets and countertops, flooring, lighting, plumbing, drywall, and painting — all completed with attention to detail and quality workmanship.

Common requests include kitchen remodeling near you, bathroom renovation, basement finishing, flooring installation, and full home upgrades. Submit your project details and get connected with contractors who can review your scope, provide estimates, and guide you through the next steps.`,
  whyChoose: [
    "Kitchen, bathroom, basement, and full-home remodeling specialists",
    "Complete renovations including layout changes and upgrades",
    "Support with permits, planning, and project coordination",
    "Design consultation and material selection guidance",
    "Quality workmanship with professional project execution",
  ],
  faq: [
    {
      question: `How much does a home remodeling project cost in ${geo.city}?`,
      answer:
        "Remodeling costs vary widely depending on scope and materials. Smaller updates may start around $1,500–$5,000, while full kitchen, bathroom, or whole-home renovations can range from $15,000 to $60,000+.",
    },
    {
      question: "How long does a kitchen or bathroom remodel take?",
      answer:
        "Kitchen remodels may take 2–6 weeks, while bathroom renovations often take 1–3 weeks depending on demolition, plumbing, electrical work, and finishing details.",
    },
    {
      question: "Do remodeling projects require permits?",
      answer:
        "Some remodeling projects require permits, especially when structural, electrical, or plumbing changes are involved. Contractors can help identify requirements and handle the process if needed.",
    },
    {
      question: "Can I remodel using my existing layout?",
      answer:
        "Yes. You can choose to update finishes within the existing layout or request a full redesign that includes structural or layout changes.",
    },
    {
      question: "Do you offer basement finishing and full-home renovations?",
      answer:
        "Yes. You can request basement finishing, full-home remodeling, and multi-room renovation projects tailored to your needs.",
    },
    {
      question: "Can I get a consultation before starting a remodel?",
      answer:
        "Yes. You can submit your project and get connected with professionals who can review your goals, provide estimates, and recommend the best approach.",
    },
  ],
},

  flooring: {
  metaTitle: `Flooring Installation & Repair in ${geo.city} | Hardwood, Tile & Vinyl Flooring | Fixly`,
  metaDescription: `Hire flooring contractors in ${geo.city}, ${geo.state} for hardwood, tile, laminate, vinyl, and carpet installation or repair. Fast quotes, quality materials, and professional results.`,
  subtitle: "Hardwood, Tile, Vinyl & More — Professional Flooring Installation and Repair",
  description: `Looking for flooring installation or repair in ${geo.city}? Fixly helps homeowners connect with experienced flooring contractors for hardwood floors, tile installation, laminate, vinyl, and carpet projects.

Whether you're upgrading a single room or replacing flooring throughout your home, local pros handle everything from old floor removal and subfloor preparation to installation and finishing. Services are available for both residential properties and rental units.

Common requests include hardwood floor installation, luxury vinyl plank (LVP), tile flooring, laminate installation, carpet replacement, floor repairs, subfloor leveling, and refinishing. Submit your project and get connected with flooring professionals who can deliver durable, high-quality results.`,
  whyChoose: [
    "Hardwood, LVP, laminate, tile, carpet, and vinyl flooring options",
    "Old flooring removal, disposal, and full installation",
    "Subfloor repair, leveling, and preparation",
    "Installation and repair for all floor types",
    "Fast turnaround for most residential flooring projects",
  ],
  faq: [
    {
      question: `How much does flooring installation cost in ${geo.city}?`,
      answer:
        "Flooring installation costs vary by material. Luxury vinyl plank (LVP) may start around $3–$8 per square foot, while hardwood flooring typically ranges from $5–$12+ per square foot, excluding materials.",
    },
    {
      question: "What types of flooring can be installed?",
      answer:
        "You can install hardwood, engineered wood, laminate, tile, carpet, vinyl, and luxury vinyl plank (LVP). The right choice depends on your budget, room type, and durability needs.",
    },
    {
      question: "Do you remove old flooring before installation?",
      answer:
        "Yes. Flooring contractors can remove and dispose of existing flooring and prepare the surface for new installation.",
    },
    {
      question: "Do you repair damaged floors?",
      answer:
        "Yes. You can request repairs for scratches, cracks, water damage, loose boards, and other flooring issues.",
    },
    {
      question: "Do you handle subfloor repair and leveling?",
      answer:
        "Yes. Subfloor preparation, leveling, and patching are often included to ensure a stable and long-lasting installation.",
    },
    {
      question: "How long does flooring installation take?",
      answer:
        "Most flooring projects are completed in 1–3 days depending on area size, material type, and preparation work required.",
    },
  ],
},

  handyman: {
    metaTitle: `Handyman Services in ${geo.city} | Home Repairs Near You | Fixly`,
    metaDescription: `Hire handyman services in ${geo.city}, ${geo.state} for home repairs, installations, furniture assembly, drywall repair, TV mounting, door repair, and general maintenance.`,
    subtitle: "Reliable Handyman Help for Repairs, Installations, and Small Projects",
    description: `Need a handyman in ${geo.city}? Fixly helps homeowners request reliable handyman services for repairs, installations, assembly, mounting, and general home maintenance.

Whether you need help fixing a door, patching drywall, mounting a TV, assembling furniture, replacing fixtures, or handling a list of small home repairs, local handyman pros can review your request and respond with clear next steps.

Common requests include handyman near you, furniture assembly, drywall repair, door repair, TV mounting, shelf installation, minor plumbing support, small electrical tasks, and general property maintenance. Submit your request in minutes and connect with trusted local professionals.`,
    whyChoose: [
      "Flexible help for small repairs and home projects",
      "Furniture assembly, mounting, drywall, doors, and fixtures",
      "Good option for punch lists and multiple small tasks",
      "Local pros familiar with residential home maintenance",
      "Clear pricing based on scope, time, and materials",
    ],
    faq: [
      {
        question: `How much does a handyman cost in ${geo.city}?`,
        answer:
          "Handyman pricing usually depends on the task, time required, materials, and complexity. Small jobs may start around $75–$150, while larger repair lists or multi-hour projects may cost more.",
      },
      {
        question: "What handyman services can I request?",
        answer:
          "You can request furniture assembly, TV mounting, drywall patching, door repair, shelf installation, fixture replacement, minor repairs, caulking, painting touch-ups, and general home maintenance.",
      },
      {
        question: "Can I book a handyman for multiple small jobs?",
        answer:
          "Yes. You can include several small tasks in one request, such as fixing a door, mounting shelves, assembling furniture, and replacing a fixture.",
      },
      {
        question: "Do handyman pros bring tools and materials?",
        answer:
          "Most handyman professionals bring standard tools. If special parts or materials are needed, you can mention them in the request or discuss them before the job starts.",
      },
      {
        question: "Can a handyman help with rental property repairs?",
        answer:
          "Yes. Handyman services are commonly used for rental turnover, maintenance punch lists, small repairs, and landlord property upkeep.",
      },
      {
        question: "Do I need a licensed contractor for handyman work?",
        answer:
          "It depends on the job. Small repairs and installations usually do not require a specialty license, but electrical, plumbing, structural, or permit-related work may require a licensed professional.",
      },
    ],
  },

  plumbing: {
    metaTitle: `Plumbing Services in ${geo.city} | Plumbers Near You | Fixly`,
    metaDescription: `Hire plumbers in ${geo.city}, ${geo.state} for leak repair, drain cleaning, toilet repair, faucet installation, water heater service, and emergency plumbing.`,
    subtitle: "Professional Plumbing Repair, Installation, and Emergency Service",
    description: `Need plumbing services in ${geo.city}? Fixly helps homeowners request help from local plumbers for repairs, installations, drain issues, leaks, and urgent plumbing problems.

Whether you're dealing with a clogged drain, leaking faucet, running toilet, low water pressure, broken garbage disposal, or water heater issue, local plumbing pros can review your request and respond with availability and pricing.

Common requests include plumbers near you, drain cleaning, toilet repair, faucet replacement, leak detection, garbage disposal repair, water heater service, pipe repair, and emergency plumbing support. Submit your request and get connected with trusted local plumbers.`,
    whyChoose: [
      "Local plumbing pros for repairs and installations",
      "Drain cleaning, leaks, toilets, faucets, and water heaters",
      "Emergency plumbing availability when possible",
      "Clear scope and pricing before work begins",
      "Support for residential and light commercial plumbing jobs",
    ],
    faq: [
      {
        question: `How much does a plumber cost in ${geo.city}?`,
        answer:
          "Plumbing costs depend on the issue, access, parts, and urgency. Simple repairs may start around $100–$180, while water heater work, pipe repair, or emergency calls can cost more.",
      },
      {
        question: "Can I request emergency plumbing service?",
        answer: `Yes. Emergency plumbing may be available in ${geo.city} for urgent problems such as active leaks, overflowing toilets, burst pipes, or major drain backups.`,
      },
      {
        question: "What plumbing services can I book?",
        answer:
          "You can request drain cleaning, leak repair, toilet repair, faucet replacement, garbage disposal repair, water heater service, pipe repair, sink installation, and plumbing inspections.",
      },
      {
        question: "Do plumbers handle clogged drains?",
        answer:
          "Yes. Drain cleaning is one of the most common plumbing requests. Pros can help with clogged sinks, tubs, showers, toilets, and main line issues.",
      },
      {
        question: "Can I get help with a water heater?",
        answer:
          "Yes. You can request water heater repair, replacement, installation, flushing, and troubleshooting for common hot water problems.",
      },
      {
        question: "Are plumbers licensed and insured?",
        answer:
          "Many plumbing jobs require licensed professionals. Fixly helps you connect with qualified local pros based on the type and complexity of your request.",
      },
    ],
  },

  appliances: {
    metaTitle: `Appliance Repair & Installation in ${geo.city} | Appliance Service Near You | Fixly`,
    metaDescription: `Book appliance repair and installation in ${geo.city}, ${geo.state} for refrigerators, washers, dryers, dishwashers, ovens, cooktops, microwaves, and garbage disposals.`,
    subtitle: "Appliance Repair and Installation for Major Home Appliances",
    description: `Need appliance repair or installation in ${geo.city}? Fixly helps homeowners request service for refrigerators, washers, dryers, dishwashers, ovens, cooktops, microwaves, and other major home appliances.

Whether your appliance stopped working, is leaking, making noise, not heating, not cooling, or needs professional installation, local pros can review the issue and respond with next steps.

Common requests include refrigerator repair, washer and dryer repair, dishwasher installation, oven repair, cooktop replacement, microwave installation, garbage disposal replacement, and appliance hookup. Submit your request and connect with appliance service professionals near you.`,
    whyChoose: [
      "Repair and installation for major home appliances",
      "Service for refrigerators, washers, dryers, dishwashers, and ovens",
      "Installation, hookup, replacement, and troubleshooting",
      "Local pros for fast scheduling and clear next steps",
      "Useful for homeowners, rentals, and property managers",
    ],
    faq: [
      {
        question: `How much does appliance repair cost in ${geo.city}?`,
        answer:
          "Appliance repair costs depend on the appliance type, issue, parts, and labor. Diagnostic visits may start around $75–$150, while repairs involving parts can cost more.",
      },
      {
        question: "What appliances can be repaired or installed?",
        answer:
          "You can request service for refrigerators, freezers, washers, dryers, dishwashers, ovens, ranges, cooktops, microwaves, garbage disposals, and some small built-in appliances.",
      },
      {
        question: "Can I book appliance installation?",
        answer:
          "Yes. You can request installation or replacement for dishwashers, microwaves, ovens, cooktops, washers, dryers, refrigerators, and garbage disposals.",
      },
      {
        question: "Do appliance pros provide parts?",
        answer:
          "Many appliance professionals can source common replacement parts. You can describe the model, brand, and issue in your request to help the pro prepare.",
      },
      {
        question: "Is it better to repair or replace an appliance?",
        answer:
          "It depends on appliance age, repair cost, and the type of issue. A pro can help you understand whether repair makes sense or replacement is more practical.",
      },
      {
        question: "Can appliance service help with rental properties?",
        answer:
          "Yes. Appliance repair and installation is commonly used for rental homes, apartments, turnovers, and property maintenance requests.",
      },
    ],
  },

  "property-maintenance": {
    metaTitle: `Property Maintenance in ${geo.city} | Home & Rental Maintenance Services | Fixly`,
    metaDescription: `Book property maintenance in ${geo.city}, ${geo.state} for repairs, inspections, turnovers, seasonal maintenance, handyman tasks, cleaning, lawn care, and rental property upkeep.`,
    subtitle: "Ongoing Property Maintenance for Homes, Rentals, and Small Properties",
    description: `Need property maintenance in ${geo.city}? Fixly helps homeowners, landlords, and property managers request help with repairs, upkeep, turnovers, inspections, and seasonal maintenance.

Whether you manage one rental home or need help maintaining your own property, local pros can handle common maintenance tasks such as handyman repairs, cleaning, lawn care, minor plumbing, fixture replacement, drywall patching, painting touch-ups, and move-in or move-out preparation.

Common requests include rental property maintenance, home maintenance, turnover repairs, seasonal upkeep, property inspections, cleaning, lawn service, and punch list completion. Submit your request and connect with local pros who can keep your property in good condition.`,
    whyChoose: [
      "Maintenance help for homeowners, landlords, and property managers",
      "Turnover repairs, cleaning, lawn care, and handyman tasks",
      "One-time or recurring property maintenance support",
      "Useful for rentals, small portfolios, and occupied homes",
      "Clear request flow for repairs, inspections, and upkeep",
    ],
    faq: [
      {
        question: `How much does property maintenance cost in ${geo.city}?`,
        answer:
          "Property maintenance pricing depends on the type of work, number of tasks, materials, and whether service is one-time or recurring. Small repairs may start around $75–$150, while larger maintenance visits or turnover projects can cost more.",
      },
      {
        question: "What is included in property maintenance?",
        answer:
          "Property maintenance can include handyman repairs, cleaning, lawn care, seasonal upkeep, minor plumbing, fixture replacement, drywall repair, painting touch-ups, inspections, and rental turnover tasks.",
      },
      {
        question: "Can I request maintenance for a rental property?",
        answer:
          "Yes. Landlords and property managers can request maintenance help for rental homes, apartments, turnovers, move-outs, and tenant-related repair needs.",
      },
      {
        question: "Do you offer recurring property maintenance?",
        answer:
          "Yes. You can request recurring maintenance support depending on your property needs, location, and available local pros.",
      },
      {
        question: "Can one request include several maintenance tasks?",
        answer:
          "Yes. You can submit a punch list with multiple tasks, such as fixing doors, replacing fixtures, patching drywall, cleaning, and yard cleanup.",
      },
      {
        question: "Is property maintenance only for landlords?",
        answer:
          "No. Homeowners can also request property maintenance for seasonal upkeep, repairs, inspections, and general home care.",
      },
    ],
  },

});

export function getCategorySeoBySlug(
  geo: Geo,
  categorySlug?: string
): CategorySeoContent | undefined {
  if (!categorySlug) return undefined;

  const all = getCategorySeoContent(geo);
  return all[categorySlug];
}