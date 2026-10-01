// Glossary of Mutual Fund Terms for Indian Retail Investors
// Every definition is crafted to be strictly between 40 and 80 words.
// Adheres strictly to SEBI regulations, AMFI standards, and Indian Income Tax rules.

export interface GlossaryTerm {
  id: string; // anchor link (e.g. "nav", "isin", "can", "exit-load")
  term: string; // Canonical name
  abbreviation?: string;
  cluster: "Basics" | "NAV & Valuation" | "Regulation & Compliance" | "Redemption & Operations" | "Fees & Taxation" | "Risk & Performance";
  letter: string; // A-Z for jump bar
  definition: string; // Strictly 40 to 80 words
  relatedTerms?: string[];
  relatedCalculatorUrl?: string;
  relatedCalculatorName?: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // A
  {
    id: "amc",
    term: "Asset Management Company (AMC)",
    abbreviation: "AMC",
    cluster: "Regulation & Compliance",
    letter: "A",
    definition: "An Asset Management Company is a SEBI-registered corporate entity appointed by mutual fund trustees to handle fund management, asset allocation, compliance, and investor service operations. AMCs employ professional fund managers and analysts who make buying and selling decisions in accordance with the scheme's statutory objectives and regulatory mandates, charging a capped expense ratio for operational and administrative management.",
    relatedTerms: ["sebi", "amfi", "expense-ratio", "sid"],
  },
  {
    id: "amfi",
    term: "Association of Mutual Funds in India (AMFI)",
    abbreviation: "AMFI",
    cluster: "Regulation & Compliance",
    letter: "A",
    definition: "The Association of Mutual Funds in India is the apex industry trade body representing all registered asset management companies across the nation. AMFI works to maintain ethical professional standards, promote investor awareness programs, disseminate daily industry NAV data, and enforce distributor licensing norms through the mandatory AMFI Registration Number framework under the overarching regulatory guidance of SEBI.",
    relatedTerms: ["amc", "sebi", "nav"],
  },
  {
    id: "aum",
    term: "Assets Under Management (AUM)",
    abbreviation: "AUM",
    cluster: "Basics",
    letter: "A",
    definition: "Assets Under Management represents the cumulative market value of all financial assets currently managed by a mutual fund scheme or an entire asset management company. AUM fluctuates daily due to net capital inflows or redemptions from investors combined with the upward or downward price movements of underlying securities, serving as a primary indicator of fund scale and retail liquidity.",
    relatedTerms: ["nav", "folio-number", "amc"],
  },

  // B
  {
    id: "benchmark-index",
    term: "Benchmark Index",
    abbreviation: "Benchmark",
    cluster: "Risk & Performance",
    letter: "B",
    definition: "A benchmark index is a designated market barometer, such as the Nifty 50 or BSE Sensex, against which an active mutual fund scheme's performance and risk ratios are evaluated. SEBI mandates that all schemes publish comparative returns against both a standard benchmark and an additional benchmark in Total Return Index format to show whether fund managers generate genuine alpha.",
    relatedTerms: ["tri", "cagr", "rolling-returns", "tracking-error"],
  },
  {
    id: "beta",
    term: "Beta",
    cluster: "Risk & Performance",
    letter: "B",
    definition: "Beta measures a mutual fund portfolio's volatility and sensitivity relative to its underlying benchmark index. A beta of 1.0 signifies that the fund typically moves in sync with the market. A beta greater than 1.0 indicates heightened volatility and market sensitivity, whereas a beta below 1.0 suggests defensive behavior with shallower drawdowns during systematic market corrections.",
    relatedTerms: ["standard-deviation", "sharpe-ratio", "benchmark-index"],
  },

  // C
  {
    id: "cagr",
    term: "Compound Annual Growth Rate (CAGR)",
    abbreviation: "CAGR",
    cluster: "Risk & Performance",
    letter: "C",
    definition: "Compound Annual Growth Rate is the annualised geometric progression rate at which an investment grows from its initial purchase value to its final terminal balance over a multi-year horizon. Unlike simple average annual returns, CAGR factors in compounding effects, providing a standardized, smoothed metric for evaluating long-term lump-sum mutual fund performance across varied holding periods.",
    relatedTerms: ["rolling-returns", "nav", "lumpsum"],
    relatedCalculatorUrl: "/calculators/lumpsum",
    relatedCalculatorName: "Lumpsum Calculator",
  },
  {
    id: "can",
    term: "Common Account Number (CAN)",
    abbreviation: "CAN",
    cluster: "Redemption & Operations",
    letter: "C",
    definition: "Common Account Number is a single, centralized reference number issued by MF Utilities India that consolidates an investor's mutual fund folios across different participating AMCs. By linking KYC records, bank mandates, and tax identifiers under one identifier, CAN enables seamless transacting, switching, and redemption through a unified platform without repeating physical paperwork across separate fund houses.",
    relatedTerms: ["folio-number", "kyc", "rta"],
  },
  {
    id: "cas",
    term: "Consolidated Account Statement (CAS)",
    abbreviation: "CAS",
    cluster: "Regulation & Compliance",
    letter: "C",
    definition: "A Consolidated Account Statement is an official monthly statement issued jointly by depositories like NSDL and CDSL alongside RTAs like CAMS and KFintech. CAS aggregates all mutual fund holdings, share transactions, and demat balances registered under a common PAN, providing investors with a comprehensive, transparent audit trail of their financial portfolio and net valuations.",
    relatedTerms: ["folio-number", "can", "rta"],
  },
  {
    id: "cut-off-timing",
    term: "Cut-Off Timing (NAV Applicability)",
    cluster: "NAV & Valuation",
    letter: "C",
    definition: "Cut-off timing refers to statutory deadlines set by SEBI that determine which day's Net Asset Value applies to an investor's subscription or redemption order. For equity and hybrid funds, orders and funds submitted before 3:00 PM IST receive that day's closing NAV, provided realization rules are fulfilled, whereas later submissions automatically rollover to the next business day.",
    relatedTerms: ["nav", "redemption", "settlement-cycle"],
  },

  // D
  {
    id: "debt-mutual-fund",
    term: "Debt Mutual Fund",
    cluster: "Basics",
    letter: "D",
    definition: "Debt mutual funds are collective investment schemes that allocate pooled investor capital into fixed-income securities, such as government bonds, treasury bills, commercial paper, and corporate debentures. Regulated into 16 distinct categories by SEBI, they prioritize capital preservation and accrual income over aggressive capital appreciation, subject to prevailing interest rate cycles and credit rating profiles.",
    relatedTerms: ["modified-duration", "ytm", "liquid-fund"],
  },
  {
    id: "direct-plan",
    term: "Direct Plan vs Regular Plan",
    cluster: "Fees & Taxation",
    letter: "D",
    definition: "A Direct Plan is purchased directly from the fund house without intermediaries, eliminating distributor commission expenses and resulting in a lower Total Expense Ratio and higher compounding returns. Conversely, Regular Plans incur ongoing trailing commissions paid to brokers or distributors, reducing net portfolio NAV over time. Both plans invest in the identical underlying portfolio assets.",
    relatedTerms: ["expense-ratio", "nav", "amc"],
    relatedCalculatorUrl: "/calculators/direct-vs-regular",
    relatedCalculatorName: "Direct vs Regular TER Drag Calculator",
  },
  {
    id: "dividend-reinvestment",
    term: "Dividend Reinvestment Plan",
    cluster: "Basics",
    letter: "D",
    definition: "Under a dividend reinvestment plan, declared payouts are not credited to the investor's bank account; instead, they are automatically reinvested to purchase additional units of the scheme at the prevailing ex-dividend NAV. Note that under current Indian tax legislation, all distributions are taxed in the hands of unit holders regardless of whether cash is received or reinvested.",
    relatedTerms: ["idcw", "growth-option", "nav"],
  },

  // E
  {
    id: "elss",
    term: "Equity Linked Savings Scheme (ELSS)",
    abbreviation: "ELSS",
    cluster: "Fees & Taxation",
    letter: "E",
    definition: "ELSS is an equity-diversified mutual fund category that offers tax deduction benefits up to ₹1.5 Lakh per financial year under Section 80C of the Old Tax Regime. ELSS schemes carry a mandatory three-year lock-in period—the shortest among Section 80C instruments—encouraging disciplined equity compounding while generating capital gains subject to Section 112A rules.",
    relatedTerms: ["lock-in-period", "ltcg", "sip"],
  },
  {
    id: "exit-load",
    term: "Exit Load",
    cluster: "Redemption & Operations",
    letter: "E",
    definition: "Exit load is a fractional percentage penalty charged by an AMC when an investor redeems or switches units before a predefined tenure expires. Designed to discourage short-term speculation and protect remaining unit holders from transaction friction, the deducted fee is credited back into the scheme's assets. No exit load applies after the specified period.",
    relatedTerms: ["redemption", "lock-in-period", "nav"],
  },
  {
    id: "expense-ratio",
    term: "Total Expense Ratio (TER)",
    abbreviation: "TER",
    cluster: "Fees & Taxation",
    letter: "E",
    definition: "The Total Expense Ratio is the annualised percentage of a mutual fund's total assets charged to cover portfolio management, custodial, legal, administrative, and distribution costs. Capped by SEBI based on scheme size, TER is deducted daily on a pro-rata basis before publishing the scheme's net asset value, directly influencing long-term compound wealth accumulation.",
    relatedTerms: ["direct-plan", "nav", "amc"],
    relatedCalculatorUrl: "/calculators/direct-vs-regular",
    relatedCalculatorName: "TER Drag Calculator",
  },

  // F
  {
    id: "factsheet",
    term: "Monthly Fund Factsheet",
    cluster: "Regulation & Compliance",
    letter: "F",
    definition: "A fund factsheet is an educational monthly disclosure document published by AMCs detailing portfolio composition, sector allocations, top ten stock holdings, credit ratings, cash levels, and standard performance metrics. Factsheets allow unitholders to evaluate fund manager convictions, active share, risk ratios, and asset allocation discipline against stated benchmark indices under SEBI disclosure norms.",
    relatedTerms: ["sid", "amc", "benchmark-index", "aum"],
  },
  {
    id: "folio-number",
    term: "Folio Number",
    cluster: "Redemption & Operations",
    letter: "F",
    definition: "A folio number is a unique alphanumeric account identification number assigned by an asset management company to an individual investor's account. Much like a bank account number, it maintains an official record of all scheme investments, transactions, nominations, unit allotments, and contact details held under that specific fund house registration.",
    relatedTerms: ["can", "cas", "rta"],
  },
  {
    id: "fund-manager",
    term: "Fund Manager",
    cluster: "Basics",
    letter: "F",
    definition: "A fund manager is an investment professional certified and appointed by an AMC responsible for executing a scheme's portfolio strategy. Working with research teams, the fund manager selects securities, determines asset allocations, oversees diversification, and rebalances holdings in compliance with the scheme's mandate and SEBI limits to optimize risk-adjusted returns for investors.",
    relatedTerms: ["amc", "factsheet", "benchmark-index"],
  },

  // G
  {
    id: "gilt-fund",
    term: "Gilt Mutual Fund",
    cluster: "Basics",
    letter: "G",
    definition: "Gilt funds are debt mutual funds that invest at least 80 percent of their total assets in central and state government securities. Because government papers carry sovereign backing, gilt funds feature zero credit default risk. However, they remain highly exposed to interest rate risk, experiencing price volatility as prevailing bond yields fluctuate across economic cycles.",
    relatedTerms: ["debt-mutual-fund", "modified-duration", "ytm"],
  },
  {
    id: "growth-option",
    term: "Growth Option",
    cluster: "Basics",
    letter: "G",
    definition: "The Growth Option is a mutual fund investment structure where portfolio profits, dividends, and capital gains are completely retained and reinvested within the scheme rather than paid out as cash distributions. This allows the investor's corpus to compound continuously, reflecting in an expanding NAV until units are redeemed at the investor's discretion.",
    relatedTerms: ["idcw", "cagr", "nav"],
  },

  // H
  {
    id: "hybrid-fund",
    term: "Hybrid Mutual Fund",
    cluster: "Basics",
    letter: "H",
    definition: "Hybrid mutual funds are multi-asset investment vehicles that combine equities, fixed-income debt securities, and occasionally commodities like gold within a single portfolio. By blending capital appreciation from stocks with steady income and downside containment from debt, hybrid funds cater to investors seeking balanced asset allocation without managing separate underlying asset holdings.",
    relatedTerms: ["debt-mutual-fund", "equity-fund", "asset-allocation"],
  },
  {
    id: "holding-period",
    term: "Holding Period",
    cluster: "Fees & Taxation",
    letter: "H",
    definition: "Holding period is the total duration an investor maintains ownership of mutual fund units between the purchase date and the redemption date. Under the Indian Income Tax Act, the holding period classifies capital gains as short-term or long-term (e.g., 12 months for equity schemes), directly determining applicable capital gains tax rates and exemption limits.",
    relatedTerms: ["ltcg", "stcg", "redemption"],
  },

  // I
  {
    id: "idcw",
    term: "Income Distribution cum Capital Withdrawal (IDCW)",
    abbreviation: "IDCW",
    cluster: "NAV & Valuation",
    letter: "I",
    definition: "IDCW is SEBI's standardized regulatory terminology replacing the former 'Dividend Option' in Indian mutual funds. The term explicitly clarifies to investors that payouts are not corporate dividends; rather, they represent a distribution of accumulated scheme surpluses and partial return of the investor's own capital, which causes the scheme's NAV to drop proportionately.",
    relatedTerms: ["growth-option", "nav", "dividend-reinvestment"],
  },
  {
    id: "index-fund",
    term: "Index Fund",
    cluster: "Basics",
    letter: "I",
    definition: "An index fund is a passively managed mutual fund scheme that replicates the exact composition and weightings of a specific market index, such as the Nifty 50 or Sensex. By eliminating active manager bias and research costs, index funds offer minimal expense ratios and deliver market-matching returns subject only to minor tracking error.",
    relatedTerms: ["tracking-error", "benchmark-index", "expense-ratio"],
  },
  {
    id: "isin",
    term: "International Securities Identification Number (ISIN)",
    abbreviation: "ISIN",
    cluster: "NAV & Valuation",
    letter: "I",
    definition: "ISIN is a unique 12-character alphanumeric code assigned under international standards (ISO 6166) that uniquely identifies a specific financial instrument or mutual fund plan variant. In India, separate ISINs are assigned to Direct and Regular plans, as well as Growth and IDCW options, ensuring unambiguous transaction routing across clearing systems and depositories.",
    relatedTerms: ["nav", "folio-number", "amfi"],
  },

  // K
  {
    id: "kim",
    term: "Key Information Memorandum (KIM)",
    abbreviation: "KIM",
    cluster: "Regulation & Compliance",
    letter: "K",
    definition: "The Key Information Memorandum is a statutory summary document of the primary Scheme Information Document mandated by SEBI. It provides investors with vital essentials, including investment objectives, riskometer categorization, asset allocation ranges, historical returns, minimum investment thresholds, and recurring expense structures, and must accompany all application forms distributed to retail investors.",
    relatedTerms: ["sid", "factsheet", "sebi"],
  },
  {
    id: "kyc",
    term: "Know Your Customer (KYC)",
    abbreviation: "KYC",
    cluster: "Regulation & Compliance",
    letter: "K",
    definition: "Know Your Customer is a one-time mandatory compliance verification process regulated by SEBI to prevent money laundering and identity fraud across Indian financial markets. Retail investors complete KYC through verified identity and address proofs, biometric checks, and PAN linkage before they are legally permitted to invest in any mutual fund scheme.",
    relatedTerms: ["can", "folio-number", "sebi"],
  },

  // L
  {
    id: "liquid-fund",
    term: "Liquid Mutual Fund",
    cluster: "Basics",
    letter: "L",
    definition: "Liquid mutual funds are ultra-short debt schemes that invest strictly in debt and money market securities with residual maturities of up to 91 days. Characterized by negligible interest rate volatility and high liquidity, they serve as parking vehicles for emergency reserves or short-term surpluses, subject to a graded 7-day exit load structure mandated by SEBI.",
    relatedTerms: ["debt-mutual-fund", "exit-load", "ytm"],
  },
  {
    id: "lock-in-period",
    term: "Lock-in Period",
    cluster: "Redemption & Operations",
    letter: "L",
    definition: "A lock-in period is a mandatory statutory duration during which an investor cannot redeem, switch, or transfer their mutual fund units. Prominently featured in tax-saving ELSS funds (three-year lock-in), retirement funds, or child gift funds, it enforces long-term investment discipline while offering tax advantages or targeted milestone planning.",
    relatedTerms: ["elss", "redemption", "exit-load"],
  },
  {
    id: "ltcg",
    term: "Long-Term Capital Gains (LTCG)",
    abbreviation: "LTCG",
    cluster: "Fees & Taxation",
    letter: "L",
    definition: "Long-Term Capital Gains refer to profits realized from redeeming mutual fund units held beyond the statutory long-term holding period threshold. For equity-oriented funds held over 12 months, LTCG exceeding ₹1.25 Lakh per financial year is taxed at 12.5% without indexation benefits under Section 112A, following amendments enacted in Finance Act 2024.",
    relatedTerms: ["stcg", "holding-period", "taxation"],
  },

  // M
  {
    id: "modified-duration",
    term: "Modified Duration",
    cluster: "Risk & Performance",
    letter: "M",
    definition: "Modified duration is a quantitative risk metric expressing the percentage price sensitivity of a bond or debt mutual fund portfolio to a 100-basis-point (1%) change in market interest rates. A debt fund with a duration of five years is expected to experience a 5% price decline if interest rates rise by 1%, and vice versa.",
    relatedTerms: ["debt-mutual-fund", "gilt-fund", "ytm"],
  },
  {
    id: "mutual-fund",
    term: "Mutual Fund",
    cluster: "Basics",
    letter: "M",
    definition: "A mutual fund is a trust-based financial intermediary that pools capital from numerous retail and institutional investors with common financial objectives. Regulated by SEBI under the 1996 Mutual Fund Regulations, the collective corpus is professionally invested across equities, bonds, or money market instruments, allocating fractional units proportional to individual financial contributions.",
    relatedTerms: ["amc", "nav", "aum", "sebi"],
  },

  // N
  {
    id: "nav",
    term: "Net Asset Value (NAV)",
    abbreviation: "NAV",
    cluster: "NAV & Valuation",
    letter: "N",
    definition: "Net Asset Value represents the net market worth of a single unit of a mutual fund scheme. Computed daily following market closure, NAV is calculated by summing the total market value of all underlying securities and liquid assets, deducting permissible operating liabilities and expenses, and dividing the resultant figure by the total outstanding units in circulation.",
    relatedTerms: ["isin", "aum", "cut-off-timing", "expense-ratio"],
  },
  {
    id: "nfo",
    term: "New Fund Offer (NFO)",
    abbreviation: "NFO",
    cluster: "Regulation & Compliance",
    letter: "N",
    definition: "A New Fund Offer is the initial subscription period during which an asset management company launches a newly conceptualized mutual fund scheme to raise initial seed capital. Units are typically offered at a fixed nominal face value of ₹10 per unit, after which open-ended schemes transition to daily NAV-based transactions.",
    relatedTerms: ["nav", "amc", "sid"],
  },
  {
    id: "nomination",
    term: "Nomination in Mutual Funds",
    cluster: "Regulation & Compliance",
    letter: "N",
    definition: "Nomination is a legally binding facility allowing an investor to designate one or more individuals who are authorized to claim mutual fund units upon the investor's demise. SEBI mandates that all individual mutual fund folios either register verified nominees with percentage allocations or complete an explicit formal opt-out declaration to avoid operational transmission delays.",
    relatedTerms: ["folio-number", "can", "sebi"],
  },

  // P
  {
    id: "portfolio-turnover",
    term: "Portfolio Turnover Ratio",
    cluster: "Fees & Taxation",
    letter: "P",
    definition: "Portfolio Turnover Ratio measures the frequency with which a mutual fund's underlying assets are bought and sold by the fund manager over a one-year period. A high ratio indicates active trading, which can escalate transaction brokerage charges and brokerage drag, whereas a low ratio signals a patient buy-and-hold investing philosophy.",
    relatedTerms: ["expense-ratio", "fund-manager", "factsheet"],
  },
  {
    id: "pe-ratio",
    term: "Price-to-Earnings Ratio (Portfolio P/E)",
    abbreviation: "P/E",
    cluster: "Risk & Performance",
    letter: "P",
    definition: "Portfolio Price-to-Earnings ratio is the weighted average valuation multiple of all underlying equity stocks held within a mutual fund portfolio. It indicates how much investors are paying per rupee of company earnings. A higher portfolio P/E indicates premium growth-oriented equities, while a lower P/E reflects value or dividend-yield investment mandates.",
    relatedTerms: ["factsheet", "benchmark-index", "rolling-returns"],
  },

  // R
  {
    id: "redemption",
    term: "Redemption of Units",
    cluster: "Redemption & Operations",
    letter: "R",
    definition: "Redemption is the operational process where an investor sells back mutual fund units to the asset management company in exchange for cash proceeds. The payout is determined by the applicable NAV on the transaction date less any applicable exit load, with funds credited directly to the verified registered bank account within statutory settlement timeframes.",
    relatedTerms: ["exit-load", "cut-off-timing", "settlement-cycle", "nav"],
  },
  {
    id: "regular-plan",
    term: "Regular Plan",
    cluster: "Fees & Taxation",
    letter: "R",
    definition: "A Regular Plan is an investment route where mutual fund units are acquired through registered intermediaries, brokers, banks, or distributors. The fund house pays ongoing trailing commissions to the distributor from the scheme's assets, resulting in a higher ongoing expense ratio and lower net compounded returns compared to the Direct Plan variant.",
    relatedTerms: ["direct-plan", "expense-ratio", "amfi"],
    relatedCalculatorUrl: "/calculators/direct-vs-regular",
    relatedCalculatorName: "Direct vs Regular Calculator",
  },
  {
    id: "rolling-returns",
    term: "Rolling Returns",
    cluster: "Risk & Performance",
    letter: "R",
    definition: "Rolling returns measure a mutual fund's performance across continuous overlapping investment blocks (such as three-year or five-year windows) evaluated across multiple historical years. By neutralizing point-to-point starting and ending date biases, rolling returns provide the most reliable, realistic assessment of fund manager consistency through bull and bear market cycles.",
    relatedTerms: ["cagr", "benchmark-index", "standard-deviation"],
  },
  {
    id: "rta",
    term: "Registrar and Transfer Agent (RTA)",
    abbreviation: "RTA",
    cluster: "Regulation & Compliance",
    letter: "R",
    definition: "Registrar and Transfer Agents are specialized financial institutions, primarily CAMS and KFintech in India, appointed by AMCs to maintain unitholder records, process purchase and redemption orders, manage unit allotments, update bank details, and distribute account statements under strict regulatory compliance guidelines issued by SEBI.",
    relatedTerms: ["can", "cas", "folio-number", "sebi"],
  },

  // S
  {
    id: "sebi",
    term: "Securities and Exchange Board of India (SEBI)",
    abbreviation: "SEBI",
    cluster: "Regulation & Compliance",
    letter: "S",
    definition: "The Securities and Exchange Board of India is the statutory apex market regulator established under the SEBI Act, 1992. SEBI exercises comprehensive supervisory authority over mutual funds, mandating scheme categorizations, portfolio limits, expense caps, investor disclosure norms, and advertising regulations to safeguard retail investor interests and maintain capital market integrity.",
    relatedTerms: ["amc", "amfi", "sid", "expense-ratio"],
  },
  {
    id: "settlement-cycle",
    term: "Settlement Cycle (T+1 / T+2)",
    cluster: "Redemption & Operations",
    letter: "S",
    definition: "The settlement cycle refers to the statutory timeframe required for mutual fund redemption proceeds to be processed and credited to the investor's bank account following order execution. In India, equity mutual fund redemptions typically follow a T+2 business-day cycle, whereas debt and liquid fund payouts settle on a T+1 basis.",
    relatedTerms: ["redemption", "cut-off-timing", "nav"],
  },
  {
    id: "sharpe-ratio",
    term: "Sharpe Ratio",
    cluster: "Risk & Performance",
    letter: "S",
    definition: "The Sharpe Ratio is a risk-adjusted return metric that measures the excess return generated by a mutual fund portfolio over the risk-free rate per unit of total risk (standard deviation). A higher Sharpe Ratio demonstrates that superior fund returns are driven by intelligent asset selection rather than taking on excessive portfolio volatility.",
    relatedTerms: ["standard-deviation", "beta", "rolling-returns"],
  },
  {
    id: "sid",
    term: "Scheme Information Document (SID)",
    abbreviation: "SID",
    cluster: "Regulation & Compliance",
    letter: "S",
    definition: "The Scheme Information Document is a comprehensive legal prospectus prepared by an AMC and filed with SEBI prior to launching any mutual fund scheme. The SID outlines fundamental attributes, investment mandates, asset allocation limits, risk factors, fee structures, and unitholder rights that govern the ongoing operation of the fund.",
    relatedTerms: ["kim", "amc", "sebi"],
  },
  {
    id: "sip",
    term: "Systematic Investment Plan (SIP)",
    abbreviation: "SIP",
    cluster: "Basics",
    letter: "S",
    definition: "A Systematic Investment Plan is a disciplined investment methodology permitting retail investors to contribute a fixed rupee sum into a mutual fund scheme at predetermined intervals (such as monthly). SIPs leverage rupee-cost averaging by acquiring more units during market declines and fewer during rallies, mitigating market timing anxiety through regular compounding.",
    relatedTerms: ["stp", "swp", "nav"],
    relatedCalculatorUrl: "/calculators/sip",
    relatedCalculatorName: "SIP Compounding Calculator",
  },
  {
    id: "standard-deviation",
    term: "Standard Deviation",
    cluster: "Risk & Performance",
    letter: "S",
    definition: "Standard deviation is a statistical dispersion metric quantifying the historical volatility of a mutual fund scheme's returns around its historical mean. A higher standard deviation indicates wider return fluctuations and higher volatility risk, while a lower standard deviation indicates smoother, more consistent return distributions across volatile economic periods.",
    relatedTerms: ["sharpe-ratio", "beta", "rolling-returns"],
  },
  {
    id: "stcg",
    term: "Short-Term Capital Gains (STCG)",
    abbreviation: "STCG",
    cluster: "Fees & Taxation",
    letter: "S",
    definition: "Short-Term Capital Gains occur when mutual fund units are redeemed before satisfying the statutory long-term holding period. For equity-oriented funds redeemed within 12 months, STCG is taxed at a flat rate of 20% under Section 111A following the Budget 2024 revisions. For debt funds, short-term gains are taxed at applicable income tax slab rates.",
    relatedTerms: ["ltcg", "holding-period", "taxation"],
  },
  {
    id: "stp",
    term: "Systematic Transfer Plan (STP)",
    abbreviation: "STP",
    cluster: "Basics",
    letter: "S",
    definition: "A Systematic Transfer Plan is an automated facility enabling an investor to periodically transfer a fixed sum or unit balance from a source fund (typically a liquid or short-term debt fund) into a target equity fund within the same AMC. STP enables phased capital deployment, mitigating the timing risk of large lump-sum allocations.",
    relatedTerms: ["sip", "swp", "liquid-fund"],
  },
  {
    id: "swp",
    term: "Systematic Withdrawal Plan (SWP)",
    abbreviation: "SWP",
    cluster: "Redemption & Operations",
    letter: "S",
    definition: "A Systematic Withdrawal Plan allows investors to redeem a predetermined rupee amount from their accumulated mutual fund corpus at regular monthly or quarterly intervals. Widely used for retirement cash flows, SWP is highly tax-efficient because each withdrawal consists of a return of capital combined with fractional capital gains subject to capital gains tax.",
    relatedTerms: ["sip", "redemption", "ltcg"],
  },

  // T
  {
    id: "tracking-error",
    term: "Tracking Error",
    cluster: "Risk & Performance",
    letter: "T",
    definition: "Tracking error is a statistical measure of the annualized divergence between the returns of an index fund or ETF and its underlying target benchmark index. Driven by the scheme's expense ratio, cash drag, dividend reinvestment timing, and unit rebalancing costs, a lower tracking error indicates more precise benchmark replication.",
    relatedTerms: ["index-fund", "benchmark-index", "expense-ratio"],
  },
  {
    id: "tri",
    term: "Total Return Index (TRI)",
    abbreviation: "TRI",
    cluster: "Risk & Performance",
    letter: "T",
    definition: "Total Return Index is a benchmark index calculation method that accounts for both capital gains and dividend cash flows generated by constituent companies. SEBI mandates that all mutual fund schemes compare their performance against TRI benchmarks rather than pure price return indices, ensuring honest, fair evaluation of active fund manager outperformance.",
    relatedTerms: ["benchmark-index", "cagr", "rolling-returns"],
  },

  // Y
  {
    id: "ytm",
    term: "Yield to Maturity (YTM)",
    abbreviation: "YTM",
    cluster: "NAV & Valuation",
    letter: "Y",
    definition: "Yield to Maturity is the expected annual rate of return earned by a debt mutual fund if all underlying bonds currently in the portfolio are held until maturity, assuming all coupon payments are reinvested at the same yield. YTM serves as an indicative, unpromised gross yield benchmark for debt portfolios.",
    relatedTerms: ["debt-mutual-fund", "modified-duration", "gilt-fund"],
  },
];
