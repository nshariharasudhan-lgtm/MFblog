import { ArticlePost } from "../types";
import { GLOSSARY_TERMS, GlossaryTerm } from "./glossaryData";
import keywordsData from "./keywords.json";

export interface HubPrinciple {
  title: string;
  description: string;
}

export interface HubCalculator {
  id: string;
  name: string;
  url: string;
  badge: string;
  description: string;
}

export interface HubFAQ {
  question: string;
  answer: string;
  complianceNote?: string;
}

export interface TopicHubData {
  id: string; // e.g. "basics", "safety-and-risk", "tax-and-elss", "fees", "redemption", "sip-swp-stp", "comparisons"
  slug: string;
  title: string;
  clusterName: string;
  badge: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  intro: string;
  detailedIntro: string[];
  principles: HubPrinciple[];
  primaryCalculator: HubCalculator;
  relatedCalculators: HubCalculator[];
  primaryGlossaryTermId: string;
  relatedGlossaryTermIds: string[];
  faqs: HubFAQ[];
  matchedArticleSlugs: string[];
}

// Clean answers that have "DRAFT: verify before publishing." prefix
function cleanAnswer(ans?: string): string {
  if (!ans) return "";
  return ans.replace(/^DRAFT:\s*verify before publishing\.\s*/i, "").trim();
}

// Extract answered FAQs from keywords.json for a specific cluster
function getClusterFAQs(cluster: string, limit = 5): HubFAQ[] {
  const matches = (keywordsData as any[]).filter(
    (k) => k.cluster === cluster && k.answer && k.answer.trim().length > 0
  );
  return matches.slice(0, limit).map((k) => ({
    question: k.keyword,
    answer: cleanAnswer(k.answer),
    complianceNote: k.complianceNote,
  }));
}

export const TOPIC_HUBS: TopicHubData[] = [
  // 1. Basics
  {
    id: "basics",
    slug: "basics",
    title: "Mutual Fund Basics & Fundamentals",
    clusterName: "Basics",
    badge: "Core Investment Foundation",
    metaTitle: "Mutual Fund Basics: How Mutual Funds Work in India | YieldNest",
    metaDescription:
      "Comprehensive guide to Indian mutual fund basics: asset pooling, AMC structures under SEBI, NAV allotment, Growth vs IDCW options, and folio setup.",
    keywords:
      "mutual fund basics, how mutual funds work in india, mutual fund fundamentals, NAV meaning, AMC SEBI, folio number, growth vs idcw",
    intro:
      "A mutual fund is an institutional collective investment vehicle regulated by SEBI that pools capital from retail and institutional investors. The accumulated corpus is deployed across a diversified portfolio of equities, debt instruments, or money market securities in accordance with the scheme's statutory mandate.",
    detailedIntro: [
      "In India, mutual funds operate under a strict three-tier regulatory structure established by the Securities and Exchange Board of India (SEBI). The Sponsor establishes the fund, the independent Board of Trustees protects unitholders' interests, and the Asset Management Company (AMC) employs professional fund managers to make investment decisions within prescribed exposure caps.",
      "Every investor receives fund units in proportion to their invested capital. The unit price, known as Net Asset Value (NAV), is published daily on every business day after market close. By investing through mutual funds, retail investors achieve institutional-grade diversification, professional risk management, and operational convenience starting from as little as ₹100 to ₹500 per month.",
      "Understanding the foundational distinction between Growth options (where returns compound internally) and IDCW options (where payouts are distributed and taxed as income) is essential for aligning fund selection with your long-term wealth horizon.",
    ],
    principles: [
      {
        title: "Diversification Over Concentration",
        description:
          "SEBI mandates strict exposure limits (typically max 10% in a single company stock), preventing total capital wipeout even if individual firms fail.",
      },
      {
        title: "Three-Tier Fiduciary Safeguard",
        description:
          "Sponsor, independent Trustees, and AMC separation ensures fund assets are segregated in custodian accounts and never mingled with corporate liabilities.",
      },
      {
        title: "Daily Transparent Valuation (NAV)",
        description:
          "Net Asset Value is computed daily using marked-to-market prices minus permissible Total Expense Ratio (TER), ensuring uniform entry and exit pricing.",
      },
      {
        title: "Accessible Minimum Ticket Size",
        description:
          "Through Systematic Investment Plans (SIPs), individuals can access high-ticket Indian equities and debt instruments for as low as ₹100 per installment.",
      },
    ],
    primaryCalculator: {
      id: "sip",
      name: "SIP Compounding Calculator",
      url: "/calculators/sip",
      badge: "Flagship Tool",
      description:
        "Model future wealth accumulation from monthly Systematic Investment Plans with rupee cost averaging and growth curve analysis.",
    },
    relatedCalculators: [
      {
        id: "lumpsum",
        name: "Lumpsum Calculator",
        url: "/calculators/lumpsum",
        badge: "One-Time",
        description:
          "Calculate terminal maturity values and post-tax net corpus for one-time lumpsum allocations over 1 to 30 years.",
      },
      {
        id: "step-up-sip",
        name: "Step-Up SIP Calculator",
        url: "/calculators/step-up-sip",
        badge: "Appraisal Top-Up",
        description:
          "Simulate how annual top-ups (5% to 25%) linked to salary increments dramatically accelerate wealth milestones.",
      },
    ],
    primaryGlossaryTermId: "mutual-fund",
    relatedGlossaryTermIds: [
      "nav",
      "aum",
      "amc",
      "amfi",
      "folio-number",
      "idcw",
      "isin",
    ],
    faqs: [
      {
        question: "What is a mutual fund and how does it work in India?",
        answer:
          "A mutual fund is a professionally managed collective investment vehicle regulated by SEBI that pools capital from multiple retail and institutional investors. The pooled corpus is invested across a diversified portfolio of equities, debt instruments, or money market securities in accordance with the scheme's stated investment objective. Each investor is allotted units corresponding proportionally to their contribution, with daily portfolio value reflected through the Net Asset Value (NAV).",
        complianceNote:
          "Educational definition only. Explain asset pooling and AMC role under SEBI regulations.",
      },
      {
        question:
          "What is the difference between Growth and IDCW options in mutual funds?",
        answer:
          "In the Growth option, all profits, interest, and capital gains generated by portfolio securities remain invested inside the fund, allowing the Net Asset Value (NAV) to compound uninterrupted over time. In the Income Distribution cum Capital Withdrawal (IDCW) option (formerly Dividend Plan), the AMC periodically distributes declared payouts to unitholders, which are taxed at the investor's applicable marginal income tax slab rate and reduce the fund's NAV by the exact payout amount.",
        complianceNote:
          "Clarify IDCW is distribution of investor capital and profits, not a corporate dividend, and taxed at slab rates.",
      },
      {
        question:
          "Can a student or unemployed person invest in mutual funds in India?",
        answer:
          "Yes, any Indian citizen aged 18 or older can invest in mutual funds regardless of employment status, provided they complete mandatory SEBI Know Your Customer (KYC) verification with a valid PAN, Aadhaar, and active individual bank account. For minors under 18, investments can be initiated by a parent or legal guardian acting on their behalf until they attain adulthood.",
        complianceNote:
          "Clarify KYC prerequisites (PAN, bank account) without giving tax advice.",
      },
      {
        question:
          "Is a Demat account mandatory for investing in mutual funds?",
        answer:
          "No, a Demat account is not required to invest in regular open-ended mutual funds in India. Investors can hold units directly in physical statement-of-account (SOA) format under an AMC folio or centralized platforms like MF Central, CAMS, and KFintech. A Demat account is only mandatory if you invest in Exchange Traded Funds (ETFs) or choose to execute transactions directly through stock exchange trading terminals.",
        complianceNote:
          "Explain SOA mode vs Demat mode and clarify ETF demat requirement.",
      },
    ],
    matchedArticleSlugs: [
      "best-mutual-funds-india-2026-data-analysis",
      "amfi-latest-regulatory-updates-categorization-norms-transparency",
      "evaluating-mutual-fund-performance-rolling-returns-risk-ratios",
    ],
  },

  // 2. Safety & Risk
  {
    id: "safety-and-risk",
    slug: "safety-and-risk",
    title: "Safety, Risk Architecture & Downside Protection",
    clusterName: "Safety",
    badge: "Capital Preservation & Volatility",
    metaTitle:
      "Mutual Fund Safety & Risk: Can You Lose All Your Money? | YieldNest",
    metaDescription:
      "In-depth analysis of mutual fund safety, SEBI riskometer classifications, liquidity stress tests, AMC insolvency rules, and downside capture metrics.",
    keywords:
      "mutual fund safety, can mutual funds go to zero, SEBI riskometer, small cap stress test, liquidity risk, AMC shutdown safety, downside capture",
    intro:
      "Mutual funds carry market risk and are not government-guaranteed or insured by DICGC like bank fixed deposits. However, mutual funds hold diversified baskets across dozens of companies or bonds, making a 100% total loss mathematically improbable under standard SEBI diversification mandates.",
    detailedIntro: [
      "Risk in mutual funds is multi-dimensional: market risk (equity price cycles), credit risk (bond default probabilities), duration risk (interest rate shifts), and liquidity risk (the speed at which securities can be converted to cash during market distress).",
      "SEBI introduced the mandatory 6-tier Riskometer framework (Low, Low to Moderate, Moderate, Moderately High, High, Very High) which AMCs must update monthly based on actual underlying portfolio holding scores. Furthermore, SEBI and AMFI mandate regular liquidity stress testing for mid-cap and small-cap schemes, publishing 'days-to-liquidate' metrics to safeguard unitholders against sudden redemption panics.",
      "If an AMC shuts down or goes bankrupt, investors' money remains legally separate in custodian-held trust accounts. Trustees appoint a successor AMC or liquidate portfolio assets systematically to return fair market value to unitholders under SEBI oversight.",
    ],
    principles: [
      {
        title: "Diversification Shields Against Zero Value",
        description:
          "Because mutual funds hold 40 to 100 distinct securities, a total 100% wipeout requires every single underlying entity to collapse simultaneously.",
      },
      {
        title: "Dynamic Monthly Riskometer Scores",
        description:
          "AMCs are legally required to evaluate underlying holdings on the last day of each month and update the scheme's Riskometer tier transparently.",
      },
      {
        title: "Mandatory Stress Testing & Liquidity Buffers",
        description:
          "Small and mid-cap funds publish days-to-liquidate 25% and 50% of their portfolios, maintaining liquidity cushions against mass redemptions.",
      },
      {
        title: "Fiduciary Segregation from AMC Balance Sheet",
        description:
          "Fund assets are held by independent SEBI-registered designated custodians and cannot be accessed by creditors if an AMC experiences financial distress.",
      },
    ],
    primaryCalculator: {
      id: "cost-of-delay",
      name: "Cost of Delay Calculator",
      url: "/calculator/cost-of-delay",
      badge: "Risk Mitigation",
      description:
        "Understand the hidden risk of market timing hesitation and how delaying capital deployment permanently erodes compound terminal wealth.",
    },
    relatedCalculators: [
      {
        id: "lumpsum",
        name: "Lumpsum Calculator",
        url: "/calculators/lumpsum",
        badge: "Risk Horizon",
        description:
          "Evaluate 3Y, 5Y, and 10Y rolling horizon outcomes to see how holding periods compress downside return volatility.",
      },
      {
        id: "sip",
        name: "SIP Volatility Averaging Calculator",
        url: "/calculators/sip",
        badge: "Rupee Cost Averaging",
        description:
          "Model how automated periodic purchasing converts market drawdowns into higher unit accumulation during corrections.",
      },
    ],
    primaryGlossaryTermId: "riskometer",
    relatedGlossaryTermIds: [
      "beta",
      "standard-deviation",
      "sharpe-ratio",
      "sortino-ratio",
      "tracking-error",
      "side-pocketing",
    ],
    faqs: [
      {
        question: "Are mutual funds safe or can I lose my entire capital?",
        answer:
          "Mutual funds carry market risk and are not government-guaranteed or insured by DICGC like bank fixed deposits. However, mutual funds hold diversified baskets across dozens of companies or bonds, making a 100% total loss mathematically improbable unless every underlying issuer defaults simultaneously. While interim portfolio values fluctuate with market cycles, risk levels vary significantly from overnight debt funds (lowest volatility) to thematic equities (highest volatility).",
        complianceNote:
          "Disclose market risks; clarify diversification protects against total wipeout but volatility exists.",
      },
      {
        question:
          "What happens if a mutual fund Asset Management Company (AMC) shuts down?",
        answer:
          "In India, mutual funds are structured under a strict three-tier regulatory framework governed by SEBI: the Sponsor, the Board of Trustees, and the AMC. Investor funds and portfolio securities are held in independent custody accounts by registered Custodians, segregated entirely from the AMC's corporate balance sheet. If an AMC ceases business operations, the Board of Trustees, under SEBI supervision, transfers management to another registered AMC or liquidates the portfolio to return fair NAV market value to unitholders.",
        complianceNote:
          "Explain trust structure, custodian role, and unitholder protection mechanisms under SEBI rules.",
      },
      {
        question:
          "What is the SEBI Riskometer and what do its 6 risk levels mean?",
        answer:
          "The SEBI Riskometer is a standardized regulatory graphical depiction that AMCs are legally mandated to publish for every scheme, categorizing portfolio risk into six tiers: Low, Low to Moderate, Moderate, Moderately High, High, and Very High. Unlike static marketing materials, the Riskometer is computed dynamically on the last business day of every month based on actual weighted portfolio metrics including volatility, credit ratings, duration, and liquidity.",
        complianceNote:
          "State the 6 tiers and emphasize that riskometers are updated monthly based on actual underlying holdings.",
      },
      {
        question:
          "Can a mutual fund invest in unlisted equity shares in India?",
        answer:
          "Under SEBI regulations instituted in 2019, open-ended mutual fund schemes are strictly prohibited from investing fresh unitholder capital in unlisted equity shares to protect retail liquidity. Only close-ended schemes and certain pre-existing legacy exposures subject to severe regulatory caps are permitted, ensuring that portfolio valuations remain transparent and readily realizable during market redemptions.",
        complianceNote:
          "Highlight SEBI 2019 regulatory cap on unlisted equities for open-ended schemes.",
      },
    ],
    matchedArticleSlugs: [
      "small-cap-mutual-funds-stress-test-sebi-amfi-liquidity",
      "evaluating-mutual-fund-performance-rolling-returns-risk-ratios",
      "mid-cap-vs-small-cap-analyzing-risk-adjusted-returns-amidst-current-market",
    ],
  },

  // 3. Tax & ELSS
  {
    id: "tax-and-elss",
    slug: "tax-and-elss",
    title: "Mutual Fund Taxation & ELSS Rules (2026 Code)",
    clusterName: "Tax",
    badge: "Tax Code Compliance",
    metaTitle:
      "Mutual Fund Taxation 2026: STCG, LTCG & ELSS Lock-in Rules | YieldNest",
    metaDescription:
      "Complete guide to Indian mutual fund taxation under the 2024-2026 Finance Act. Equity LTCG (12.5%), STCG (20%), Section 80C ELSS rules, and debt taxation.",
    keywords:
      "mutual fund tax 2026, LTCG mutual funds 12.5, STCG mutual funds 20, ELSS tax saving, Section 80C mutual fund, debt fund tax slab, capital gains mutual fund",
    intro:
      "Taxation on Indian mutual funds is categorized based on asset allocation (equity vs debt vs hybrid) and the holding duration before redemption. Following statutory amendments under the Finance Act 2024, equity LTCG is taxed at 12.5% above ₹1.25 Lakh, while STCG stands at 20%.",
    detailedIntro: [
      "For equity-oriented mutual funds (schemes deploying >= 65% in domestic equities), units held for 12 months or less attract Short-Term Capital Gains (STCG) tax at a flat 20% (plus applicable surcharge and cess). Units held beyond 12 months qualify as Long-Term Capital Gains (LTCG), taxed at 12.5% on aggregate net long-term gains exceeding the statutory annual exemption threshold of ₹1,25,000 across all equity investments.",
      "Specified debt mutual funds (holding <= 35% in equity) purchased on or after April 1, 2023, do not enjoy long-term indexation benefits. All capital gains on such funds are treated as short-term and taxed at the investor's applicable marginal income tax slab rate upon redemption.",
      "Equity Linked Savings Schemes (ELSS) remain one of the most popular tax-saving instruments under Section 80C of the Income Tax Act (Old Tax Regime), offering deductions up to ₹1,50,000 per financial year with a mandatory 3-year statutory lock-in period from the date of each unit allotment.",
    ],
    principles: [
      {
        title: "Equity 12-Month Holding Benchmark",
        description:
          "Holding equity fund units for >= 12 months shifts gains from 20% flat STCG to 12.5% LTCG with a ₹1.25 Lakh annual tax-free window.",
      },
      {
        title: "Annual ₹1,25,000 LTCG Exemption Window",
        description:
          "Unrealized gains below ₹1.25 Lakh can be harvested annually without attracting tax liability, resetting the cost acquisition baseline.",
      },
      {
        title: "ELSS 3-Year Lock-in Per Unit Tranche",
        description:
          "Each individual monthly SIP installment in an ELSS scheme is subject to its own separate 36-month lock-in before redemption eligibility.",
      },
      {
        title: "Debt Funds Taxed at Marginal Slab Rate",
        description:
          "Post-April 2023 investments in debt funds are taxed at your personal slab rate, eliminating indexation benefits for pure fixed-income schemes.",
      },
    ],
    primaryCalculator: {
      id: "lumpsum",
      name: "Mutual Fund Tax & Compounding Estimator",
      url: "/calculators/lumpsum",
      badge: "Tax Modeler",
      description:
        "Input your holding horizon and custom LTCG tax rates (12.5% default) and ₹1.25 Lakh exemption to calculate net post-tax maturity wealth.",
    },
    relatedCalculators: [
      {
        id: "sip",
        name: "SIP Wealth & Tax Estimator",
        url: "/calculators/sip",
        badge: "SIP Post-Tax",
        description:
          "Estimate long-term capital gains on cumulative SIP installments and evaluate post-tax purchasing power adjusted for inflation.",
      },
      {
        id: "step-up-sip",
        name: "Step-Up SIP Tax Forecaster",
        url: "/calculators/step-up-sip",
        badge: "Wealth Milestones",
        description:
          "Forecast long-range portfolio values with tax exemption deductions factored in over 15 to 25 year horizons.",
      },
    ],
    primaryGlossaryTermId: "ltcg",
    relatedGlossaryTermIds: [
      "stcg",
      "elss",
      "lock-in-period",
      "idcw",
      "holding-period",
      "nav",
    ],
    faqs: [
      {
        question:
          "How is equity mutual fund taxation calculated for STCG and LTCG?",
        answer:
          "For equity-oriented mutual funds (allocating >= 65% in domestic equities), investments redeemed within 12 months incur Short-Term Capital Gains (STCG) tax at 20% (plus applicable surcharge and cess). For units held beyond 12 months, Long-Term Capital Gains (LTCG) are taxed at 12.5% on aggregate net long-term gains exceeding ₹1,25,000 in a financial year. Tax rules are governed by the Income Tax Act, 1961, and defaults should be verified against prevailing statutory notifications.",
        complianceNote:
          "State holding period of 12 months for equity and dynamic disclaimer on tax rate updates.",
      },
      {
        question:
          "How are debt mutual funds taxed after the April 2023 amendment?",
        answer:
          "Under amendments introduced in Finance Act 2023, capital gains on specified debt mutual funds (holding not more than 35% in domestic equities) acquired on or after April 1, 2023, are treated as short-term capital gains regardless of the holding period. They are taxed at the investor's applicable marginal income tax slab rates, with indexation benefits no longer available for newly purchased debt units.",
        complianceNote:
          "Clarify removal of indexation for specified debt funds purchased on or after April 1, 2023.",
      },
      {
        question:
          "What is an ELSS mutual fund and what are its lock-in rules?",
        answer:
          "Equity Linked Savings Schemes (ELSS) are diversified equity mutual funds eligible for a tax deduction of up to ₹1,50,000 under Section 80C of the Income Tax Act (Old Tax Regime). ELSS investments are subject to a mandatory 3-year statutory lock-in period from the date of allotment—the shortest among 80C instruments. If investing via monthly SIP, each installment has an independent 3-year lock-in cycle before becoming redeemable.",
        complianceNote:
          "Disclose 3-year lock-in, 80C applicability under Old Regime, and independent SIP installment lock-in cycles.",
      },
      {
        question:
          "How does Capital Loss Harvesting work in mutual funds in India?",
        answer:
          "Tax-loss harvesting involves strategically selling underperforming mutual fund units at an unrealized loss before the end of the financial year to offset realized taxable capital gains. Under the Income Tax Act, Short-Term Capital Losses (STCL) can be set off against both STCG and LTCG, while Long-Term Capital Losses (LTCL) can only be set off against LTCG. Unadjusted losses can be carried forward for up to 8 assessment years provided the tax return is filed within statutory due dates.",
        complianceNote:
          "Explain STCL and LTCL set-off rules under Section 70/74 with disclaimer to consult a Chartered Accountant.",
      },
    ],
    matchedArticleSlugs: [
      "evaluating-mutual-fund-performance-rolling-returns-risk-ratios",
      "why-total-expense-ratio-ter-is-important-for-investors",
      "direct-vs-regular-mutual-funds-charges-commissions-compounding",
    ],
  },

  // 4. Fees
  {
    id: "fees",
    slug: "fees",
    title: "Mutual Fund Fees, TER & Distributor Drag",
    clusterName: "Fees",
    badge: "Expense Drag & Fee Transparency",
    metaTitle:
      "Mutual Fund Fees & TER: Direct vs Regular Expense Drag | YieldNest",
    metaDescription:
      "Quantitative breakdown of Total Expense Ratios (TER), distributor trail commissions, exit loads, and the compounding wealth drag of regular mutual fund plans.",
    keywords:
      "mutual fund fees, TER mutual fund, total expense ratio, direct vs regular mutual fund, distributor trail commission, exit load rules, expense ratio drag",
    intro:
      "Every mutual fund scheme levies an annual Total Expense Ratio (TER) to cover fund management, custodian charges, registrar services, marketing, and distributor commissions. The fee differential between Direct and Regular plans (0.50% to 1.25% annually) compounds to massive wealth erosion over long horizons.",
    detailedIntro: [
      "The Total Expense Ratio (TER) is not billed to the investor directly; rather, it is deducted fractionally on a daily basis from the scheme's gross Net Asset Value (NAV) before daily NAV figures are declared to the public. Even a seemingly small 1% difference in annual expense ratio can consume 20% to 30% of your potential terminal wealth over a 25-year compounding period.",
      "Direct plans are purchased directly from the AMC or direct investment platforms without distributor intermediaries, eliminating recurring trail commissions. Regular plans include an embedded distributor commission paid continuously for as long as the investor remains invested, creating an avoidable drag on compounding.",
      "Other operational fees include Exit Loads (fractional charges of 0.50% to 1.00% applied if units are redeemed within a specified threshold, such as 30 to 365 days) and the statutory Stamp Duty of 0.005% levied on all unit purchases across India.",
    ],
    principles: [
      {
        title: "Daily NAV Fee Deduction",
        description:
          "TER is computed daily: Daily TER = (Annual TER% / 365) * Daily Net Assets. You never receive an invoice, making expense drag invisible unless tracked.",
      },
      {
        title: "SEBI Mandated TER Slabs",
        description:
          "SEBI enforces tiered TER caps that decrease as a fund's AUM grows (from 2.25% down to 1.05% for large equity schemes), transferring scale economies to investors.",
      },
      {
        title: "Compounding Asymmetry of Commissions",
        description:
          "A 1.0% distributor trail commission does not simply reduce returns by 1%; over 20 years at 12% CAGR, it strips away roughly 22% of total accumulated corpus.",
      },
      {
        title: "Exit Load Applies to Liquidity Timing",
        description:
          "Exit loads protect existing long-term unitholders by penalizing short-term flippers, with all collected exit load revenue credited back directly to the fund.",
      },
    ],
    primaryCalculator: {
      id: "direct-vs-regular",
      name: "Direct vs Regular TER Drag Calculator",
      url: "/calculator/direct-vs-regular",
      badge: "Fee Analyzer",
      description:
        "Calculate the exact rupee wealth lost to distributor trail commissions across 5, 10, 20, and 30-year SIP or lumpsum investment journeys.",
    },
    relatedCalculators: [
      {
        id: "step-up-sip",
        name: "Step-Up SIP Compounding Calculator",
        url: "/calculators/step-up-sip",
        badge: "Fee Compounding",
        description:
          "Examine how fee drag expands exponentially when combined with rising monthly contributions in regular vs direct plans.",
      },
      {
        id: "cost-of-delay",
        name: "Cost of Delay Calculator",
        url: "/calculator/cost-of-delay",
        badge: "Opportunity Cost",
        description:
          "Compare the financial drag of paying distributor fees versus delaying your initial investment start date.",
      },
    ],
    primaryGlossaryTermId: "expense-ratio",
    relatedGlossaryTermIds: [
      "ter",
      "direct-plan",
      "regular-plan",
      "exit-load",
      "stamp-duty",
      "nav",
    ],
    faqs: [
      {
        question:
          "What is the difference between Direct and Regular mutual fund plans?",
        answer:
          "Direct plans are bought directly from the AMC or direct investment platforms without intermediary involvement, resulting in a lower Total Expense Ratio (TER) since no distributor commissions are paid. Regular plans are sold through mutual fund distributors (MFDs) or banks, where a recurring trail commission (typically 0.50% to 1.25% per annum) is deducted directly from the fund's daily NAV. Over an investment horizon of 15 to 25 years, this fee differential can compound to a substantial difference in total accumulated wealth.",
        complianceNote:
          "Explain distributor commission deduction in regular plans and its compounding drag over time.",
      },
      {
        question:
          "What is Total Expense Ratio (TER) and how is it charged?",
        answer:
          "The Total Expense Ratio (TER) represents the annual percentage of a scheme's average daily net assets utilized to cover operational management, registrar fees, custodian charges, audit expenses, and legal oversight. SEBI mandates strict tiered caps on TER based on fund asset size (AUM). The TER is not billed as a standalone invoice to unitholders; rather, it is calculated and deducted fractionally from the fund's NAV on a daily basis.",
        complianceNote:
          "Disclose that TER is deducted daily from NAV and regulated by SEBI asset-tier limits.",
      },
      {
        question:
          "What is an Exit Load in mutual funds and when does it apply?",
        answer:
          "An Exit Load is a fractional fee (commonly 0.5% to 1.0%) charged by an AMC when an investor redeems or switches fund units before completing a stipulated minimum holding period (typically ranging from 7 days for debt funds to 1 year for equity funds). It is designed to discourage short-term speculative trading and protect long-term unitholders. Under SEBI regulations, all exit load proceeds collected are credited directly back into the scheme's corpus.",
        complianceNote:
          "Clarify exit loads protect long-term unitholders and are credited back to the fund scheme.",
      },
      {
        question:
          "What is a Stamp Duty charge on mutual fund purchases in India?",
        answer:
          "Under the amended Indian Stamp Act, a statutory stamp duty of 0.005% (₹5 per ₹1 Lakh invested) is levied on the purchase value of all mutual fund units, including lumpsum investments, SIP installments, STP transfers, and dividend reinvestments. The stamp duty is deducted upfront from the gross transaction value before units are allocated at the prevailing NAV.",
        complianceNote:
          "Mention 0.005% statutory rate on all purchases under the Indian Stamp Act.",
      },
    ],
    matchedArticleSlugs: [
      "direct-vs-regular-mutual-funds-charges-commissions-compounding",
      "why-total-expense-ratio-ter-is-important-for-investors",
      "parag-parikh-flexi-cap-vs-mirae-asset-large-midcap",
    ],
  },

  // 5. Redemption
  {
    id: "redemption",
    slug: "redemption",
    title: "Redemption, Cut-Off Timings & Operational Settlement",
    clusterName: "Redemption",
    badge: "Operational Mechanics",
    metaTitle:
      "Mutual Fund Redemption: Cut-Off Times & Settlement Cycles | YieldNest",
    metaDescription:
      "Detailed guide to mutual fund redemption rules in India: cut-off timings for same-day NAV, T+1/T+2 bank settlement cycles, and Systematic Withdrawal Plans (SWP).",
    keywords:
      "mutual fund redemption, mutual fund cut off time, how many days for mutual fund withdrawal, SWP mutual fund, T+1 settlement mutual fund, same day NAV allotment",
    intro:
      "Redeeming mutual fund units involves liquidating unitholder holdings at the applicable Net Asset Value (NAV) subject to statutory cut-off timings and settlement cycles. With Indian equity markets operating on expedited T+1 settlement, redemption payouts reach verified bank accounts faster than ever.",
    detailedIntro: [
      "Under SEBI regulations, the cut-off timing for submitting redemption requests to receive same-day closing NAV is 3:00 PM on business days for equity, hybrid, and debt schemes (1:30 PM for liquid and overnight funds). Requests submitted after the cut-off receive the NAV of the subsequent business day.",
      "Following the nationwide migration to expedited settlement cycles, proceeds from equity mutual fund redemptions are typically credited to your registered bank account within T+2 business days (and T+1 for many debt/liquid funds). Unitholders are protected against delays: SEBI mandates that AMCs pay penal interest (typically 15% p.a.) if redemption proceeds are dispatched beyond statutory deadlines.",
      "For retirees and wealth decumulators, a Systematic Withdrawal Plan (SWP) provides automated monthly liquidity without incurring the full tax penalty of lump-sum exits, redeeming only fractional units to generate predictable cash flow.",
    ],
    principles: [
      {
        title: "3:00 PM Standard Cut-Off Threshold",
        description:
          "Orders timestamped before 3:00 PM on trading days receive that day's closing NAV; later orders receive the next working day's valuation.",
      },
      {
        title: "Expedited T+1 & T+2 Bank Transfers",
        description:
          "Liquid fund proceeds are credited within T+1 working days, while equity funds settle within T+2 working days directly via NEFT/RTGS.",
      },
      {
        title: "Tax-Advantaged SWP Cash Flows",
        description:
          "Unlike FD interest where 100% of payout is taxable, each SWP redemption consists predominantly of original principal return with fractional capital gain.",
      },
      {
        title: "Direct Bank Account Crediting",
        description:
          "For fraud prevention, redemptions can only be paid out to pre-verified bank accounts mapped to the folio's KYC credentials under SEBI AML guidelines.",
      },
    ],
    primaryCalculator: {
      id: "lumpsum",
      name: "Lumpsum & Redemption Value Calculator",
      url: "/calculators/lumpsum",
      badge: "Redemption Forecaster",
      description:
        "Model redemption proceeds, applicable exit loads, and estimated capital gains taxes prior to liquidating portfolio folios.",
    },
    relatedCalculators: [
      {
        id: "cost-of-delay",
        name: "Cost of Delay & Timing Calculator",
        url: "/calculator/cost-of-delay",
        badge: "Cash Flow Timing",
        description:
          "Assess how early vs delayed withdrawals affect your remaining portfolio's longevity and compounding capacity.",
      },
      {
        id: "sip-vs-lumpsum",
        name: "SIP vs Lumpsum Comparison Calculator",
        url: "/calculator/sip-vs-lumpsum",
        badge: "Liquidity Strategy",
        description:
          "Compare the liquidity profiles and terminal outcomes of staggered monthly allocations versus upfront lump-sum capital commitments.",
      },
    ],
    primaryGlossaryTermId: "redemption",
    relatedGlossaryTermIds: [
      "swp",
      "cut-off-timing",
      "settlement-cycle",
      "can",
      "exit-load",
      "nav",
    ],
    faqs: [
      {
        question:
          "What are the cut-off timings for mutual fund purchases and redemptions?",
        answer:
          "Under SEBI regulations, same-day NAV allotment for purchases across all mutual fund schemes (except liquid and overnight funds) requires both the transaction application and realization of funds into the AMC's bank account before 3:00 PM on a business day. For redemptions, applications submitted and time-stamped before 3:00 PM receive the same business day's closing NAV, whereas requests submitted after 3:00 PM receive the NAV of the subsequent business day.",
        complianceNote:
          "State 3:00 PM cut-off and explain the mandatory realization-of-funds rule for purchases.",
      },
      {
        question:
          "How many business days does it take to receive money after mutual fund redemption?",
        answer:
          "Following the transition of Indian equity markets to expedited settlement cycles, redemptions from equity mutual funds are typically credited to the investor's registered bank account within T+2 business days (where T is the transaction date). For debt and liquid funds, settlement is faster, taking T+1 business days. In case of operational delays exceeding statutory limits, SEBI mandates that AMCs pay penal interest to unitholders.",
        complianceNote:
          "Clarify T+2 for equity and T+1 for debt/liquid funds under current SEBI settlement norms.",
      },
      {
        question:
          "What is a Systematic Withdrawal Plan (SWP) and how does it work?",
        answer:
          "A Systematic Withdrawal Plan (SWP) allows unit-holders to redeem a predetermined rupee amount from an existing mutual fund scheme at regular monthly, quarterly, or annual intervals. The AMC liquidates the exact fractional number of units required to generate the requested withdrawal amount based on that day's prevailing NAV. SWP is significantly more tax-efficient than bank fixed deposit interest because withdrawals consist primarily of capital return, with only the capital gains fraction subject to tax.",
        complianceNote:
          "Highlight tax efficiency compared to interest income and explain how fractional units are liquidated.",
      },
    ],
    matchedArticleSlugs: [
      "amfi-latest-regulatory-updates-categorization-norms-transparency",
      "evaluating-mutual-fund-performance-rolling-returns-risk-ratios",
      "small-cap-mutual-funds-stress-test-sebi-amfi-liquidity",
    ],
  },

  // 6. SIP/SWP/STP
  {
    id: "sip-swp-stp",
    slug: "sip-swp-stp",
    title: "SIP, SWP & STP Systematic Wealth Strategies",
    clusterName: "SIP",
    badge: "Systematic Compounding Engine",
    metaTitle:
      "SIP, SWP & STP Mutual Fund Strategies: Systematic Compounding | YieldNest",
    metaDescription:
      "Master systematic mutual fund strategies in India: rupee cost averaging with SIP, annual salary step-ups, phased STP deployment, and tax-efficient SWP decumulation.",
    keywords:
      "SIP mutual funds, systematic investment plan, step up SIP, top up SIP calculator, SWP mutual fund, STP mutual fund, rupee cost averaging India",
    intro:
      "Systematic investment facilities—SIP, STP, and SWP—automate disciplined capital allocation, eliminate emotional market timing errors, and leverage mathematical compounding. Through rupee cost averaging and annual step-up top-ups, small recurring savings compound into multi-crore wealth.",
    detailedIntro: [
      "A Systematic Investment Plan (SIP) deducts a fixed amount periodically (monthly or weekly) from an investor's bank account via automated NACH / e-mandate. When markets dip, your fixed installment buys more units; when markets rally, those units surge in value, reducing your average cost per unit without requiring market predictions.",
      "A Step-Up SIP (or Top-Up SIP) takes compounding to the next level by automatically raising your monthly installment by a set percentage (e.g. 10%) or fixed sum (e.g. ₹1,000) every year in sync with annual salary appraisals. This small annual increment can double your terminal corpus over a 15 to 20-year career.",
      "A Systematic Transfer Plan (STP) solves the dilemma of deploying large lump sums by parking funds in a low-risk liquid fund and systematically moving fixed amounts weekly into equity funds. A Systematic Withdrawal Plan (SWP) provides the perfect mirror image for retirees, providing regular cash flow with minimal tax drag.",
    ],
    principles: [
      {
        title: "Rupee Cost Averaging Mitigates Timing Risk",
        description:
          "Buying automatically through market highs and lows smooths your unit acquisition cost, outperforming emotional lump-sum market timing.",
      },
      {
        title: "Annual Step-Up Multiplies Terminal Wealth",
        description:
          "A 10% annual step-up on a ₹10,000 monthly SIP over 20 years at 12% CAGR yields ₹1.5 Crore versus ₹1.0 Crore from a flat static SIP.",
      },
      {
        title: "STP Prevents Lumpsum Peak Regret",
        description:
          "Transferring from liquid funds into equities over 6 to 18 months ensures you don't commit all capital at market valuation peaks.",
      },
      {
        title: "No Fines for Missed SIP Installments",
        description:
          "AMCs never levy legal penalties if a scheduled SIP installment fails due to insufficient bank balance; the mandate simply retries next cycle.",
      },
    ],
    primaryCalculator: {
      id: "step-up-sip",
      name: "Step-Up SIP Compounding Calculator",
      url: "/calculators/step-up-sip",
      badge: "Appraisal Top-Up",
      description:
        "Model the dramatic wealth divergence between a static monthly SIP and an annually stepping-up SIP linked to salary increments.",
    },
    relatedCalculators: [
      {
        id: "sip",
        name: "Standard SIP Calculator",
        url: "/calculators/sip",
        badge: "Base Compounding",
        description:
          "Calculate maturity corpus, total invested principal, and estimated capital gains for fixed monthly SIP contributions.",
      },
      {
        id: "sip-vs-lumpsum",
        name: "SIP vs Lumpsum Comparison Calculator",
        url: "/calculator/sip-vs-lumpsum",
        badge: "Strategy Showdown",
        description:
          "Compare the long-term wealth accumulation and risk profile of staggered SIP investments against upfront lump-sum deployment.",
      },
    ],
    primaryGlossaryTermId: "sip",
    relatedGlossaryTermIds: [
      "step-up-sip",
      "swp",
      "stp",
      "sip-pause",
      "nav",
      "cagr",
    ],
    faqs: [
      {
        question: "How does a Systematic Investment Plan (SIP) work?",
        answer:
          "A Systematic Investment Plan (SIP) is a mechanism allowing investors to commit a predetermined fixed sum into a mutual fund scheme at regular intervals (monthly, quarterly, or weekly). By investing consistently across market cycles, SIP harnesses rupee cost averaging: purchasing more fund units when prices are low and fewer units when prices are high, eliminating the need to time market peaks and troughs.",
        complianceNote:
          "Explain rupee cost averaging and compounding benefits; avoid promising guaranteed returns.",
      },
      {
        question:
          "What happens if a monthly SIP installment fails due to insufficient bank balance?",
        answer:
          "Asset Management Companies (AMCs) do not levy fines or legal penalties when a scheduled SIP installment fails due to insufficient bank balance; they simply skip purchasing units for that cycle. However, your own bank may impose an ECS/NACH mandate bounce charge (typically ₹250 to ₹500 plus GST). If three consecutive SIP installments fail, AMCs automatically pause or terminate the standing SIP mandate.",
        complianceNote:
          "Clarify AMC does not fine, but bank may levy NACH bounce fee, and mandate terminates after 3 failures.",
      },
      {
        question:
          "What is the minimum amount required to start a mutual fund SIP in India?",
        answer:
          "While statutory regulations do not mandate a uniform national minimum, most Indian AMCs permit monthly SIPs starting from as low as ₹500 or ₹1,000, with select micro-SIP initiatives allowing investments starting at ₹100 or ₹250. This low barrier to entry ensures retail and student investors can build diversified institutional portfolios regardless of initial capital size.",
        complianceNote:
          "Clarify typical range (₹100 to ₹1,000) and emphasize AMC discretion in scheme offer documents.",
      },
      {
        question:
          "Can I stop or pause my mutual fund SIP at any time without penalty?",
        answer:
          "Yes, an investor has complete autonomy to pause, modify, or permanently cancel an ongoing SIP mandate at any time without paying penalties or exit fees to the AMC. Most AMCs and online platforms provide a digital 'SIP Pause' facility that temporarily suspends auto-debits for 1 to 6 months without disturbing previously accumulated units, which continue to compound in your folio.",
        complianceNote:
          "Explain SIP Pause facility and unitholder autonomy to terminate mandates without AMC fines.",
      },
    ],
    matchedArticleSlugs: [
      "direct-vs-regular-mutual-funds-charges-commissions-compounding",
      "parag-parikh-flexi-cap-vs-mirae-asset-large-midcap",
      "best-mutual-funds-india-2026-data-analysis",
    ],
  },

  // 7. Comparisons
  {
    id: "comparisons",
    slug: "comparisons",
    title: "Fund, Category & Strategy Comparisons",
    clusterName: "Categories",
    badge: "Quantitative Factor Analysis",
    metaTitle:
      "Mutual Fund Comparisons: Flexi Cap vs Multi Cap, ETFs & Index | YieldNest",
    metaDescription:
      "Quantitative data-driven comparisons of Indian mutual fund categories: Active vs Passive (Nifty 50), Flexi Cap vs Multi Cap, Mid vs Small Cap, and ETFs.",
    keywords:
      "mutual fund comparisons, flexi cap vs multi cap, index funds vs active funds, mutual funds vs etfs india, small cap vs mid cap, rolling return comparison",
    intro:
      "Unbiased fund comparisons require looking beyond trailing 1-year returns to evaluate rolling return consistency, downside capture ratios, portfolio overlap, and expense drag under SEBI's strict scheme categorization framework.",
    detailedIntro: [
      "Under SEBI's mutual fund categorization directives, schemes are bound by legal allocation minimums. Multi Cap funds must maintain at least 25% each in large, mid, and small caps at all times, whereas Flexi Cap fund managers have unconstrained freedom to navigate dynamically across market caps based on prevailing valuation cycles.",
      "The debate between Active Large-Cap funds and Passive Nifty 50 Index funds has intensified as SPIVA India scorecards demonstrate that over 85% of active large-cap managers fail to beat their benchmark after accounting for expense ratios. Comparing Active vs Passive, ETFs vs Index Funds, and Factor Tilts requires rigorous quantitative rolling metrics.",
      "When comparing peer schemes across market categories (such as Flexi-Cap vs Large & Mid-Cap, or active small-cap strategies), examining portfolio overlap prevents unintentional factor concentration and ensures true structural diversification in your wealth portfolio.",
    ],
    principles: [
      {
        title: "Rolling Returns Reveal True Alpha",
        description:
          "Point-to-point trailing returns are distorted by arbitrary start/end dates; 3Y and 5Y rolling return windows measure consistency through all market cycles.",
      },
      {
        title: "Portfolio Overlap Check Prevents Illusion",
        description:
          "Holding 4 funds with 70% common stock holdings provides zero genuine diversification; compare top 30 holdings before adding new schemes.",
      },
      {
        title: "Active vs Passive Fee Hurdle Rate",
        description:
          "An active fund charging 0.75% more than an index fund must generate over 1.00% gross alpha consistently to deliver superior net post-tax returns.",
      },
      {
        title: "Downside Capture Measures Defense",
        description:
          "A downside capture ratio below 75% indicates that the fund falls significantly less than its benchmark during sharp market drawdowns.",
      },
    ],
    primaryCalculator: {
      id: "sip-vs-lumpsum",
      name: "SIP vs Lumpsum Comparison Calculator",
      url: "/calculator/sip-vs-lumpsum",
      badge: "Allocation Showdown",
      description:
        "Directly compare the wealth creation outcomes, volatility profiles, and cash commitment schedules of SIP versus Lumpsum strategies.",
    },
    relatedCalculators: [
      {
        id: "direct-vs-regular",
        name: "Direct vs Regular TER Drag Calculator",
        url: "/calculator/direct-vs-regular",
        badge: "Fee Showdown",
        description:
          "Model the comparative cost difference between DIY direct plan execution versus distributor-mediated regular plans.",
      },
      {
        id: "step-up-sip",
        name: "Step-Up SIP Compounding Calculator",
        url: "/calculators/step-up-sip",
        badge: "Growth Comparison",
        description:
          "Compare static flat contributions against progressive annual step-up compounding paths.",
      },
    ],
    primaryGlossaryTermId: "benchmark-index",
    relatedGlossaryTermIds: [
      "tri",
      "rolling-returns",
      "alpha",
      "tracking-error",
      "cagr",
      "index-fund",
    ],
    faqs: [
      {
        question:
          "What is the difference between Flexi Cap and Multi Cap mutual funds?",
        answer:
          "Under SEBI categorization mandates, Multi Cap funds are legally obligated to maintain a minimum allocation of at least 25% each in Large-cap, Mid-cap, and Small-cap equities at all times, regardless of market conditions. In contrast, Flexi Cap funds have complete managerial discretion to allocate dynamically across any market capitalization bucket without mandated minimum caps, allowing fund managers to tilt defensively towards large caps during market peaks.",
        complianceNote:
          "Highlight SEBI allocation mandates: Multi Cap (min 25% each) vs Flexi Cap (complete discretion).",
      },
      {
        question:
          "What is an Index Fund and how does it differ from an Exchange Traded Fund (ETF)?",
        answer:
          "Both index funds and Exchange Traded Funds (ETFs) are passive instruments tracking an underlying benchmark like the Nifty 50 or Sensex. However, index fund units are bought and sold directly through the AMC at closing Net Asset Value (NAV) without requiring a Demat account. In contrast, ETFs are listed on stock exchanges and trade in real-time throughout market hours, requiring a Demat and trading account, with transactions executed at live market bid-ask prices.",
        complianceNote:
          "Contrast operational mechanisms: AMC NAV execution (index funds) vs live exchange trading (ETFs).",
      },
      {
        question:
          "What is an Asset Allocation strategy and why is it important in mutual funds?",
        answer:
          "Asset allocation is the strategic division of an investment portfolio across non-correlated asset classes—including equities, debt, gold, and cash equivalents—aligned with an investor's risk tolerance, financial goals, and time horizon. Studies indicate that more than 90% of long-term return variability is determined by broad asset allocation rather than individual security selection or market timing.",
        complianceNote:
          "Emphasize diversification benefits and risk profiling without giving personalized advice.",
      },
      {
        question:
          "What is a Liquid Fund and how does it compare to a bank savings account?",
        answer:
          "Liquid mutual funds are low-duration debt schemes that invest exclusively in short-term money market instruments, commercial paper, and treasury bills with residual maturities of up to 91 days. While bank savings deposits are insured up to ₹5 Lakh by DICGC and provide instant ATM liquidity, liquid funds typically deliver higher market-linked returns with minimal interest rate risk and T+1 business day redemption settlement.",
        complianceNote:
          "Clarify maturity cap of 91 days and lack of DICGC deposit guarantee compared to bank savings.",
      },
    ],
    matchedArticleSlugs: [
      "parag-parikh-flexi-cap-vs-mirae-asset-large-midcap",
      "nifty-50-index-funds-vs-active-large-cap-funds",
      "quant-small-cap-vs-nippon-india-small-cap-comparison",
      "mid-cap-vs-multi-cap-navigating-2026-valuation-premium",
      "mid-cap-vs-small-cap-analyzing-risk-adjusted-returns-amidst-current-market",
      "mutual-funds-vs-etfs-india-guide",
    ],
  },
];

// Helper to look up a Topic Hub by slug/id
export function getTopicHubBySlug(slug: string): TopicHubData | undefined {
  const clean = slug.toLowerCase().trim().replace(/^\/+(hub|topic|topics)\//, "").replace(/\/+$/, "");
  return TOPIC_HUBS.find(
    (h) =>
      h.slug.toLowerCase() === clean ||
      h.id.toLowerCase() === clean ||
      (clean === "safety" && h.id === "safety-and-risk") ||
      (clean === "risk" && h.id === "safety-and-risk") ||
      (clean === "tax" && h.id === "tax-and-elss") ||
      (clean === "elss" && h.id === "tax-and-elss") ||
      (clean === "sip" && h.id === "sip-swp-stp") ||
      (clean === "swp" && h.id === "sip-swp-stp") ||
      (clean === "categories" && h.id === "comparisons")
  );
}

export function getAllTopicHubs(): TopicHubData[] {
  return TOPIC_HUBS;
}

// Maps an article to its most appropriate Topic Hub
export function getHubForArticle(article: ArticlePost): TopicHubData {
  const slug = article.slug.toLowerCase();
  const title = article.title.toLowerCase();
  const category = (article.category || "").toLowerCase();
  const tags = (article.tags || []).map((t) => t.toLowerCase());

  // 1. Direct matchedArticleSlugs
  const directMatch = TOPIC_HUBS.find((h) => h.matchedArticleSlugs.includes(article.slug));
  if (directMatch) return directMatch;

  // 2. Keyword heuristic
  if (slug.includes("ter") || slug.includes("expense") || slug.includes("commission") || title.includes("expense ratio") || tags.includes("ter")) {
    return TOPIC_HUBS.find((h) => h.id === "fees") || TOPIC_HUBS[3];
  }

  if (slug.includes("stress-test") || slug.includes("liquidity") || slug.includes("risk") || title.includes("risk")) {
    return TOPIC_HUBS.find((h) => h.id === "safety-and-risk") || TOPIC_HUBS[1];
  }

  if (slug.includes("tax") || title.includes("tax") || slug.includes("elss") || tags.includes("tax")) {
    return TOPIC_HUBS.find((h) => h.id === "tax-and-elss") || TOPIC_HUBS[2];
  }

  if (slug.includes("sip") || title.includes("sip") || category.includes("sip")) {
    return TOPIC_HUBS.find((h) => h.id === "sip-swp-stp") || TOPIC_HUBS[5];
  }

  if (slug.includes("vs") || title.includes("vs") || category.includes("comparison") || category.includes("deep-dive")) {
    return TOPIC_HUBS.find((h) => h.id === "comparisons") || TOPIC_HUBS[6];
  }

  if (slug.includes("redemption") || slug.includes("nav") || slug.includes("cut-off")) {
    return TOPIC_HUBS.find((h) => h.id === "redemption") || TOPIC_HUBS[4];
  }

  // Default to Basics
  return TOPIC_HUBS[0];
}

// Retrieves the 1 calculator, 1 glossary term, 2 sibling articles, and hub for any article
export function getRelatedItemsForArticle(
  article: ArticlePost,
  allPosts: ArticlePost[]
): {
  hub: TopicHubData;
  calculator: HubCalculator;
  glossaryTerm: GlossaryTerm;
  siblingArticles: ArticlePost[];
} {
  const hub = getHubForArticle(article);

  // 1. Pick 1 calculator tailored to this article or hub's primary
  let calculator = hub.primaryCalculator;
  if (article.slug.includes("direct-vs-regular") || article.slug.includes("ter")) {
    calculator = {
      id: "direct-vs-regular",
      name: "Direct vs Regular TER Drag Calculator",
      url: "/calculator/direct-vs-regular",
      badge: "Fee Analyzer",
      description:
        "Model the compounding wealth loss caused by distributor trail commissions over 10 to 25 year holding horizons.",
    };
  } else if (article.slug.includes("step-up") || article.slug.includes("appraisal")) {
    calculator = {
      id: "step-up-sip",
      name: "Step-Up SIP Compounding Calculator",
      url: "/calculators/step-up-sip",
      badge: "Appraisal Top-Up",
      description:
        "Simulate how annual top-ups (5% to 25%) linked to salary increments accelerate long-term mutual fund wealth creation.",
    };
  } else if (article.slug.includes("stress-test") || article.slug.includes("performance")) {
    calculator = {
      id: "sip-vs-lumpsum",
      name: "SIP vs Lumpsum Comparison Calculator",
      url: "/calculator/sip-vs-lumpsum",
      badge: "Allocation Strategy",
      description:
        "Compare the volatility resilience and terminal corpus of systematic dollar-cost averaging versus upfront lumpsum deployment.",
    };
  }

  // 2. Pick 1 glossary term tailored to this article
  let termId = hub.primaryGlossaryTermId;
  if (article.slug.includes("ter") || article.slug.includes("charges")) {
    termId = "expense-ratio";
  } else if (article.slug.includes("stress-test") || article.slug.includes("liquidity")) {
    termId = "standard-deviation";
  } else if (article.slug.includes("index") || article.slug.includes("etf")) {
    termId = "tracking-error";
  } else if (article.slug.includes("rolling-return")) {
    termId = "rolling-returns";
  } else if (article.slug.includes("regulatory") || article.slug.includes("amfi")) {
    termId = "amfi";
  }

  const glossaryTerm =
    GLOSSARY_TERMS.find((t) => t.id === termId) ||
    GLOSSARY_TERMS.find((t) => t.id === hub.primaryGlossaryTermId) ||
    GLOSSARY_TERMS[0];

  // 3. Pick 2 published sibling articles (excluding current article)
  const publishedOthers = allPosts.filter(
    (p) => p.id !== article.id && p.slug !== article.slug && p.status === "published"
  );

  // Score candidate articles by shared category or shared hub
  const scored = publishedOthers.map((p) => {
    let score = 0;
    if (p.category === article.category) score += 3;
    if (hub.matchedArticleSlugs.includes(p.slug)) score += 4;
    // Shared tags
    const pTags = (p.tags || []).map((t) => t.toLowerCase());
    const artTags = (article.tags || []).map((t) => t.toLowerCase());
    for (const t of artTags) {
      if (pTags.includes(t)) score += 2;
    }
    return { post: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const siblingArticles = scored.slice(0, 2).map((s) => s.post);

  // If less than 2, fill with publishedOthers
  while (siblingArticles.length < 2 && publishedOthers.length > siblingArticles.length) {
    const next = publishedOthers.find((p) => !siblingArticles.includes(p));
    if (next) siblingArticles.push(next);
    else break;
  }

  return {
    hub,
    calculator,
    glossaryTerm,
    siblingArticles,
  };
}
