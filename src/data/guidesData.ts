// Comprehensive Data and Logic for Mutual Fund Guides, Interactive Checklists, and Category Evaluation Engines

export interface DueDiligenceItem {
  id: string;
  category: "horizon" | "costs" | "performance" | "governance" | "tax-exit";
  categoryLabel: string;
  title: string;
  shortDesc: string;
  detailedRationale: string;
  actionableStep: string;
  metricOrRule: string;
  regulatoryContext: string;
}

export interface QuizQuestion {
  id: string;
  title: string;
  subtitle: string;
  options: {
    id: string;
    label: string;
    sublabel: string;
    points: {
      horizonMonths: number;
      riskScore: number; // 1 (conservative) to 5 (very aggressive)
      categoryAffinity: string[];
    };
  }[];
}

export interface FundCategoryResult {
  categoryId: string;
  categoryName: string;
  sebiClassification: string;
  mandatedAssetAllocation: string;
  idealHorizon: string;
  riskLevel: "Low" | "Low to Moderate" | "Moderate" | "Moderately High" | "Very High";
  badgeColor: string;
  primaryRationale: string;
  keyBenefits: string[];
  criticalRisks: string[];
  whoShouldAvoid: string;
  statutoryConsideration: string;
}

// 1. 10-Point Pre-Investment Due Diligence Checklist Items
export const DUE_DILIGENCE_CHECKLIST: DueDiligenceItem[] = [
  {
    id: "check-1-horizon",
    category: "horizon",
    categoryLabel: "1. Time Horizon & Liquidity",
    title: "Verify Exact Investment Horizon vs. Asset Class Volatility",
    shortDesc: "Ensure you will not need this capital before the asset class's minimum recovery cycle.",
    detailedRationale:
      "Equity mutual funds have short-term drawdown volatility where portfolios can decline 20-40% during cyclical corrections. Historical Nifty 50 and Nifty 500 rolling returns demonstrate that negative return probabilities drop to near zero only across 7+ year holding periods. Investing money needed within 1-3 years into equity or aggressive hybrid funds introduces catastrophic timing risk.",
    actionableStep:
      "Strictly allocate money needed in <1 year to Liquid or Overnight funds, 1-3 years to Short Duration or Banking & PSU debt funds, and reserve equities strictly for horizons exceeding 5-7 years.",
    metricOrRule: "Rule of Thumb: <1 yr = Liquid; 1-3 yrs = Debt; 3-5 yrs = Hybrid; 5+ yrs = Broad Equity.",
    regulatoryContext: "Aligned with SEBI circular on categorization and risk profiling disclosure norms.",
  },
  {
    id: "check-2-direct-plan",
    category: "costs",
    categoryLabel: "2. Cost Efficiency",
    title: "Insist on 'Direct Plan – Growth Option' to Eliminate Distributor Trail Drag",
    shortDesc: "Avoid paying 0.50% to 1.50% annual distributor commissions out of your daily NAV compounding.",
    detailedRationale:
      "Regular plans pay ongoing trailing commissions to brokers and distributors for the entire duration you remain invested. A 1% difference in Total Expense Ratio (TER) between Direct and Regular plans compounds over a 20-year SIP of ₹10,000/month into an astonishing wealth gap of over ₹25-35 Lakhs eroded purely to commission drag.",
    actionableStep:
      "Check the scheme name on your application or statement. It must contain the exact word 'Direct Plan – Growth'. Avoid 'Regular Plan' and 'IDCW' (dividend payout) options unless you require mandatory immediate cash distributions.",
    metricOrRule: "Formula: Wealth Lost to Trail = Compounded FV(Gross Return) - FV(Gross Return - Trail TER).",
    regulatoryContext: "SEBI mandated Direct Plans across all mutual funds starting January 1, 2013.",
  },
  {
    id: "check-3-rolling-returns",
    category: "performance",
    categoryLabel: "3. Historical Consistency",
    title: "Analyze 3-Year & 5-Year Rolling Returns (Never Point-to-Point Trailing Returns)",
    shortDesc: "Point-to-point 1-year returns are distorted by recent market peaks or low base effects.",
    detailedRationale:
      "Trailing returns (e.g., last 1-year or 3-year CAGR) compare only two discrete calendar dates, masking severe interim crashes or luck-driven cyclical spikes. Rolling returns calculate the CAGR for every single day over a 3-year or 5-year window across a full market cycle (bull, bear, sideways), revealing true quartile consistency.",
    actionableStep:
      "Examine whether the fund has stayed in the top 2 quartiles (>50th percentile) across rolling 3-year windows for at least 70% of observations relative to its benchmark index.",
    metricOrRule: "Look for: Minimum rolling return > 0% in all 5-year periods; Average rolling return > Benchmark TRI.",
    regulatoryContext: "AMFI mandates benchmarking against Total Return Index (TRI) including reinvested dividends.",
  },
  {
    id: "check-4-ter-scrutiny",
    category: "costs",
    categoryLabel: "4. Expense Ratio",
    title: "Compare Total Expense Ratio (TER) Against Category Median & AUM Scale",
    shortDesc: "High expense ratios in mature, large-AUM funds represent unearned friction.",
    detailedRationale:
      "SEBI regulations enforce a sliding scale cap on TER: as fund AUM grows, the maximum allowable TER drops. However, even within regulatory caps, some funds charge significantly higher fees than peers managing similar portfolios. For passive index funds, TER should ideally be under 0.20-0.30%; for active large-cap, under 1.00% (Direct).",
    actionableStep:
      "Review the monthly factsheet or AMFI website for the latest TER. Compare the fund's TER to the category average and verify that expense ratios haven't crept upwards over the past 6 months.",
    metricOrRule: "SEBI TER Slab Cap: First ₹500 Cr = 2.25% (equity); Next ₹250 Cr = 2.00%; Scaling down to 1.05% for >₹50,000 Cr.",
    regulatoryContext: "SEBI (Mutual Funds) Regulations, 1996 - Sixth Schedule on Expense Limits.",
  },
  {
    id: "check-5-benchmark-alpha",
    category: "performance",
    categoryLabel: "5. Active Management Justification",
    title: "Validate Genuine Alpha Over Benchmark Total Return Index (TRI)",
    shortDesc: "If an active fund fails to beat its index after fees, pay 0.1% for a passive index fund instead.",
    detailedRationale:
      "Over 70% of active large-cap equity funds in India fail to beat the Nifty 50 TRI or Nifty 100 TRI over 5-year and 10-year horizons (as documented in SPIVA reports). Paying 1% active management fee for a closet index fund that mirrors the benchmark guarantees underperformance due to fee drag.",
    actionableStep:
      "Check the fund's 5-year Alpha (excess return over CAPM expected return) and Information Ratio. In large-cap space, strongly default to low-cost Nifty 50 or Sensex index funds unless the active fund has demonstrated persistent 7-year alpha.",
    metricOrRule: "Metric: 5-Year Alpha > 1.5% and Information Ratio > 0.5 for active equity funds.",
    regulatoryContext: "SEBI circular SEBI/HO/IMD/DF3/CIR/P/2018/04 mandates TRI benchmarking.",
  },
  {
    id: "check-6-risk-metrics",
    category: "performance",
    categoryLabel: "6. Downside Protection",
    title: "Inspect Downside Capture Ratio & Maximum Drawdown",
    shortDesc: "A superior fund preserves capital in crashes rather than merely shooting up in speculative rallies.",
    detailedRationale:
      "While many investors focus purely on upside returns during bull runs, wealth compounding is determined by preventing catastrophic capital destruction during market drops. Downside capture ratio measures what percentage of the benchmark's losses the fund caught when the index declined.",
    actionableStep:
      "Verify that the Downside Capture Ratio is comfortably below 100% (ideally 70% to 85%), and confirm that Maximum Drawdown during past major corrections (e.g., 2020 crash) was less severe than the category index.",
    metricOrRule: "Target Metrics: Downside Capture Ratio < 85%; Upside Capture Ratio > 95%; Sharpe Ratio > Category Median.",
    regulatoryContext: "SEBI Risk-o-meter methodology requires evaluating portfolio volatility and credit duration risk monthly.",
  },
  {
    id: "check-7-concentration-tenure",
    category: "governance",
    categoryLabel: "7. Portfolio Governance",
    title: "Check Portfolio Diversification & Lead Fund Manager Tenure",
    shortDesc: "Avoid unhedged single-stock concentration risks and frequent management turnover.",
    detailedRationale:
      "An equity fund with over 10-12% allocation to a single stock or over 35% in a single sector carries extreme idiosyncratic risk. Furthermore, active fund performance is tightly coupled to the lead fund manager's investment process; a recent manager departure resets the fund's historical track record credibility.",
    actionableStep:
      "Check the top 10 holdings in the latest factsheet. Top 10 stocks should rarely exceed 50-60% of total AUM (except in focused funds). Verify that the lead fund manager has managed the scheme for at least 3-5 years.",
    metricOrRule: "SEBI limit: Max 10% of NAV in a single company's equity shares (can be relaxed to 12% with trustee approval).",
    regulatoryContext: "SEBI Investment and Portfolio Diversification Norms.",
  },
  {
    id: "check-8-aum-liquidity",
    category: "governance",
    categoryLabel: "8. Scale & Liquidity Stress",
    title: "Evaluate AUM Scale Relative to Market-Cap Segment",
    shortDesc: "Small-cap funds with excessively bloated AUM face severe liquidity bottlenecks during selloffs.",
    detailedRationale:
      "In small-cap and micro-cap funds, ballooning AUM (e.g., >₹30,000–50,000 Cr) makes it mathematically impossible to deploy cash without moving market prices or being forced into large-cap liquid stocks. During redemption runs, selling illiquid small-cap holdings can take months, triggering steep impact costs.",
    actionableStep:
      "Review the mandatory SEBI/AMFI small-cap liquidity stress test disclosures. Check the number of days required to liquidate 25% and 50% of the portfolio under stressed conditions. In small caps, prefer moderate-sized funds over giant behemoths.",
    metricOrRule: "Stress Test Standard: Days required to liquidate 25% and 50% of portfolio without market impact.",
    regulatoryContext: "Mandatory bi-monthly stress testing framework initiated by SEBI and AMFI in March 2024.",
  },
  {
    id: "check-9-exit-load",
    category: "tax-exit",
    categoryLabel: "9. Exit Loads & Lock-ins",
    title: "Confirm Exit Load Gradients, Holding Thresholds & Mandatory Lock-ins",
    shortDesc: "Do not get trapped by unexpected 1% redemption penalties or multi-year statutory lock-ins.",
    detailedRationale:
      "Most equity funds levy a 1% exit load if units are redeemed before completing 365 days. Liquid funds charge graded exit loads for the first 7 days. ELSS funds enforce a strict statutory 3-year lock-in where units cannot be touched under any circumstance — with each monthly SIP installment carrying its own independent 3-year lock-in clock.",
    actionableStep:
      "Always note the exact exit load terms before investing. If you might need the money in 9 months, an equity fund with a 1-year exit load is unsuitable even if the market remains flat.",
    metricOrRule: "Standard Equity: 1% if redeemed within 1 year; 0% thereafter. ELSS: 36 months mandatory lock-in per installment.",
    regulatoryContext: "Exit loads are credited back to the scheme to benefit continuing investors, not retained by AMC as profit.",
  },
  {
    id: "check-10-tax-efficiency",
    category: "tax-exit",
    categoryLabel: "10. Post-Tax Real Return",
    title: "Factor In 2024-2026 Budget Capital Gains Tax Rates (LTCG / STCG)",
    shortDesc: "Measure expected outcomes on a net post-tax basis under current Finance Act rules.",
    detailedRationale:
      "Equity mutual fund Long-Term Capital Gains (held > 12 months) are taxed at 12.5% on gains exceeding ₹1.25 Lakh per financial year (Section 112A). Short-term gains (held <= 12 months) are taxed at 20% (Section 111A). Pure debt mutual funds acquired after April 1, 2023, no longer receive indexation and are taxed at your personal income tax slab rate regardless of holding period.",
    actionableStep:
      "Structure long-term equity withdrawals to utilize the annual ₹1.25 Lakh tax-free LTCG threshold via systematic tax harvesting. For debt holdings, compare post-tax yields against Arbitrage funds or fixed deposits.",
    metricOrRule: "Equity LTCG (>1 yr): 12.5% over ₹1.25L. Equity STCG (<=1 yr): 20%. Debt: Slab rate.",
    regulatoryContext: "Finance (No. 2) Act, 2024 amendments to Section 111A and Section 112A.",
  },
];

// 2. Comprehensive Goal & Risk-Profile Category Recommendation Quiz Questions
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "goal",
    title: "What is your primary financial objective for this capital?",
    subtitle: "Your goal determines the required balance between wealth creation and capital safety.",
    options: [
      {
        id: "emergency",
        label: "Emergency Reserve / Short-Term Parking",
        sublabel: "Capital must be 100% safe, accessible on short notice with zero loss of principal.",
        points: { horizonMonths: 3, riskScore: 1, categoryAffinity: ["liquid", "overnight", "ultra-short"] },
      },
      {
        id: "near_term",
        label: "Planned Purchase within 1 to 3 Years",
        sublabel: "Down payment for home, car, wedding, or higher education with fixed deadline.",
        points: { horizonMonths: 24, riskScore: 2, categoryAffinity: ["short-duration", "banking-psu", "arbitrage", "conservative-hybrid"] },
      },
      {
        id: "tax_saving",
        label: "Tax Saving under Section 80C",
        sublabel: "Deduct up to ₹1.5 Lakh from taxable income under Old Tax Regime with 3-year lock-in.",
        points: { horizonMonths: 36, riskScore: 3, categoryAffinity: ["elss"] },
      },
      {
        id: "wealth_building",
        label: "Core Long-Term Wealth Accumulation (5 to 10 Years)",
        sublabel: "Outperforming inflation significantly to build substantial financial corpus.",
        points: { horizonMonths: 72, riskScore: 4, categoryAffinity: ["broad-index", "flexi-cap", "aggressive-hybrid"] },
      },
      {
        id: "retirement_fire",
        label: "Retirement / Long-Term Financial Independence (10+ Years)",
        sublabel: "Maximum compounding over decades; comfortable with multi-year market cycles.",
        points: { horizonMonths: 120, riskScore: 5, categoryAffinity: ["broad-index", "flexi-cap", "large-mid-cap", "multi-asset"] },
      },
    ],
  },
  {
    id: "horizon",
    title: "What is your uninterrupted investment time horizon?",
    subtitle: "The duration you can leave this money untouched without needing to redeem any units.",
    options: [
      {
        id: "h_sub_year",
        label: "Under 1 Year (< 12 Months)",
        sublabel: "Money may be needed anytime within the next 3 to 12 months.",
        points: { horizonMonths: 6, riskScore: 1, categoryAffinity: ["liquid", "ultra-short", "arbitrage"] },
      },
      {
        id: "h_1_to_3",
        label: "1 to 3 Years",
        sublabel: "Medium horizon; cannot afford steep market drawdown when redeeming.",
        points: { horizonMonths: 24, riskScore: 2, categoryAffinity: ["short-duration", "banking-psu", "conservative-hybrid"] },
      },
      {
        id: "h_3_to_5",
        label: "3 to 5 Years",
        sublabel: "Moderate horizon; can absorb modest interim volatility for better returns.",
        points: { horizonMonths: 48, riskScore: 3, categoryAffinity: ["balanced-advantage", "aggressive-hybrid", "elss", "multi-asset"] },
      },
      {
        id: "h_5_to_7",
        label: "5 to 7 Years",
        sublabel: "Healthy long-term horizon; full market cycle to recover from any market dip.",
        points: { horizonMonths: 72, riskScore: 4, categoryAffinity: ["broad-index", "flexi-cap", "aggressive-hybrid"] },
      },
      {
        id: "h_7_plus",
        label: "More than 7 Years (7 to 15+ Years)",
        sublabel: "Very long horizon; can absorb deep cyclical bear markets for maximum CAGR.",
        points: { horizonMonths: 120, riskScore: 5, categoryAffinity: ["broad-index", "flexi-cap", "large-mid-cap", "multi-asset"] },
      },
    ],
  },
  {
    id: "drawdown_reaction",
    title: "How would you react if your portfolio declined by 20% in 6 months during a market crash?",
    subtitle: "Behavioral risk tolerance is the single biggest predictor of long-term retail success.",
    options: [
      {
        id: "r_panic_sell",
        label: "Panic and immediately sell all units to protect what is left",
        sublabel: "I cannot tolerate seeing my invested capital drop below the purchase amount.",
        points: { horizonMonths: 12, riskScore: 1, categoryAffinity: ["liquid", "ultra-short", "arbitrage"] },
      },
      {
        id: "r_stop_sip",
        label: "Feel extremely anxious, check daily NAV constantly, and pause new investments",
        sublabel: "I would be stressed and hesitant to deploy more money until markets bounce back.",
        points: { horizonMonths: 36, riskScore: 2, categoryAffinity: ["conservative-hybrid", "balanced-advantage", "banking-psu"] },
      },
      {
        id: "r_stay_calm",
        label: "Stay calm, do nothing, and continue existing SIPs automatically",
        sublabel: "I understand that drawdowns are temporary and normal in equity investing.",
        points: { horizonMonths: 60, riskScore: 4, categoryAffinity: ["broad-index", "flexi-cap", "aggressive-hybrid"] },
      },
      {
        id: "r_buy_more",
        label: "View it as a massive discount sale and aggressively invest extra lumpsum",
        sublabel: "Market crashes present the best generational wealth-compounding opportunities.",
        points: { horizonMonths: 84, riskScore: 5, categoryAffinity: ["broad-index", "flexi-cap", "large-mid-cap"] },
      },
    ],
  },
  {
    id: "priority",
    title: "Which balance between volatility and return best reflects your personal philosophy?",
    subtitle: "There is no high return without commensurate volatility; select your comfort trade-off.",
    options: [
      {
        id: "p_pure_safety",
        label: "Absolute Capital Safety & Predictability",
        sublabel: "I prioritize never losing money over seeking higher returns.",
        points: { horizonMonths: 12, riskScore: 1, categoryAffinity: ["liquid", "overnight", "ultra-short"] },
      },
      {
        id: "p_inflation_hedge",
        label: "Stable Income & Inflation Cushion with Low Volatility",
        sublabel: "Aim to slightly beat inflation and FD returns with minimal portfolio turbulence.",
        points: { horizonMonths: 36, riskScore: 2, categoryAffinity: ["short-duration", "banking-psu", "conservative-hybrid"] },
      },
      {
        id: "p_balanced_growth",
        label: "Balanced Growth: Good equity upside with downside cushion",
        sublabel: "Willing to accept moderate fluctuations in exchange for 10-12% expected long-term CAGR.",
        points: { horizonMonths: 60, riskScore: 3, categoryAffinity: ["balanced-advantage", "aggressive-hybrid", "multi-asset"] },
      },
      {
        id: "p_max_compounding",
        label: "Maximum Long-Term Wealth Compounding (Aggressive Growth)",
        sublabel: "Focus purely on 12-14%+ long-term equity growth; volatility doesn't bother me.",
        points: { horizonMonths: 84, riskScore: 5, categoryAffinity: ["broad-index", "flexi-cap", "large-mid-cap"] },
      },
    ],
  },
  {
    id: "inflow_mode",
    title: "How do you plan to invest your capital?",
    subtitle: "SIP disciplined investing mitigates timing risk, while lumpsum deployment requires cautious staging.",
    options: [
      {
        id: "mode_sip",
        label: "Monthly Systematic Investment Plan (SIP)",
        sublabel: "Disciplined monthly allocation from regular salary or business income.",
        points: { horizonMonths: 60, riskScore: 4, categoryAffinity: ["broad-index", "flexi-cap", "aggressive-hybrid", "elss"] },
      },
      {
        id: "mode_lumpsum_existing",
        label: "One-Time Lumpsum Amount (Ready to deploy today)",
        sublabel: "Bonuses, asset sale proceeds, inheritance, or maturity proceeds from fixed deposits.",
        points: { horizonMonths: 36, riskScore: 3, categoryAffinity: ["balanced-advantage", "multi-asset", "short-duration"] },
      },
      {
        id: "mode_stp",
        label: "Systematic Transfer Plan (STP): Park in Liquid and stagger into Equity",
        sublabel: "Deploy large lumpsum into liquid fund first, then systematically transfer weekly/monthly into equity.",
        points: { horizonMonths: 60, riskScore: 4, categoryAffinity: ["liquid", "broad-index", "flexi-cap"] },
      },
    ],
  },
];

// 3. SEBI Fund Categories Repository (strictly categories with rationale, never individual schemes)
export const FUND_CATEGORIES: Record<string, FundCategoryResult> = {
  liquid: {
    categoryId: "liquid",
    categoryName: "Liquid Mutual Fund",
    sebiClassification: "Debt Scheme — Liquid Fund (SEBI Categorization Circular Oct 2017)",
    mandatedAssetAllocation: "Invests 100% in debt and money market securities with residual maturity up to 91 days only.",
    idealHorizon: "1 day to 3 months (Ideal emergency cash parking)",
    riskLevel: "Low",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
    primaryRationale:
      "Because your horizon is very short or your top priority is absolute principal safety and immediate liquidity, Liquid Funds provide an institutional-grade substitute for savings accounts and short-term FDs without locking money away.",
    keyBenefits: [
      "Ultra-low interest rate risk due to strict 91-day maturity cap on underlying debt papers.",
      "High liquidity with T+1 redemption settlement cycle (and instant redemption up to ₹50,000/day per AMC).",
      "No equity market exposure whatsoever, eliminating NAV market correction risks.",
      "Graded exit load exists only for the first 7 days (day 1: 0.0070% scaling down to 0% from day 8).",
    ],
    criticalRisks: [
      "Credit Risk: Very rare but possible if an underlying corporate issuer defaults on short-term commercial papers.",
      "Reinvestment Rate Risk: Returns fluctuate quickly with RBI repo rate cycles.",
      "Taxation: Gains are taxed at your marginal income tax slab rate (no indexation benefit).",
    ],
    whoShouldAvoid: "Investors seeking high capital appreciation over horizons exceeding 1-2 years.",
    statutoryConsideration: "SEBI enforces mark-to-market valuation across all papers to ensure true NAV transparency.",
  },
  "short-duration": {
    categoryId: "short-duration",
    categoryName: "Short Duration / Banking & PSU Debt Fund",
    sebiClassification: "Debt Scheme — Short Duration Fund (Macaulay Duration 1 to 3 Years)",
    mandatedAssetAllocation: "Invests in debt and money market instruments such that Macaulay duration of the portfolio is between 1 year and 3 years. Banking & PSU funds invest min 80% in Banks, PSUs, and Public Financial Institutions.",
    idealHorizon: "1 year to 3 years",
    riskLevel: "Low to Moderate",
    badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-300",
    primaryRationale:
      "Matches goals with a 1-3 year deadline where equity volatility is unacceptable, but you desire better yield potential than overnight or liquid accounts with modest, managed duration risk.",
    keyBenefits: [
      "Higher accrual yields than liquid or savings accounts while avoiding extreme duration volatility of long-term gilt funds.",
      "High portfolio credit safety when choosing the Banking & PSU sub-category (predominantly AAA/sovereign rated).",
      "No exit load in most schemes after 1-3 months of holding.",
    ],
    criticalRisks: [
      "Moderate Interest Rate Sensitivity: If RBI raises interest rates sharply, existing bond prices drop temporarily.",
      "Credit Risk: Always verify that the portfolio is predominantly Sovereign/AAA rated rather than chasing low-credit AA/A yield papers.",
      "Tax Drag: Taxed at slab rate for all purchases made post April 1, 2023.",
    ],
    whoShouldAvoid: "Investors with 5+ year horizons who can withstand equity drawdowns for far superior inflation-beating returns.",
    statutoryConsideration: "SEBI requires portfolio Macaulay Duration disclosure in every monthly factsheet.",
  },
  arbitrage: {
    categoryId: "arbitrage",
    categoryName: "Arbitrage Mutual Fund",
    sebiClassification: "Hybrid Scheme — Arbitrage Fund (SEBI Categorization)",
    mandatedAssetAllocation: "Minimum 65% in equity and equity-related instruments simultaneously hedged via derivative cash-futures arbitrage; balance in debt/money market.",
    idealHorizon: "3 months to 1 year",
    riskLevel: "Low",
    badgeColor: "bg-teal-100 text-teal-900 border-teal-300",
    primaryRationale:
      "Ideal for investors in high tax brackets (30%+) parking short-term funds for 3-12 months. Because the fund holds 65%+ in equities (fully hedged against market drops), it qualifies for preferential equity taxation (20% STCG) rather than a 30%+ slab rate.",
    keyBenefits: [
      "Virtually zero equity market directional risk: price differences between cash and futures markets are locked in.",
      "Tax advantage: Short-term gains taxed at 20% (vs. 30%+ slab rate on debt funds/FDs for high earners).",
      "Low volatility with steady daily NAV accrual.",
    ],
    criticalRisks: [
      "Spread Compression: During prolonged sideways or bear markets, arbitrage spreads can shrink to 5-6% annualized.",
      "Exit Load: Most arbitrage funds levy 0.25-0.50% exit load if redeemed within 15-30 days.",
    ],
    whoShouldAvoid: "Long-term wealth builders seeking genuine capital expansion.",
    statutoryConsideration: "Qualified as equity scheme under Section 111A/112A due to statutory 65% gross equity threshold.",
  },
  "conservative-hybrid": {
    categoryId: "conservative-hybrid",
    categoryName: "Conservative Hybrid Mutual Fund",
    sebiClassification: "Hybrid Scheme — Conservative Hybrid Fund",
    mandatedAssetAllocation: "Invests 75% to 90% in debt instruments and 10% to 25% in equity and equity-related instruments.",
    idealHorizon: "2 to 3 years",
    riskLevel: "Moderate",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    primaryRationale:
      "Suitable for conservative investors seeking predominantly debt stability while allowing a 10-25% equity slice to help the portfolio outpace inflation without inducing severe market drawdowns.",
    keyBenefits: [
      "Bond cushion prevents deep drawdowns during equity market corrections.",
      "Modest equity kicker boosts overall returns above traditional fixed deposits over 3-year cycles.",
      "Automated internal rebalancing between debt and equity by the fund manager.",
    ],
    criticalRisks: [
      "Subject to both bond duration risk and modest equity correction risk.",
      "Treated as non-equity scheme for tax purposes (taxed at slab rate).",
    ],
    whoShouldAvoid: "Young aggressive investors with 7+ year horizons who under-allocate to growth assets by holding 75% debt.",
    statutoryConsideration: "SEBI limits equity allocation strictly to 25% to protect conservative retail mandates.",
  },
  "balanced-advantage": {
    categoryId: "balanced-advantage",
    categoryName: "Balanced Advantage / Dynamic Asset Allocation Fund",
    sebiClassification: "Hybrid Scheme — Dynamic Asset Allocation / Balanced Advantage",
    mandatedAssetAllocation: "Dynamically managed between equity (0% to 100%) and debt (0% to 100%) using quantitative valuation models (P/E, P/B, trend).",
    idealHorizon: "3 to 5 years",
    riskLevel: "Moderately High",
    badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-300",
    primaryRationale:
      "Perfect for first-time equity investors or those who panic during market drawdowns. The fund automatically cuts net equity exposure during overheated market valuations and increases equity during market crashes.",
    keyBenefits: [
      "Significantly lower drawdowns during market crashes compared to pure equity funds.",
      "Tax efficiency: Maintains gross equity exposure (including derivatives) above 65% to qualify for equity LTCG (12.5%) and STCG (20%).",
      "Eliminates emotional market timing mistakes for retail investors.",
    ],
    criticalRisks: [
      "Model Lag: In runaway momentum bull runs, the fund may de-allocate from equity too early, trailing pure index funds.",
      "Complex derivative hedging strategies make performance tracking more nuanced.",
    ],
    whoShouldAvoid: "Aggressive investors with 10+ year horizons who can digest volatility and want 100% equity participation.",
    statutoryConsideration: "Fund houses must transparently publish their proprietary asset allocation model metrics in factsheets.",
  },
  "aggressive-hybrid": {
    categoryId: "aggressive-hybrid",
    categoryName: "Aggressive Hybrid Mutual Fund",
    sebiClassification: "Hybrid Scheme — Aggressive Hybrid Fund",
    mandatedAssetAllocation: "Invests 65% to 80% in equity and equity-related instruments, and 20% to 35% in debt instruments.",
    idealHorizon: "4 to 7 years",
    riskLevel: "Moderately High",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
    primaryRationale:
      "A battle-tested 'single-fund portfolio' for investors seeking strong equity compounding (65-80%) while retaining a permanent 20-35% debt shock absorber that provides peace of mind during bear markets.",
    keyBenefits: [
      "Consistent equity taxation status (LTCG 12.5% > ₹1.25L, STCG 20%).",
      "Automated counter-cyclical rebalancing: fund manager sells equity when it rallies to buy bonds, and buys equity during crashes.",
      "Captures ~75-80% of equity upside with only ~55-65% of equity downside volatility.",
    ],
    criticalRisks: [
      "Still carries significant equity drawdown risk (can drop 15-20% during extreme global crises).",
      "Fixed 65-80% equity band means the manager cannot retreat completely into cash or debt during prolonged secular bear markets.",
    ],
    whoShouldAvoid: "Very short-term investors (<3 years) or those who insist on managing their own custom asset allocation.",
    statutoryConsideration: "SEBI prohibits fund houses from running both Balanced Hybrid and Aggressive Hybrid under the same AMC.",
  },
  "broad-index": {
    categoryId: "broad-index",
    categoryName: "Broad-Market Index Fund (Nifty 50 / BSE Sensex / Nifty 500 TRI)",
    sebiClassification: "Other Schemes — Index Fund (Passive Replication)",
    mandatedAssetAllocation: "Minimum 95% in securities of the replicated benchmark index in exact weightage proportions.",
    idealHorizon: "5 to 10+ years",
    riskLevel: "Very High",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    primaryRationale:
      "The gold standard foundation for long-term wealth creation. Low-cost passive index funds eliminate fund manager risk, eliminate style drift, charge ultra-low expense ratios (often 0.10% to 0.25%), and beat over 70% of active large-cap funds over 10-year horizons.",
    keyBenefits: [
      "Zero Fund Manager Bias: Completely rule-based replication of India's largest and most established blue-chip corporations.",
      "Rock-bottom costs: Minimal TER drag ensures maximum compounding compounding directly into your net worth.",
      "Automatic survival bias: Underperforming bankrupt companies are automatically booted from the index and replaced by emerging leaders.",
    ],
    criticalRisks: [
      "100% Market Downside: If the Nifty 50 drops 35% in a recession, the index fund will drop exactly 35% with zero cash cushion.",
      "Tracking Error: Always verify that the fund has low tracking error (<0.15%) and low tracking difference.",
    ],
    whoShouldAvoid: "Investors who panic when seeing short-term negative returns on their statement, or anyone with <5 year horizon.",
    statutoryConsideration: "SEBI circular requires index funds to disclose tracking error and tracking difference on daily AMFI feeds.",
  },
  "flexi-cap": {
    categoryId: "flexi-cap",
    categoryName: "Flexi-Cap Equity Fund",
    sebiClassification: "Equity Scheme — Flexi Cap Fund",
    mandatedAssetAllocation: "Minimum 65% in equity across Large Cap, Mid Cap, and Small Cap stocks with zero statutory cap restrictions.",
    idealHorizon: "5 to 7+ years",
    riskLevel: "Very High",
    badgeColor: "bg-orange-100 text-orange-900 border-orange-300",
    primaryRationale:
      "Offers the fund manager complete dynamic freedom to allocate between large-caps, mid-caps, and small-caps depending on valuation attractiveness. Unlike rigid Multi-Cap funds (which force 25% small-cap even when overvalued), Flexi-Cap managers can take shelter in large-caps when small-caps become frothy.",
    keyBenefits: [
      "Dynamic market-cap flexibility: Can hold 80% large-caps during frothy markets and pivot to 40% mid/small-caps after crashes.",
      "Ideal primary active equity vehicle for long-term SIP compounding.",
      "Access to high-growth emerging companies alongside resilient blue-chip leaders.",
    ],
    criticalRisks: [
      "High Manager Discretion Risk: Performance depends heavily on the lead fund manager's asset allocation and stock picking skill.",
      "Severe short-term drawdowns of 20-30% during general equity bear markets.",
    ],
    whoShouldAvoid: "Investors with short horizons or zero tolerance for interim mark-to-market fluctuations.",
    statutoryConsideration: "Introduced by SEBI in November 2020 to restore unconstrained multi-cap investment freedom.",
  },
  "large-mid-cap": {
    categoryId: "large-mid-cap",
    categoryName: "Large & Mid-Cap Equity Fund",
    sebiClassification: "Equity Scheme — Large & Mid Cap Fund",
    mandatedAssetAllocation: "Minimum 35% in Large Cap stocks (Top 100) and Minimum 35% in Mid Cap stocks (101st to 250th by market cap).",
    idealHorizon: "7+ years",
    riskLevel: "Very High",
    badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
    primaryRationale:
      "A structured growth engine that combines the stability of top 100 blue chips with the explosive earnings growth potential of fast-growing mid-tier companies. Well suited for aggressive wealth creators with horizons exceeding 7 years.",
    keyBenefits: [
      "Guaranteed minimum 35% allocation to dynamic mid-cap compounders.",
      "Large-cap ballast (min 35%) provides liquidity and reduces extreme tail risk during liquidity crunches.",
      "Higher long-term CAGR potential than pure large-cap index funds over 10-year holding periods.",
    ],
    criticalRisks: [
      "High Volatility: Mid-cap stocks suffer sharp drawdowns (30-50%) during mid-cap cyclical bear markets.",
      "Requires high behavioral resilience to sit through multi-year consolidation phases without stopping SIPs.",
    ],
    whoShouldAvoid: "Conservative investors, near-retirees, or anyone needing capital within 5 years.",
    statutoryConsideration: "SEBI strictly regulates market-cap classifications semi-annually based on AMFI list.",
  },
  elss: {
    categoryId: "elss",
    categoryName: "ELSS (Equity Linked Savings Scheme / Tax Saver)",
    sebiClassification: "Equity Scheme — ELSS (Section 80C Tax Benefit)",
    mandatedAssetAllocation: "Minimum 80% in equity and equity-related securities in accordance with Equity Linked Saving Scheme, 2005.",
    idealHorizon: "3 to 5+ years (Mandatory 3-Year Lock-In)",
    riskLevel: "Very High",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    primaryRationale:
      "The most tax-efficient Section 80C investment vehicle in India. Features the shortest lock-in period (3 years) among all 80C instruments (compared to PPF 15 years, NPS till age 60, Tax-Saver FD 5 years) while generating inflation-beating equity returns.",
    keyBenefits: [
      "Deduction of up to ₹1.5 Lakh under Section 80C (Old Tax Regime), saving up to ₹46,800 in annual taxes for 30% slab earners.",
      "Shortest 80C lock-in (3 years) prevents emotional panic selling during market downturns, allowing compounding to work.",
      "Diversified multi-cap or flexi-cap style equity exposure managed by professional fund managers.",
    ],
    criticalRisks: [
      "Strict Statutory Lock-In: Units CANNOT be redeemed or pledged under any condition before 36 months.",
      "SIP Lock-In Nuance: Every single monthly SIP installment is locked for 36 months from its specific debit date.",
      "Irrelevant under New Tax Regime if Section 80C deductions are not opted for.",
    ],
    whoShouldAvoid: "Investors opting for the New Tax Regime (Section 115BAC) where 80C deductions are ineligible, or those needing emergency liquidity.",
    statutoryConsideration: "Formulated under Central Government Equity Linked Saving Scheme Notification.",
  },
  "multi-asset": {
    categoryId: "multi-asset",
    categoryName: "Multi-Asset Allocation Fund",
    sebiClassification: "Hybrid Scheme — Multi Asset Allocation",
    mandatedAssetAllocation: "Invests in at least 3 distinct asset classes with a minimum allocation of at least 10% in each asset class (typically Equity, Debt, and Gold/Silver/Commodities).",
    idealHorizon: "5+ years",
    riskLevel: "Moderately High",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    primaryRationale:
      "All-weather portfolio diversification in a single product. Gold and commodities historically act as negative-correlation hedges during equity market crashes and geopolitical shocks, cushioning returns when equities stumble.",
    keyBenefits: [
      "True multi-asset diversification: When stocks crash, gold often rallies; debt yields provide stable baseline accrual.",
      "Significantly smoother return journey with lower standard deviation and lower maximum drawdown than pure equity.",
      "Fund manager rebalances automatically without triggering personal capital gains tax liabilities on intermediate trades.",
    ],
    criticalRisks: [
      "Taxation Complexity: Depending on whether equity allocation is >=65% or between 35-65%, tax treatment varies.",
      "May underperform pure equity funds during intense one-way bull markets due to the 10%+ gold and 10%+ debt drags.",
    ],
    whoShouldAvoid: "Investors who already hold substantial physical gold or sovereign gold bonds outside mutual funds.",
    statutoryConsideration: "SEBI mandates at least 10% in three separate asset classes at all times.",
  },
};

// 4. Deterministic Category Recommendation Algorithm
export function evaluateFundCategoryRecommendations(answers: Record<string, string>): {
  primaryCategory: FundCategoryResult;
  secondaryCategory: FundCategoryResult;
  riskProfileLabel: string;
  recommendedHorizon: string;
  allocationAdvice: string;
} {
  const goal = answers["goal"] || "wealth_building";
  const horizon = answers["horizon"] || "h_5_to_7";
  const reaction = answers["drawdown_reaction"] || "r_stay_calm";
  const priority = answers["priority"] || "p_balanced_growth";

  // Case 1: Ultra short horizon (<12 months) OR emergency goal OR panic sell reaction + safety priority
  if (horizon === "h_sub_year" || goal === "emergency" || (priority === "p_pure_safety" && reaction === "r_panic_sell")) {
    return {
      primaryCategory: FUND_CATEGORIES["liquid"],
      secondaryCategory: FUND_CATEGORIES["arbitrage"],
      riskProfileLabel: "Conservative Capital Preservation",
      recommendedHorizon: "1 Day to 12 Months",
      allocationAdvice:
        "100% allocation to Liquid and Overnight funds (or Arbitrage funds if in the 30% tax slab). Do NOT invest in equity schemes under any circumstance.",
    };
  }

  // Case 2: Near term purchase 1-3 years
  if (horizon === "h_1_to_3" || goal === "near_term") {
    if (priority === "p_pure_safety" || reaction === "r_panic_sell") {
      return {
        primaryCategory: FUND_CATEGORIES["short-duration"],
        secondaryCategory: FUND_CATEGORIES["liquid"],
        riskProfileLabel: "Low Risk Short-Horizon",
        recommendedHorizon: "1 to 3 Years",
        allocationAdvice:
          "Allocate 80-100% to Banking & PSU / Short Duration Debt Funds, with 0-20% in Arbitrage funds. Avoid equity funds to protect your scheduled expenditure.",
      };
    }
    return {
      primaryCategory: FUND_CATEGORIES["short-duration"],
      secondaryCategory: FUND_CATEGORIES["conservative-hybrid"],
      riskProfileLabel: "Conservative Income with Modest Growth",
      recommendedHorizon: "2 to 3 Years",
      allocationAdvice:
        "70-80% in High-Quality Short Duration / Banking & PSU Debt, and 20-30% in Conservative Hybrid or Arbitrage to beat FD post-tax returns.",
    };
  }

  // Case 3: Tax saving 80C
  if (goal === "tax_saving") {
    return {
      primaryCategory: FUND_CATEGORIES["elss"],
      secondaryCategory: FUND_CATEGORIES["broad-index"],
      riskProfileLabel: "Tax Optimization with Growth",
      recommendedHorizon: "Minimum 3 Years (Mandatory Lock-in)",
      allocationAdvice:
        "Direct your 80C allocation up to ₹1.5 Lakh into ELSS (Tax Saver) Direct Plan - Growth option. Stagger investments monthly via SIP rather than a March lumpsum rush.",
    };
  }

  // Case 4: Medium horizon 3 to 5 years
  if (horizon === "h_3_to_5") {
    if (reaction === "r_panic_sell" || reaction === "r_stop_sip" || priority === "p_inflation_hedge") {
      return {
        primaryCategory: FUND_CATEGORIES["balanced-advantage"],
        secondaryCategory: FUND_CATEGORIES["conservative-hybrid"],
        riskProfileLabel: "Moderate Risk with Downside Protection",
        recommendedHorizon: "3 to 5 Years",
        allocationAdvice:
          "Balanced Advantage / Dynamic Asset Allocation funds automatically hedge during market highs, protecting you from panic selling during cyclical drawdowns.",
      };
    }
    return {
      primaryCategory: FUND_CATEGORIES["aggressive-hybrid"],
      secondaryCategory: FUND_CATEGORIES["multi-asset"],
      riskProfileLabel: "Growth with Volatility Cushion",
      recommendedHorizon: "3 to 5 Years",
      allocationAdvice:
        "Aggressive Hybrid or Multi-Asset Allocation provides 65-75% equity compounding with a built-in debt and gold shock absorber.",
    };
  }

  // Case 5: Long term 5+ to 10+ years
  // Check risk tolerance
  if (reaction === "r_panic_sell" || reaction === "r_stop_sip") {
    // Long horizon, but low behavioral tolerance
    return {
      primaryCategory: FUND_CATEGORIES["balanced-advantage"],
      secondaryCategory: FUND_CATEGORIES["aggressive-hybrid"],
      riskProfileLabel: "Long Horizon Conservative Behavior",
      recommendedHorizon: "5+ Years",
      allocationAdvice:
        "Even with a 5+ year horizon, your behavioral reaction indicates high risk of selling at market bottoms. A Balanced Advantage or Aggressive Hybrid fund prevents panic exits while delivering healthy compounding.",
    };
  }

  if (reaction === "r_buy_more" || priority === "p_max_compounding") {
    // Very aggressive
    return {
      primaryCategory: FUND_CATEGORIES["broad-index"],
      secondaryCategory: FUND_CATEGORIES["large-mid-cap"],
      riskProfileLabel: "High Growth Wealth Compounder",
      recommendedHorizon: "7 to 10+ Years",
      allocationAdvice:
        "Core & Satellite Strategy: 60-70% in Broad-Market Index Funds (Nifty 50 / Nifty 500 TRI) as the rock-solid low-cost foundation, complemented by 30-40% in Large & Mid-Cap or Flexi-Cap Direct funds for alpha potential.",
    };
  }

  // Default balanced long term investor
  return {
    primaryCategory: FUND_CATEGORIES["broad-index"],
    secondaryCategory: FUND_CATEGORIES["flexi-cap"],
    riskProfileLabel: "Disciplined Long-Term Compounder",
    recommendedHorizon: "5 to 7+ Years",
    allocationAdvice:
      "Allocate 50-60% into low-cost Broad-Market Index Funds (Nifty 50 / Sensex TRI) and 40-50% into a well-managed Flexi-Cap Direct Plan. Automate via monthly SIP and review once annually.",
  };
}

// 5. Printable Redemption Checklist Items (Split into 4 sequential phases)
export interface RedemptionCheckItem {
  id: string;
  phase: "exit-load" | "taxation" | "banking" | "tracking";
  phaseTitle: string;
  itemNumber: number;
  title: string;
  instruction: string;
  regulatoryDetail: string;
  warningNote?: string;
}

export const REDEMPTION_CHECKLIST: RedemptionCheckItem[] = [
  // Phase 1: Exit Load & Lock-in
  {
    id: "redempt-1",
    phase: "exit-load",
    phaseTitle: "Phase 1: Exit Load & Statutory Lock-In Validation",
    itemNumber: 1,
    title: "Verify Exact Exit Load Holding Period (Units Age)",
    instruction: "Check if the units you intend to redeem have completed the exit load window (typically 365 days for equity, or 7 days for liquid funds).",
    regulatoryDetail: "Redeeming even 1 day before the completion of 365 days triggers a flat 1% exit load deducted directly from your gross redemption proceeds.",
    warningNote: "Remember: In SIPs, each monthly installment has its own independent 365-day exit load timer.",
  },
  {
    id: "redempt-2",
    phase: "exit-load",
    phaseTitle: "Phase 1: Exit Load & Statutory Lock-In Validation",
    itemNumber: 2,
    title: "Confirm ELSS 36-Month Lock-In Compliance",
    instruction: "If redeeming from an Equity Linked Savings Scheme (ELSS / Tax Saver), ensure units were allotted at least 36 calendar months ago.",
    regulatoryDetail: "Under Section 80C, early redemption of ELSS units is legally prohibited by SEBI and Central Government guidelines. Units are completely frozen by the RTA.",
    warningNote: "If you ran a 3-year SIP in ELSS, only installment #1 is free after 3 years; installment #36 unlocks only after 6 full years from start!",
  },
  {
    id: "redempt-3",
    phase: "exit-load",
    phaseTitle: "Phase 1: Exit Load & Statutory Lock-In Validation",
    itemNumber: 3,
    title: "Understand First-In, First-Out (FIFO) Accounting",
    instruction: "Understand that Indian tax and AMC systems strictly redeem the OLDEST acquired units first.",
    regulatoryDetail: "You cannot selectively sell recently purchased units. Units purchased earliest will be redeemed first, determining whether gains are LTCG or STCG.",
  },

  // Phase 2: Capital Gains & Fiscal Timing
  {
    id: "redempt-4",
    phase: "taxation",
    phaseTitle: "Phase 2: Capital Gains Tax & Fiscal Year Optimization",
    itemNumber: 4,
    title: "Calculate Equity Long-Term vs Short-Term Capital Gains Liability",
    instruction: "Review whether your gains qualify as LTCG (held > 12 months) at 12.5% or STCG (held <= 12 months) at 20%.",
    regulatoryDetail: "Under Section 112A (Finance Act 2024), aggregate equity LTCG across all mutual funds and direct stocks enjoys a tax-free exemption threshold of ₹1,25,000 per financial year.",
    warningNote: "If you have not exhausted your ₹1.25L exemption for the current financial year (April 1 to March 31), redeem eligible units before March 31 to harvest tax-free gains.",
  },
  {
    id: "redempt-5",
    phase: "taxation",
    phaseTitle: "Phase 2: Capital Gains Tax & Fiscal Year Optimization",
    itemNumber: 5,
    title: "Verify Debt Fund Purchase Date for Tax Treatment",
    instruction: "Determine if debt fund units were acquired before or after April 1, 2023.",
    regulatoryDetail: "Units bought on or after April 1, 2023, are taxed strictly at your marginal income tax slab rate with zero indexation benefit. Units bought prior to April 1, 2023, retain grandfathered 20% tax with indexation if held > 3 years.",
  },
  {
    id: "redempt-6",
    phase: "taxation",
    phaseTitle: "Phase 2: Capital Gains Tax & Fiscal Year Optimization",
    itemNumber: 6,
    title: "Evaluate Tax-Loss Harvesting Opportunities",
    instruction: "Check if you have unrealized short-term or long-term capital losses in other folios to offset against current gains.",
    regulatoryDetail: "Short-term capital losses can be set off against both STCG and LTCG. Long-term capital losses can be set off strictly against LTCG in your annual ITR.",
  },

  // Phase 3: Banking & Operational Verification
  {
    id: "redempt-7",
    phase: "banking",
    phaseTitle: "Phase 3: Operational & Banking Readiness",
    itemNumber: 7,
    title: "Verify Registered Payout Bank Account & IFSC Code",
    instruction: "Log into CAMS, KFintech, MF Central, or your broker and verify that the bank account linked to the folio is active and KYC-compliant.",
    regulatoryDetail: "Redemption proceeds are electronically transferred ONLY to the verified bank account recorded in the folio. If the account was closed, funds will bounce, requiring a tedious physical change of bank mandate.",
    warningNote: "Never attempt to change bank details and redeem on the same day. SEBI enforces a 10-15 day cooling-off period after bank changes before redemptions are processed.",
  },
  {
    id: "redempt-8",
    phase: "banking",
    phaseTitle: "Phase 3: Operational & Banking Readiness",
    itemNumber: 8,
    title: "Check SEBI Cut-Off Timing for Same-Day NAV Allotment",
    instruction: "Submit redemption request before official cut-off time to lock in today's closing NAV.",
    regulatoryDetail: "Official SEBI cut-off times: Liquid / Overnight Funds = 1:30 PM; Equity / Debt Funds = 3:00 PM on business days.",
    warningNote: "Orders submitted at 3:05 PM will receive the closing NAV of the NEXT business day, exposing proceeds to overnight market swings.",
  },
  {
    id: "redempt-9",
    phase: "banking",
    phaseTitle: "Phase 3: Operational & Banking Readiness",
    itemNumber: 9,
    title: "Choose Between 'Unit-Based' vs 'Amount-Based' Redemption",
    instruction: "For full portfolio exit, choose 'Redeem All Units' rather than specifying a rupee amount.",
    regulatoryDetail: "Because NAV fluctuates daily until end-of-day valuation, requesting an amount-based full redemption can leave small fractional units in the folio or fail if NAV drops.",
  },

  // Phase 4: Execution & Post-Redemption Tracking
  {
    id: "redempt-10",
    phase: "tracking",
    phaseTitle: "Phase 4: Post-Redemption Tracking & Reconciliation",
    itemNumber: 10,
    title: "Map the Settlement Cycle (Payout Expected Date)",
    instruction: "Note the settlement turnaround timeline to avoid unnecessary panic.",
    regulatoryDetail: "Liquid / Debt funds typically settle in T+1 business days. Equity mutual funds settle in T+2 business days. International fund-of-funds can take T+3 to T+5 business days.",
    warningNote: "Saturdays, Sundays, and RTGS bank holidays are NOT business days. A Friday equity redemption will credit by Tuesday evening.",
  },
  {
    id: "redempt-11",
    phase: "tracking",
    phaseTitle: "Phase 4: Post-Redemption Tracking & Reconciliation",
    itemNumber: 11,
    title: "Decide on SIP Mandate Continuation or Cancellation",
    instruction: "If you have an active monthly SIP running in the same folio, decide whether you want the SIP to continue.",
    regulatoryDetail: "Redeeming accumulated units does NOT cancel the registered bank auto-debit SIP mandate. If you wish to stop future investments, cancel the SIP mandate separately at least 15-21 days before the next debit date.",
  },
  {
    id: "redempt-12",
    phase: "tracking",
    phaseTitle: "Phase 4: Post-Redemption Tracking & Reconciliation",
    itemNumber: 12,
    title: "Download Consolidated Capital Gains Statement from RTA for ITR Filing",
    instruction: "After settlement, download the Capital Gains Statement from CAMS, KFintech, or MF Central for the financial year.",
    regulatoryDetail: "The statement details exact cost of acquisition, redemption value, STCG, LTCG, and grandfathering values (fair market value as on Jan 31, 2018) required for Schedule CG in ITR-2 or ITR-3.",
  },
];
