// Bundled fallback dataset for the four example markets shown on the
// landing page. Used when ANTHROPIC_API_KEY isn't configured, so the app
// is fully explorable without any keys. When a key is present, these
// topics (and any other topic) are generated live instead — see
// `generateMarket.ts`.
export interface RawNicheSeed {
  name: string;
  teaser: string;
  demand: number;
  revenue: string;
  revenueNote: string;
  thesis: string;
  metrics: [string, string][];
  trend: number[];
  trendStart: string;
  trendEnd: string;
  trendNote: string;
  audience: string;
  audienceFacts: [string, string][];
  keywords: [string, string, string, string][];
  competitors: [string, string, string][];
  playbook: [string, string, string, string][];
  ideas: string[];
  sourcing: string[];
  risks: [string, string][];
  sources: [string, string][];
}

export const SEED_DATA: Record<string, RawNicheSeed[]> = {
  "home coffee equipment": [
    { name: "Espresso puck screens & hardware", teaser: "Enthusiast upgrade parts sold almost entirely through one-person Etsy shops with no brand and no content.", demand: 78, revenue: "$14k/mo", revenueNote: "top-quartile store",
      thesis: "A high-repeat accessories market where demand is growing faster than supply, and the incumbents are hobbyists without brands, content, or fulfillment discipline.",
      metrics: [["Demand", "78"], ["Competition", "31"], ["Rev. potential", "$14k/mo"], ["Confidence", "High"]],
      trend: [38, 41, 46, 44, 52, 58, 55, 64, 71, 69, 77, 83], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+118% search interest, 12 mo",
      audience: "Men 28–45 who bought a mid-tier espresso machine in the last 18 months and now treat dial-in as a hobby. They read reviews before buying, follow two or three creators, and will pay a 40% premium for machined metal over plastic.",
      audienceFacts: [["Median spend", "$68 / order"], ["Repeat rate", "2.4 orders / yr"], ["Where they are", "Reddit, YouTube"]],
      keywords: [["puck screen 58.5mm", "9.4k/mo", "KD 11", "+64%"], ["dosing funnel magnetic", "5.1k/mo", "KD 8", "+41%"], ["bottomless portafilter guide", "3.8k/mo", "KD 14", "+22%"], ["wdt tool needle size", "2.9k/mo", "KD 6", "+88%"]],
      competitors: [["Two Etsy makers", "~$9k/mo combined", "No brand, 3–9 day handling times, zero editorial content. Losing search to forum threads."], ["One DTC brand", "est. $40k/mo", "Strong product, weak SEO — ranks for 4 of the top 20 terms."], ["Marketplace generics", "high volume", "Race to the bottom on price; quality complaints in 1 of 5 reviews create an obvious quality position."]],
      playbook: [["01", "Own the sizing problem", "Ship a fit-checker page keyed to machine model, then sell the correct part. Converts search intent directly.", "62% margin"], ["02", "Bundle the dial-in kit", "Screen + funnel + WDT tool as one starter bundle at $79 to raise first-order value.", "58% margin"], ["03", "Consumable follow-on", "Filters and gaskets on a 90-day email cycle turn a one-off into a subscription.", "71% margin"]],
      ideas: ["Fit-checker tool by machine model", "\"Dial-in in 3 shots\" email course", "Comparison teardown video series", "Machined-in-EU quality positioning", "Café co-branded limited runs", "Affiliate program for espresso creators"],
      sourcing: ["Two verified CNC suppliers in Portugal and Taiwan; MOQ 250 units, 18–22 day lead time.", "Landed unit cost $6.40–$9.10 depending on mesh spec; tooling is a one-time $1,100.", "Air freight is viable at this weight — avoid the 6-week sea window competitors are stuck with."],
      risks: [["Medium", "The one strong DTC brand could fix its SEO within two quarters and absorb the search upside."], ["Low", "Machine-model fragmentation means SKU count grows faster than revenue if you chase every fitment."], ["Low", "Trend is enthusiast-driven and has been climbing for three years — unlikely to be a spike."]],
      sources: [["Search volume, 14 keyword set", "2 days ago"], ["Etsy + marketplace listing scrape (612 listings)", "yesterday"], ["r/espresso thread sentiment, 90 days", "today"], ["Supplier directory quotes", "5 days ago"], ["Competitor rank tracking snapshot", "today"]] },
    { name: "Decaf-only subscription roasting", teaser: "Growing sober-curious and late-day drinker demand; almost no roaster treats decaf as the headline product.", demand: 71, revenue: "$9k/mo", revenueNote: "yr-1 realistic",
      thesis: "Decaf has shed its stigma faster than roasters have repositioned. A brand that leads with decaf owns a category nobody is defending.",
      metrics: [["Demand", "71"], ["Competition", "24"], ["Rev. potential", "$9k/mo"], ["Confidence", "Medium"]],
      trend: [30, 34, 33, 40, 45, 48, 54, 52, 61, 66, 70, 74], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+91% search interest, 12 mo",
      audience: "Two overlapping groups: parents and shift workers who want an evening cup, and the sober-curious cohort trading alcohol rituals for coffee ones. Both are subscription-friendly and brand-loyal once they find a decaf that isn't flat.",
      audienceFacts: [["Median spend", "$22 / bag"], ["Repeat rate", "monthly"], ["Where they are", "Instagram, TikTok"]],
      keywords: [["best decaf coffee beans", "22k/mo", "KD 28", "+37%"], ["swiss water process decaf", "6.7k/mo", "KD 12", "+52%"], ["decaf espresso subscription", "1.9k/mo", "KD 7", "+120%"], ["decaf that actually tastes good", "1.2k/mo", "KD 4", "+64%"]],
      competitors: [["Specialty roasters", "large", "Carry one token decaf SKU, rarely mention it in marketing. No decaf-first shelf presence anywhere."], ["One decaf-only brand (UK)", "est. $60k/mo", "Proves the model; no meaningful presence in North America."], ["Grocery decaf", "commodity", "Stale, pre-ground, and the reason customers assume decaf is bad — your whole wedge."]],
      playbook: [["01", "Decaf-first subscription", "Three roast profiles, monthly cadence, $19/bag. Category ownership beats SKU breadth.", "54% margin"], ["02", "Process education", "Rank for the Swiss-water vs CO2 question; it is the highest-intent unbranded search in the space.", "n/a"], ["03", "Evening-ritual gifting", "Holiday gift sets aimed at the non-drinker on every shopping list.", "61% margin"]],
      ideas: ["Blind decaf-vs-caffeinated tasting kit", "\"After six\" brand line", "Sober-community partnerships", "Decaf process explainer microsite", "Café wholesale for evening service", "Single-origin decaf drops"],
      sourcing: ["Swiss-water decaf green beans available from three importers; $4.10–$5.60/lb at 5-bag minimums.", "Toll roasting removes capex — expect $1.80/lb roasted plus bag and label at $0.75.", "Freshness is the differentiator: roast-to-order within 48 hours is achievable at this volume."],
      risks: [["High", "Green decaf supply is thinner than caffeinated; a bad harvest moves your cost 20%."], ["Medium", "A large roaster could launch a decaf line and outspend you on paid."], ["Low", "Demand curve is structural, tied to alcohol decline, not a fad cycle."]],
      sources: [["Keyword expansion, 40-term set", "today"], ["Importer price sheets", "3 days ago"], ["Subscription-brand teardown (9 brands)", "yesterday"], ["Sober-curious market reporting", "1 week ago"], ["Instagram hashtag volume trend", "today"]] },
    { name: "Small-batch cold brew concentrate for offices", teaser: "B2B channel with recurring orders that DTC-obsessed roasters have almost entirely ignored.", demand: 64, revenue: "$18k/mo", revenueNote: "12 accounts",
      thesis: "Offices re-order on a schedule and barely price-shop. The channel needs a light logistics touch that consumer-first roasters refuse to build.",
      metrics: [["Demand", "64"], ["Competition", "38"], ["Rev. potential", "$18k/mo"], ["Confidence", "Medium"]],
      trend: [44, 42, 48, 50, 47, 53, 58, 60, 57, 63, 66, 68], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+55% search interest, 12 mo",
      audience: "Office managers and workplace-experience leads at 30–250 person companies who want a visible perk upgrade under a $600/mo line item and one invoice.",
      audienceFacts: [["Account value", "$420 / mo"], ["Churn", "~8% / yr"], ["Where they are", "LinkedIn, referrals"]],
      keywords: [["office cold brew delivery", "3.4k/mo", "KD 19", "+48%"], ["cold brew concentrate wholesale", "2.1k/mo", "KD 15", "+33%"], ["office coffee service alternative", "1.6k/mo", "KD 22", "+27%"], ["nitro keg rental", "980/mo", "KD 11", "+40%"]],
      competitors: [["National OCS vendors", "enterprise", "Contract-heavy, slow, and hated for equipment fees. Vulnerable on flexibility and taste."], ["Local roasters", "small", "Will sell you beans but won't handle kegs, swaps, or invoicing."], ["Canned brands", "retail", "Convenient but expensive per serving and a waste-optics problem for ESG-minded offices."]],
      playbook: [["01", "Concentrate + keg swap", "Route-based swaps every two weeks; one invoice, no equipment fee.", "49% margin"], ["02", "Land via one anchor office", "Densify by building block — route economics decide profitability here.", "n/a"], ["03", "Add tea and sparkling", "Same route, higher order value, near-zero added delivery cost.", "57% margin"]],
      ideas: ["Two-week free pilot keg", "Per-head cost calculator for office managers", "Referral credit between neighboring offices", "Branded tap handles", "Quarterly tasting for anchor accounts", "Sustainability one-pager for procurement"],
      sourcing: ["Co-packing available at 200-gallon runs; $3.90/gallon concentrate at that volume.", "Refurbished 5-gallon kegs at $78 each; expect a 4% annual loss rate.", "Refrigerated van or insulated totes both work under a 40-mile route radius."],
      risks: [["Medium", "Route density is everything — a scattered first ten accounts kills the margin."], ["Medium", "Office headcount volatility moves volume quarter to quarter."], ["Low", "Cold brew consumption is seasonal but the office floor is climate-controlled year-round."]],
      sources: [["Local business density analysis", "today"], ["Co-packer quote set", "4 days ago"], ["OCS contract review, 6 vendors", "1 week ago"], ["LinkedIn job-post signal (office manager)", "today"], ["Keyword volume, B2B cluster", "yesterday"]] },
    { name: "Manual brewer restoration & parts", teaser: "Vintage grinders and pour-over gear trade briskly, but nobody sells the gaskets and burrs that keep them alive.", demand: 58, revenue: "$6k/mo", revenueNote: "one-operator ceiling",
      thesis: "A small, durable business: fragmented secondhand supply, motivated buyers, and replacement parts nobody stocks.",
      metrics: [["Demand", "58"], ["Competition", "18"], ["Rev. potential", "$6k/mo"], ["Confidence", "High"]],
      trend: [36, 39, 37, 42, 45, 43, 49, 51, 50, 55, 57, 59], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+61% search interest, 12 mo",
      audience: "Collectors and design-minded home brewers who buy on eBay and estate sales, then hunt forums for a gasket nobody manufactures anymore.",
      audienceFacts: [["Median spend", "$40 / order"], ["Repeat rate", "1.8 orders / yr"], ["Where they are", "Forums, eBay"]],
      keywords: [["vintage grinder burr replacement", "2.6k/mo", "KD 9", "+44%"], ["chemex lid gasket", "1.4k/mo", "KD 5", "+29%"], ["restore hand grinder", "1.1k/mo", "KD 7", "+51%"], ["discontinued brewer parts", "870/mo", "KD 4", "+38%"]],
      competitors: [["Forum classifieds", "informal", "Where demand currently goes to die. No inventory, no search presence, no trust layer."], ["One US parts seller", "est. $5k/mo", "Site is unusable on mobile; no fitment data, no photos of installed parts."], ["OEM brands", "large", "Discontinue parts after 5 years by policy — the structural reason this niche exists."]],
      playbook: [["01", "Parts catalog with fitment", "Model-indexed catalog is the moat; search intent is already exact.", "66% margin"], ["02", "Restoration service tier", "Send-in service at $120 per unit for buyers who won't do it themselves.", "48% margin"], ["03", "Refurb resale", "Buy neglected units, restore, resell at 2.5x with a 6-month guarantee.", "52% margin"]],
      ideas: ["Model-indexed parts catalog", "Restoration teardown video per model", "Buyer's guide for estate-sale finds", "Gasket subscription for café accounts", "Marketplace for restored units", "3D-printed replacements for dead SKUs"],
      sourcing: ["Silicone gaskets moldable locally at $180 tooling per profile, $0.35/unit thereafter.", "Burr sets from two Asian suppliers at $11–$19; quality varies, sample before committing.", "Donor units are the cheapest inventory source — set eBay alerts under $30."],
      risks: [["Medium", "Ceiling is real: one operator, physical inventory, no venture-scale outcome."], ["Low", "Fitment complexity is a barrier to competitors as much as to you."], ["Low", "Vintage supply keeps refreshing as today's gear ages out."]],
      sources: [["eBay sold-listing analysis (18 mo)", "today"], ["Forum request-thread mining", "2 days ago"], ["Gasket moulder quotes", "6 days ago"], ["Keyword set, parts cluster", "yesterday"], ["OEM parts-policy review", "1 week ago"]] }
  ],
  "pet wellness": [
    { name: "Senior-dog mobility supplements", teaser: "Owners of arthritic dogs buy monthly for years, and the shelf is dominated by generic joint chews with no age targeting.", demand: 81, revenue: "$22k/mo", revenueNote: "yr-2 realistic",
      thesis: "The highest-LTV segment in pet wellness is treated as an afterthought: senior-specific formulation and dosing guidance is nearly absent from a market of undifferentiated joint chews.",
      metrics: [["Demand", "81"], ["Competition", "44"], ["Rev. potential", "$22k/mo"], ["Confidence", "High"]],
      trend: [46, 49, 52, 51, 58, 62, 66, 64, 72, 76, 79, 84], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+83% search interest, 12 mo",
      audience: "Owners 40–65 whose dog has just been diagnosed or has visibly slowed. Emotionally motivated, vet-influenced, and extremely retention-friendly: they re-order until the dog dies.",
      audienceFacts: [["Median spend", "$46 / mo"], ["Retention", "14 mo average"], ["Where they are", "Facebook groups, vet referral"]],
      keywords: [["dog joint supplement arthritis", "18k/mo", "KD 34", "+41%"], ["senior dog mobility chews", "4.2k/mo", "KD 16", "+77%"], ["green lipped mussel dog dosage", "2.8k/mo", "KD 9", "+58%"], ["dog struggling to stand up", "6.1k/mo", "KD 12", "+35%"]],
      competitors: [["Two large chew brands", "national", "Age-agnostic formulas and marketing. No senior line, no dosing-by-weight guidance."], ["Vet-channel brands", "clinical", "Credible but priced at 2.5x and unavailable without a visit — a clear pricing gap."], ["Amazon private label", "commodity", "Underdosed actives relative to label claims; third-party assay results are a devastating content angle."]],
      playbook: [["01", "Senior-only line", "Formulate for 7+ with weight-banded dosing. Category clarity is the entire wedge.", "68% margin"], ["02", "Subscription by weight", "Auto-ship sized to the dog removes reorder friction and lifts LTV sharply.", "72% margin"], ["03", "Vet clinic co-sell", "Sample packs in clinics buy trust that ads can't.", "54% margin"]],
      ideas: ["Mobility-decline assessment quiz", "Third-party assay transparency page", "Weight-banded dosing calculator", "Vet-authored senior care guide", "Before/after mobility video series", "Clinic sample-pack program"],
      sourcing: ["Two US contract manufacturers quote $3.10–$4.40 per 60-count bag at 5,000-unit runs.", "Green-lipped mussel and UC-II are the cost drivers; NZ-sourced GLM carries a defensible provenance story.", "NASC certification is roughly $1,650/yr and is table stakes for retailer and vet channels."],
      risks: [["High", "Supplement claims are FTC-sensitive; every efficacy statement needs substantiation review."], ["Medium", "A national brand launching a senior SKU would compress your window to ~3 quarters."], ["Low", "Aging pet population is a structural, decade-long tailwind."]],
      sources: [["Search volume, 22-keyword set", "today"], ["Marketplace label-claim audit (74 SKUs)", "yesterday"], ["Contract manufacturer quotes", "4 days ago"], ["Vet forum sentiment, 90 days", "2 days ago"], ["NASC certification requirements", "1 week ago"]] },
    { name: "Cat enrichment for small apartments", teaser: "Urban cat owners want stimulation without floor space; every product on the market assumes a house.", demand: 69, revenue: "$11k/mo", revenueNote: "top-quartile store",
      thesis: "Apartment cat ownership is growing fastest in the densest cities, and nobody designs for vertical, wall-mounted, landlord-safe enrichment.",
      metrics: [["Demand", "69"], ["Competition", "27"], ["Rev. potential", "$11k/mo"], ["Confidence", "Medium"]],
      trend: [34, 38, 41, 45, 43, 50, 55, 58, 61, 60, 66, 71], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+96% search interest, 12 mo",
      audience: "Renters 25–40 in one-bedroom apartments, design-conscious, guilt-driven about leaving the cat alone all day, unwilling to install anything that costs their deposit.",
      audienceFacts: [["Median spend", "$74 / order"], ["Repeat rate", "1.6 orders / yr"], ["Where they are", "TikTok, Instagram"]],
      keywords: [["cat shelves no drill", "5.4k/mo", "KD 10", "+112%"], ["small apartment cat furniture", "3.9k/mo", "KD 18", "+64%"], ["vertical cat wall renter friendly", "1.7k/mo", "KD 6", "+140%"], ["cat enrichment while at work", "2.3k/mo", "KD 8", "+49%"]],
      competitors: [["Big-box cat furniture", "national", "Bulky floor towers in beige carpet. Actively wrong for the customer and the room."], ["Etsy woodworkers", "~$14k/mo combined", "Beautiful, drill-required, 3-week lead times, no renter messaging."], ["One design brand", "est. $30k/mo", "Owns the aesthetic position but ignores the no-drill constraint entirely."]],
      playbook: [["01", "No-drill mounting system", "Tension and adhesive systems rated to 25 lb; the constraint IS the product.", "59% margin"], ["02", "Modular room kits", "Sell a configured wall, not a shelf — raises AOV from $40 to $180.", "61% margin"], ["03", "Renter-safe guarantee", "Cover deposit damage; removes the last purchase objection.", "n/a"]],
      ideas: ["Wall-plan configurator by room dimensions", "Renter-safe install video series", "Landlord-approved one-pager", "Flat-pack for elevator buildings", "Creator collabs with apartment cat accounts", "Neutral colorway line for design renters"],
      sourcing: ["Flat-pack birch ply from two domestic CNC shops; $19–$28 per shelf at 300-unit runs.", "Adhesive mount hardware sourced from an industrial supplier at $2.40 per mount, load-tested to 40 lb.", "Flat-pack shipping keeps dimensional weight under the profitability threshold — assembled units do not."],
      risks: [["Medium", "Adhesive failure is a liability and a review-destroying event; over-engineer the mount."], ["Medium", "Furniture returns are expensive; flat-pack helps but does not eliminate it."], ["Low", "Urban rental cat ownership continues to climb."]],
      sources: [["Keyword expansion, 31-term set", "today"], ["Etsy + DTC listing scrape (288 listings)", "yesterday"], ["CNC shop quotes", "5 days ago"], ["TikTok hashtag volume trend", "today"], ["Adhesive mount load testing spec", "1 week ago"]] },
    { name: "Pet anxiety data & wearables resale", teaser: "Owners buy trackers, then get no interpretation; the software layer on top of existing hardware is unbuilt.", demand: 62, revenue: "$8k/mo", revenueNote: "yr-1 realistic",
      thesis: "The hardware is commoditized and the data is inert. A subscription that reads existing tracker output for anxiety and pain signals sells against a problem owners already paid to measure.",
      metrics: [["Demand", "62"], ["Competition", "21"], ["Rev. potential", "$8k/mo"], ["Confidence", "Medium"]],
      trend: [28, 32, 35, 39, 42, 40, 48, 52, 56, 59, 61, 65], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+104% search interest, 12 mo",
      audience: "Owners of reactive or separation-anxious dogs who have already tried a trainer and a calming chew, and who own a tracker whose app tells them nothing actionable.",
      audienceFacts: [["Median spend", "$9 / mo"], ["Retention", "9 mo average"], ["Where they are", "Reddit, trainer referral"]],
      keywords: [["dog separation anxiety tracker", "4.6k/mo", "KD 13", "+87%"], ["is my dog stressed at home", "7.2k/mo", "KD 11", "+52%"], ["dog activity data meaning", "1.9k/mo", "KD 7", "+61%"], ["pet camera anxiety detection", "2.4k/mo", "KD 15", "+73%"]],
      competitors: [["Tracker manufacturers", "large", "Sell hardware, ship a step-counter app, and have no behavioral interpretation layer."], ["Training apps", "small", "Content-based, no data input. Cannot tell you whether the plan is working."], ["Vet behaviorists", "clinical", "$300 consults with a 6-week wait — the reason a $9/mo interpretation layer sells."]],
      playbook: [["01", "Read existing hardware", "Import from the trackers owners already have. Zero hardware cost, instant addressable base.", "84% margin"], ["02", "Weekly anxiety report", "A plain-language weekly read plus one recommended change keeps the subscription alive.", "84% margin"], ["03", "Trainer partner tier", "Trainers pay for a multi-client dashboard and bring their own book of business.", "79% margin"]],
      ideas: ["Weekly plain-language anxiety report", "Trainer multi-client dashboard", "Before/after intervention scoring", "Vet-shareable PDF summary", "Trigger-pattern detection by time of day", "Free tier reading one week of data"],
      sourcing: ["No physical supply chain; cost is engineering plus per-account data processing at roughly $0.40/mo.", "Two major tracker platforms expose usable APIs; a third requires manual CSV import at launch.", "Behavioral scoring needs a credentialed advisor on retainer — budget $1,500/mo for defensibility."],
      risks: [["High", "Platform dependency: a tracker maker closing its API removes a channel overnight."], ["Medium", "Behavioral claims invite the same scrutiny as health claims — keep language observational."], ["Medium", "Owner data literacy is low; onboarding has to do heavy lifting."]],
      sources: [["Tracker API documentation review", "2 days ago"], ["Keyword set, anxiety cluster", "today"], ["r/dogs + r/reactivedogs mining", "yesterday"], ["Vet behaviorist pricing survey", "1 week ago"], ["App store review sentiment (4 apps)", "today"]] }
  ],
  "indie board games": [
    { name: "Solo-mode expansions for existing hits", teaser: "Solo play is the fastest-growing segment, and most published games shipped without a solo mode.", demand: 74, revenue: "$16k/mo", revenueNote: "per campaign",
      thesis: "A large installed base of owned games lacks solo rules. Licensed or original solo modules sell to people who already love the box on their shelf.",
      metrics: [["Demand", "74"], ["Competition", "26"], ["Rev. potential", "$16k/mo"], ["Confidence", "High"]],
      trend: [40, 44, 47, 52, 50, 57, 61, 66, 63, 70, 74, 79], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+87% search interest, 12 mo",
      audience: "Hobbyists 28–45 with 30+ games and unreliable game nights. They buy on BGG reputation and crowdfunding, and they will pay $25 for 40 more hours out of a game they own.",
      audienceFacts: [["Median spend", "$29 / module"], ["Repeat rate", "3.1 / yr"], ["Where they are", "BGG, Discord, Kickstarter"]],
      keywords: [["solo variant rules", "8.9k/mo", "KD 14", "+66%"], ["best solo board games 2026", "12k/mo", "KD 31", "+38%"], ["automa deck expansion", "2.1k/mo", "KD 8", "+94%"], ["solo mode print and play", "3.3k/mo", "KD 10", "+71%"]],
      competitors: [["Fan-made PDFs", "free", "Where the demand currently lives. Unbalanced, unillustrated, and impossible to find twice."], ["Two publishers", "mid-size", "Ship solo modes in new releases only; no back-catalogue support at all."], ["One automa designer", "est. $20k/campaign", "Proves willingness to pay; covers four games out of thousands."]],
      playbook: [["01", "Licensed solo modules", "Revenue-share with publishers who have no solo roadmap. They get value from dormant IP.", "57% margin"], ["02", "Print-and-play first", "Validate demand digitally at $9 before committing to a print run.", "92% margin"], ["03", "Crowdfund the physical", "Pre-sell the deck; the PnP buyer list is the campaign's day-one audience.", "48% margin"]],
      ideas: ["Print-and-play at $9 per module", "Difficulty-ladder campaign mode", "BGG designer diary series", "Discord playtest guild", "Publisher licensing outreach kit", "Solo-mode subscription, one module monthly"],
      sourcing: ["Card printing at $1.85 per 54-card deck at 1,000 units from two Chinese printers; 30-day lead time.", "Illustration is the real cost — budget $1,200–$2,500 per module for a coherent visual identity.", "Fulfillment via a hobby-games 3PL keeps shipping credible with crowdfunding backers."],
      risks: [["Medium", "Licensing negotiation is slow and relationship-driven; original IP is the fallback."], ["Medium", "Solo balance requires real playtesting volume or reviews will punish you."], ["Low", "Solo play growth has been consistent since 2020."]],
      sources: [["BGG solo-guild activity analysis", "today"], ["Crowdfunding campaign outcomes (34 projects)", "yesterday"], ["Keyword set, solo cluster", "today"], ["Printer quote comparison", "6 days ago"], ["Publisher catalogue solo-mode audit", "3 days ago"]] },
    { name: "Premium component upgrades", teaser: "Owners of a handful of beloved games will spend more on upgraded bits than the game cost.", demand: 67, revenue: "$13k/mo", revenueNote: "top-quartile store",
      thesis: "A small set of evergreen titles has a durable owner base with real disposable income and no reliable source for high-quality replacement components.",
      metrics: [["Demand", "67"], ["Competition", "35"], ["Rev. potential", "$13k/mo"], ["Confidence", "Medium"]],
      trend: [42, 45, 43, 49, 53, 51, 57, 60, 58, 64, 66, 70], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+58% search interest, 12 mo",
      audience: "Collectors who keep 5–10 games permanently and treat them as furniture. They buy metal coins, resin resources, and insert trays, and they show it off online.",
      audienceFacts: [["Median spend", "$61 / order"], ["Repeat rate", "2.2 / yr"], ["Where they are", "BGG, Etsy, Instagram"]],
      keywords: [["metal coins board game", "6.3k/mo", "KD 21", "+44%"], ["resin resource tokens", "2.7k/mo", "KD 12", "+68%"], ["game insert organizer", "9.1k/mo", "KD 26", "+31%"], ["upgraded components for", "4.4k/mo", "KD 9", "+52%"]],
      competitors: [["Etsy 3D printers", "fragmented", "Print quality varies wildly; no game-specific fit guarantees, no brand."], ["Two upgrade brands", "est. $50k/mo", "Cover the top 10 titles only. Everything else is unserved."], ["Publisher deluxe editions", "premium", "Force a full re-buy at $150+ instead of a $40 upgrade — the gap you sell into."]],
      playbook: [["01", "Title-specific kits", "One complete kit per game beats a generic token store on both search and conversion.", "63% margin"], ["02", "Pre-order production runs", "Batch by title on pre-order; zero dead inventory in a long-tail catalogue.", "66% margin"], ["03", "Reviewer seeding", "Unboxing coverage is the entire acquisition channel in this hobby.", "n/a"]],
      ideas: ["Complete upgrade kit per title", "Pre-order batching by game", "Insert + component combined bundles", "Reviewer seeding program", "Community vote on the next title", "Collector's numbered runs"],
      sourcing: ["Metal coin minting at $0.42/coin at 3,000 units; resin tokens $0.28 at 5,000 from two suppliers.", "Laser-cut inserts producible domestically at $6.20 per set, avoiding overseas lead time on bulky goods.", "Pre-order batching means working capital, not inventory risk, is the binding constraint."],
      risks: [["Medium", "Copyright care needed: fit-compatible, never trade-dress-copying."], ["Medium", "Long-tail SKU sprawl can bury a small operator in catalogue maintenance."], ["Low", "Evergreen titles stay in print and in collections for a decade."]],
      sources: [["Etsy sold-listing analysis", "today"], ["BGG top-100 ownership data", "yesterday"], ["Minting and resin supplier quotes", "4 days ago"], ["Keyword set, upgrade cluster", "today"], ["Reviewer channel reach audit", "1 week ago"]] },
    { name: "Board game cafés outside major cities", teaser: "Library-model cafés are saturated downtown and almost absent in 50k–150k population towns.", demand: 59, revenue: "$31k/mo", revenueNote: "per location",
      thesis: "The format is proven and the rent math only works outside the metro core — where competition is effectively zero.",
      metrics: [["Demand", "59"], ["Competition", "14"], ["Rev. potential", "$31k/mo"], ["Confidence", "Medium"]],
      trend: [33, 36, 40, 38, 44, 47, 45, 52, 55, 54, 58, 61], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+49% search interest, 12 mo",
      audience: "Families and 20–35s in smaller cities with money and nothing to do on a Tuesday. Third-place demand with no alcohol requirement.",
      audienceFacts: [["Spend per visit", "$18 / head"], ["Return rate", "2.4 visits / mo"], ["Where they are", "Local Facebook, word of mouth"]],
      keywords: [["board game cafe near me", "27k/mo", "KD 24", "+36%"], ["things to do [town] evening", "high local", "KD 18", "+29%"], ["game library cafe", "1.8k/mo", "KD 9", "+41%"], ["kids birthday board game party", "3.1k/mo", "KD 13", "+55%"]],
      competitors: [["Metro cafés", "established", "Saturated, high rent, and 40+ minutes away from your customer."], ["Local coffee shops", "many", "Close at 4pm and offer nothing to do — you are competing for evening hours they abandon."], ["Comic/game stores", "small", "Tournament-focused and unwelcoming to families; a different job entirely."]],
      playbook: [["01", "Library fee + food", "$7 table fee plus food and drink; the library is the draw, F&B is the margin.", "68% F&B margin"], ["02", "Events fill weeknights", "Learn-to-play nights and leagues turn dead Tuesdays into the reliable base.", "n/a"], ["03", "Private parties", "Birthdays and team events at $340 per booking carry the slow months.", "74% margin"]],
      ideas: ["Learn-to-play weeknight series", "Family birthday party packages", "Game library membership at $15/mo", "Local designer showcase nights", "School and library partnerships", "Retail shelf for the games people fall for"],
      sourcing: ["Opening library of 300 titles at roughly $8,400 via distributor accounts, not retail.", "Secondary-market retail space at $14–$22/sq ft in target towns versus $48+ downtown.", "Espresso and light-kitchen fit-out lands near $60k used; the model does not need alcohol licensing."],
      risks: [["High", "Single-location physical business with real capex and no remote optionality."], ["Medium", "Staff dependency: game-teaching quality is the product and it is hard to hire for."], ["Low", "Third-place demand in smaller cities has been under-supplied for years."]],
      sources: [["Population and competitor mapping (72 towns)", "today"], ["Commercial rent comparables", "2 days ago"], ["Distributor library pricing", "5 days ago"], ["Local search volume analysis", "today"], ["Operating café P&L interviews", "1 week ago"]] }
  ],
  "field recording gear": [
    { name: "Weatherproof rigs for nature recordists", teaser: "Long-deployment outdoor recording has real buyers and almost no purpose-built weatherproof kit.", demand: 66, revenue: "$9k/mo", revenueNote: "yr-1 realistic",
      thesis: "Recordists solve rain, wind and multi-week power with tape and Tupperware. A purpose-built rig sells to a small, high-intent, cash-carrying audience.",
      metrics: [["Demand", "66"], ["Competition", "17"], ["Rev. potential", "$9k/mo"], ["Confidence", "Medium"]],
      trend: [31, 35, 33, 40, 44, 47, 45, 53, 57, 60, 63, 68], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+79% search interest, 12 mo",
      audience: "Nature recordists, bioacoustics researchers and sound designers deploying recorders for days or weeks. Technical, forum-driven, and unbothered by price when the gear survives.",
      audienceFacts: [["Median spend", "$310 / order"], ["Repeat rate", "1.4 / yr"], ["Where they are", "Forums, university labs"]],
      keywords: [["weatherproof field recorder case", "2.2k/mo", "KD 8", "+72%"], ["long term audio deployment power", "1.4k/mo", "KD 6", "+88%"], ["wind protection outdoor mic", "4.1k/mo", "KD 14", "+43%"], ["bioacoustics recorder enclosure", "760/mo", "KD 4", "+61%"]],
      competitors: [["Recorder manufacturers", "large", "Sell the box, not the deployment. Accessories stop at a foam windscreen."], ["Two research suppliers", "institutional", "Priced for grant budgets at 3x, with procurement friction and 8-week lead times."], ["DIY forum builds", "free", "Detailed threads proving the demand and the absence of any product."]],
      playbook: [["01", "Deployment kit per recorder", "Enclosure, mount, wind protection and power sized to specific popular recorders.", "58% margin"], ["02", "Sell to labs directly", "University bioacoustics groups buy in multiples and re-order annually.", "62% margin"], ["03", "Consumable wind covers", "Fur covers wear out on schedule — a small recurring revenue line.", "70% margin"]],
      ideas: ["Recorder-specific deployment kits", "Solar power extension module", "Field-tested deployment logbook content", "University lab bulk pricing", "Wind-cover replacement subscription", "Recordist-authored deployment guides"],
      sourcing: ["IP66 enclosures modifiable from stock at $18–$34; custom gasketing adds $4 per unit.", "Acoustically transparent membrane is the hard part — one European supplier, 6-week lead, sample first.", "Small-batch assembly is viable in-house below 200 units/month; margins support it."],
      risks: [["High", "Small total market; realistic ceiling is a strong one-person business, not a scaling company."], ["Medium", "Membrane single-sourcing is a genuine supply risk — qualify a second vendor early."], ["Low", "Bioacoustics research funding continues to expand."]],
      sources: [["Forum build-thread mining (140 threads)", "today"], ["University lab procurement survey", "3 days ago"], ["Enclosure supplier quotes", "5 days ago"], ["Keyword set, deployment cluster", "today"], ["Research supplier price comparison", "1 week ago"]] },
    { name: "Curated sound libraries for game audio", teaser: "Game teams need specific, cleared, consistent libraries; marketplaces sell inconsistent one-off packs.", demand: 72, revenue: "$14k/mo", revenueNote: "yr-2 realistic",
      thesis: "Buyers want coherence and clean licensing, not volume. A tightly curated library with unambiguous commercial terms outsells a bigger, messier catalogue.",
      metrics: [["Demand", "72"], ["Competition", "39"], ["Rev. potential", "$14k/mo"], ["Confidence", "High"]],
      trend: [45, 48, 52, 50, 56, 60, 64, 62, 69, 73, 71, 78], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+69% search interest, 12 mo",
      audience: "Indie game audio leads and solo developers on a deadline who need forty consistent footstep variations today, with a license their publisher will accept.",
      audienceFacts: [["Median spend", "$89 / pack"], ["Repeat rate", "2.8 / yr"], ["Where they are", "Discord, GDC, itch.io"]],
      keywords: [["game footstep sound library", "3.6k/mo", "KD 17", "+54%"], ["royalty free sfx commercial license", "8.4k/mo", "KD 29", "+38%"], ["consistent foley library", "1.3k/mo", "KD 7", "+81%"], ["ambience loops seamless", "5.2k/mo", "KD 20", "+46%"]],
      competitors: [["Large marketplaces", "dominant", "Inconsistent recording conditions across contributors; license terms confuse buyers."], ["Boutique libraries", "small", "Excellent audio, terrible discoverability and no game-specific organization."], ["Subscription services", "mid", "All-you-can-eat, but stop billing and your shipped game's rights get murky."]],
      playbook: [["01", "Perpetual clear license", "One-time purchase, unambiguous commercial rights. Directly answers the subscription anxiety.", "88% margin"], ["02", "Game-shaped organization", "Sell by need — footsteps, UI, weather — not by recording session.", "88% margin"], ["03", "Studio site licenses", "Team-wide terms at $1,200 turn one buyer into a whole studio.", "92% margin"]],
      ideas: ["Naming convention and metadata standard", "Free starter pack as the funnel", "Middleware-ready session templates", "Studio site licensing", "Jam sponsorships for distribution", "Custom recording commissions"],
      sourcing: ["No goods; cost is recording time plus editing at roughly 3:1 hours to delivered minute.", "Delivery via a standard digital storefront keeps overhead near zero and margins above 85%.", "Legal review of the license text is the one expense worth paying for properly — budget $2,000."],
      risks: [["Medium", "AI-generated audio may compress the low end of this market within two years."], ["Medium", "Discoverability outside marketplaces requires sustained community presence."], ["Low", "Indie game output keeps growing and every game needs audio."]],
      sources: [["Marketplace catalogue and pricing audit", "today"], ["Game audio Discord sentiment", "yesterday"], ["License term comparison (7 vendors)", "4 days ago"], ["Keyword set, SFX cluster", "today"], ["itch.io release volume trend", "2 days ago"]] },
    { name: "Repair & recalibration for legacy recorders", teaser: "A decade of beloved discontinued recorders is aging out, and manufacturers stopped servicing them.", demand: 55, revenue: "$7k/mo", revenueNote: "one-operator ceiling",
      thesis: "Owners will pay to keep gear they trust rather than re-buy. Service demand is rising exactly as official support disappears.",
      metrics: [["Demand", "55"], ["Competition", "12"], ["Rev. potential", "$7k/mo"], ["Confidence", "High"]],
      trend: [29, 33, 31, 38, 41, 44, 42, 48, 51, 54, 53, 58], trendStart: "Sep 2025", trendEnd: "Aug 2026", trendNote: "+66% search interest, 12 mo",
      audience: "Working recordists and podcasters with a recorder they have used for eight years and refuse to replace, plus schools with aging equipment budgets.",
      audienceFacts: [["Median ticket", "$145 / repair"], ["Repeat rate", "1.2 / yr"], ["Where they are", "Forums, local referral"]],
      keywords: [["repair discontinued field recorder", "1.6k/mo", "KD 5", "+74%"], ["xlr input repair cost", "2.4k/mo", "KD 8", "+41%"], ["recorder preamp noise fix", "1.1k/mo", "KD 6", "+58%"], ["replacement battery door", "890/mo", "KD 3", "+36%"]],
      competitors: [["Manufacturer service", "official", "Refuses out-of-warranty legacy models by policy — the reason this exists."], ["Generic electronics shops", "local", "No audio-specific calibration capability; customers do not trust them with a preamp."], ["One specialist shop", "est. $8k/mo", "Six-week backlog and no online booking. The demand overflow is visible in forum posts."]],
      playbook: [["01", "Flat-rate mail-in repair", "Published pricing by fault type removes the quote friction that loses jobs.", "64% margin"], ["02", "Parts harvesting", "Buy dead units for donor parts; the cheapest inventory in the business.", "78% margin"], ["03", "Institutional contracts", "School and university AV departments on annual servicing agreements.", "58% margin"]],
      ideas: ["Flat-rate published repair menu", "Online booking with turnaround guarantee", "Repair teardown content per model", "Refurbished units with a warranty", "3D-printed replacement doors and clips", "Institutional annual service plans"],
      sourcing: ["Donor units regularly available under $60; set marketplace alerts by model.", "Common failure parts (jacks, encoders, doors) sourceable at $2–$14 or 3D-printable in-house.", "Calibration equipment is a one-time $2,800 investment and the actual barrier to entry."],
      risks: [["Medium", "Skill-gated and time-bound: revenue scales with your hands, not your marketing."], ["Medium", "Parts availability degrades over time for the oldest models."], ["Low", "The installed base of trusted legacy gear is large and aging into service."]],
      sources: [["Forum repair-request mining", "today"], ["Marketplace dead-unit pricing", "yesterday"], ["Manufacturer service policy review", "3 days ago"], ["Keyword set, repair cluster", "today"], ["Specialist shop backlog signals", "1 week ago"]] }
  ]
};

export const EXAMPLE_MARKETS = Object.keys(SEED_DATA);
