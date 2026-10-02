// Helper functions & utilities for Indian Mutual Fund Calculators
// Follows Indian numbering system (Lakh / Crore) and regulatory rules

export function formatINR(val: number): string {
  if (isNaN(val) || !isFinite(val)) return "₹0";
  const rounded = Math.round(val);
  return "₹" + rounded.toLocaleString("en-IN");
}

export function formatIndianWords(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return "₹0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 10000000) {
    return sign + "₹" + (abs / 10000000).toFixed(2) + " Crore";
  } else if (abs >= 100000) {
    return sign + "₹" + (abs / 100000).toFixed(2) + " Lakh";
  } else if (abs >= 1000) {
    return sign + "₹" + (abs / 1000).toFixed(1) + " Thousand";
  }
  return sign + "₹" + Math.round(abs).toLocaleString("en-IN");
}

export function formatCompactINR(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return "₹0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 10000000) {
    return sign + "₹" + (abs / 10000000).toFixed(2) + " Cr";
  } else if (abs >= 100000) {
    return sign + "₹" + (abs / 100000).toFixed(2) + " L";
  } else if (abs >= 1000) {
    return sign + "₹" + (abs / 1000).toFixed(1) + "k";
  }
  return sign + "₹" + Math.round(abs);
}

// SIP Yearly Table Row Interface
export interface SipYearlyData {
  year: number;
  openingBalance: number;
  annualInvested: number;
  totalInvested: number;
  returnsEarned: number;
  closingBalance: number;
}

// Compute Year-by-Year SIP Schedule
export function calculateSipSchedule(
  monthlyAmount: number,
  annualReturnRate: number,
  years: number
): { schedule: SipYearlyData[]; totalInvested: number; futureValue: number; totalGains: number } {
  const schedule: SipYearlyData[] = [];
  const monthlyRate = annualReturnRate / 100 / 12;
  let runningBalance = 0;
  let cumulativeInvested = 0;

  for (let y = 1; y <= years; y++) {
    const openingBalance = runningBalance;
    let yearInvested = 0;
    let yearOpeningReturns = runningBalance;

    for (let m = 1; m <= 12; m++) {
      yearInvested += monthlyAmount;
      cumulativeInvested += monthlyAmount;
      runningBalance = (runningBalance + monthlyAmount) * (1 + monthlyRate);
    }

    const yearReturns = runningBalance - yearOpeningReturns - yearInvested;
    schedule.push({
      year: y,
      openingBalance,
      annualInvested: yearInvested,
      totalInvested: cumulativeInvested,
      returnsEarned: Math.max(0, yearReturns),
      closingBalance: runningBalance,
    });
  }

  const futureValue = runningBalance;
  const totalInvested = monthlyAmount * years * 12;
  const totalGains = Math.max(0, futureValue - totalInvested);

  return { schedule, totalInvested, futureValue, totalGains };
}

// Step-Up SIP Yearly Data
export interface StepUpYearlyData {
  year: number;
  monthlyAmount: number;
  annualInvested: number;
  totalInvested: number;
  returnsEarned: number;
  closingBalance: number;
  normalBalance: number;
  additionalWealth: number;
}

// Compute Step-Up SIP Schedule
export function calculateStepUpSipSchedule(
  initialMonthlyAmount: number,
  stepUpPct: number,
  annualReturnRate: number,
  years: number
): {
  schedule: StepUpYearlyData[];
  stepUpInvested: number;
  stepUpFV: number;
  stepUpGains: number;
  normalInvested: number;
  normalFV: number;
  extraWealth: number;
} {
  const schedule: StepUpYearlyData[] = [];
  const monthlyRate = annualReturnRate / 100 / 12;
  let runningBalance = 0;
  let runningInvested = 0;

  let normalBalance = 0;
  let normalInvested = 0;

  for (let y = 1; y <= years; y++) {
    const yearIndex = y - 1;
    const currentMonthly = initialMonthlyAmount * Math.pow(1 + stepUpPct / 100, yearIndex);
    const yearOpening = runningBalance;
    let yearInvested = 0;

    for (let m = 1; m <= 12; m++) {
      yearInvested += currentMonthly;
      runningInvested += currentMonthly;
      runningBalance = (runningBalance + currentMonthly) * (1 + monthlyRate);

      normalInvested += initialMonthlyAmount;
      normalBalance = (normalBalance + initialMonthlyAmount) * (1 + monthlyRate);
    }

    const returnsEarned = runningBalance - yearOpening - yearInvested;
    schedule.push({
      year: y,
      monthlyAmount: currentMonthly,
      annualInvested: yearInvested,
      totalInvested: runningInvested,
      returnsEarned: Math.max(0, returnsEarned),
      closingBalance: runningBalance,
      normalBalance,
      additionalWealth: Math.max(0, runningBalance - normalBalance),
    });
  }

  return {
    schedule,
    stepUpInvested: runningInvested,
    stepUpFV: runningBalance,
    stepUpGains: Math.max(0, runningBalance - runningInvested),
    normalInvested,
    normalFV: normalBalance,
    extraWealth: Math.max(0, runningBalance - normalBalance),
  };
}

// Lumpsum Yearly Data
export interface LumpsumYearlyData {
  year: number;
  openingBalance: number;
  growthInYear: number;
  cumulativeGains: number;
  closingBalance: number;
}

// Compute Lumpsum Schedule
export function calculateLumpsumSchedule(
  principal: number,
  annualReturnRate: number,
  years: number
): { schedule: LumpsumYearlyData[]; totalInvested: number; futureValue: number; totalGains: number } {
  const schedule: LumpsumYearlyData[] = [];
  const monthlyRate = annualReturnRate / 100 / 12;
  let runningBalance = principal;

  for (let y = 1; y <= years; y++) {
    const openingBalance = runningBalance;
    for (let m = 1; m <= 12; m++) {
      runningBalance = runningBalance * (1 + monthlyRate);
    }
    const growthInYear = runningBalance - openingBalance;
    const cumulativeGains = runningBalance - principal;

    schedule.push({
      year: y,
      openingBalance,
      growthInYear: Math.max(0, growthInYear),
      cumulativeGains: Math.max(0, cumulativeGains),
      closingBalance: runningBalance,
    });
  }

  const futureValue = runningBalance;
  const totalGains = Math.max(0, futureValue - principal);

  return { schedule, totalInvested: principal, futureValue, totalGains };
}

// Tax Calculation helper
export interface TaxEstimateResult {
  capitalGain: number;
  exemptionUsed: number;
  taxableGains: number;
  estimatedTax: number;
  postTaxCorpus: number;
}

export function estimateLtcgTax(
  futureValue: number,
  totalInvested: number,
  taxRatePct: number,
  exemptionAmount: number
): TaxEstimateResult {
  const capitalGain = Math.max(0, futureValue - totalInvested);
  const exemptionUsed = Math.min(capitalGain, Math.max(0, exemptionAmount));
  const taxableGains = Math.max(0, capitalGain - exemptionUsed);
  const estimatedTax = taxableGains * (Math.max(0, taxRatePct) / 100);
  const postTaxCorpus = Math.max(totalInvested, futureValue - estimatedTax);

  return {
    capitalGain,
    exemptionUsed,
    taxableGains,
    estimatedTax,
    postTaxCorpus,
  };
}

// Systematic Withdrawal Plan (SWP) Yearly Data
export interface SwpYearlyData {
  year: number;
  openingBalance: number;
  monthlyWithdrawal: number;
  annualWithdrawn: number;
  cumulativeWithdrawn: number;
  growthEarned: number;
  closingBalance: number;
  isDepleted: boolean;
}

export interface SwpCalculationResult {
  schedule: SwpYearlyData[];
  initialCorpus: number;
  totalWithdrawn: number;
  finalBalance: number;
  totalGrowthEarned: number;
  annualWithdrawalRate: number;
  isDepleted: boolean;
  depletedMonth: number | null;
  depletedYear: number | null;
  depletedMonthInYear: number | null;
}

export function calculateSwpSchedule(
  initialCorpus: number,
  initialMonthlyWithdrawal: number,
  annualReturnRate: number,
  years: number,
  annualStepUpPct: number = 0
): SwpCalculationResult {
  const schedule: SwpYearlyData[] = [];
  const monthlyRate = Math.max(0, annualReturnRate) / 100 / 12;
  const stepUpMultiplier = 1 + Math.max(0, annualStepUpPct) / 100;

  let balance = Math.max(0, initialCorpus);
  let cumulativeWithdrawn = 0;
  let totalGrowthEarned = 0;
  let depletedMonth: number | null = null;
  let depletedYear: number | null = null;
  let depletedMonthInYear: number | null = null;

  for (let y = 1; y <= years; y++) {
    const openingBalance = balance;
    // Step-up applied annually: year 1 uses initialMonthlyWithdrawal, year 2 increased by stepUpPct, etc.
    const monthlyWithdrawal = initialMonthlyWithdrawal * Math.pow(stepUpMultiplier, y - 1);
    let annualWithdrawn = 0;
    let annualGrowth = 0;

    for (let m = 1; m <= 12; m++) {
      const currentMonthGlobal = (y - 1) * 12 + m;
      if (balance <= 0) {
        // Already depleted
        continue;
      }

      if (balance <= monthlyWithdrawal) {
        // Corpus runs out this month
        annualWithdrawn += balance;
        cumulativeWithdrawn += balance;
        balance = 0;
        if (depletedMonth === null) {
          depletedMonth = currentMonthGlobal;
          depletedYear = y;
          depletedMonthInYear = m;
        }
      } else {
        // Balance = (Balance - Withdrawal) * (1 + r/12)
        annualWithdrawn += monthlyWithdrawal;
        cumulativeWithdrawn += monthlyWithdrawal;
        const remainingAfterWithdrawal = balance - monthlyWithdrawal;
        const interest = remainingAfterWithdrawal * monthlyRate;
        annualGrowth += interest;
        balance = remainingAfterWithdrawal + interest;
      }
    }

    totalGrowthEarned += annualGrowth;
    schedule.push({
      year: y,
      openingBalance,
      monthlyWithdrawal,
      annualWithdrawn,
      cumulativeWithdrawn,
      growthEarned: annualGrowth,
      closingBalance: Math.max(0, balance),
      isDepleted: balance <= 0,
    });
  }

  const annualWithdrawalRate = initialCorpus > 0 ? ((initialMonthlyWithdrawal * 12) / initialCorpus) * 100 : 0;

  return {
    schedule,
    initialCorpus,
    totalWithdrawn: cumulativeWithdrawn,
    finalBalance: Math.max(0, balance),
    totalGrowthEarned,
    annualWithdrawalRate,
    isDepleted: depletedMonth !== null,
    depletedMonth,
    depletedYear,
    depletedMonthInYear,
  };
}

// Goal Planner Calculator Interfaces & Helper
export interface GoalPlannerYearlyData {
  year: number;
  sipInvestedCumulative: number;
  totalInvested: number;
  projectedCorpus: number;
  gainsCumulative: number;
  inflationTargetProgress: number;
}

export interface GoalPlannerWhatIfScenario {
  label: string;
  returnRate: number;
  monthlySip: number;
  totalSipInvested: number;
  estimatedGains: number;
  differenceVsBase: number;
}

export interface GoalPlannerResult {
  currentCost: number;
  years: number;
  inflationRate: number;
  annualReturn: number;
  existingSavings: number;
  futureCost: number;
  existingSavingsFV: number;
  remainingTarget: number;
  requiredMonthlySip: number;
  totalSipInvested: number;
  totalCapitalInvested: number;
  estimatedGains: number;
  schedule: GoalPlannerYearlyData[];
  whatIfScenarios: GoalPlannerWhatIfScenario[];
}

export function calculateGoalPlanner(
  currentCost: number,
  years: number,
  inflationRate: number,
  annualReturn: number,
  existingSavings: number = 0
): GoalPlannerResult {
  const safeYears = Math.max(1, years);
  const safeCost = Math.max(0, currentCost);
  const safeInflation = Math.max(0, inflationRate);
  const safeReturn = Math.max(0.1, annualReturn);
  const safeSavings = Math.max(0, existingSavings);

  // Future cost = cost * (1 + inflation)^years
  const futureCost = safeCost * Math.pow(1 + safeInflation / 100, safeYears);

  // Existing savings compounded monthly
  const monthlyRate = safeReturn / 100 / 12;
  const totalMonths = safeYears * 12;
  const existingSavingsFV = safeSavings * Math.pow(1 + monthlyRate, totalMonths);

  // Remaining funding gap
  const remainingTarget = Math.max(0, futureCost - existingSavingsFV);

  // Required monthly SIP using standard SIP future value formula:
  // FV_sip = SIP * [((1 + i)^n - 1) / i] * (1 + i)
  const sipFactor =
    monthlyRate > 0
      ? ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
      : totalMonths;

  const requiredMonthlySip =
    remainingTarget > 0 && sipFactor > 0
      ? Math.round(remainingTarget / sipFactor)
      : 0;

  const totalSipInvested = requiredMonthlySip * totalMonths;
  const totalCapitalInvested = safeSavings + totalSipInvested;
  const estimatedGains = Math.max(0, futureCost - totalCapitalInvested);

  // Year-by-year trajectory
  const schedule: GoalPlannerYearlyData[] = [];
  for (let y = 1; y <= safeYears; y++) {
    const months = y * 12;
    const compoundedSavings = safeSavings * Math.pow(1 + monthlyRate, months);
    const sipFactorY =
      monthlyRate > 0
        ? ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
        : months;
    const accumulatedSip = requiredMonthlySip * sipFactorY;
    const projectedCorpus = compoundedSavings + accumulatedSip;
    const sipInvestedCumulative = requiredMonthlySip * months;
    const totalInvested = safeSavings + sipInvestedCumulative;
    const gainsCumulative = Math.max(0, projectedCorpus - totalInvested);
    const inflationTargetProgress = Math.min(100, (projectedCorpus / futureCost) * 100);

    schedule.push({
      year: y,
      sipInvestedCumulative,
      totalInvested,
      projectedCorpus,
      gainsCumulative,
      inflationTargetProgress,
    });
  }

  // What-if scenarios at -2% and +2%
  const calcScenario = (rate: number, label: string): GoalPlannerWhatIfScenario => {
    const scenarioRate = Math.max(0.1, rate);
    const sMonthlyRate = scenarioRate / 100 / 12;
    const sSavingsFV = safeSavings * Math.pow(1 + sMonthlyRate, totalMonths);
    const sGap = Math.max(0, futureCost - sSavingsFV);
    const sFactor =
      sMonthlyRate > 0
        ? ((Math.pow(1 + sMonthlyRate, totalMonths) - 1) / sMonthlyRate) * (1 + sMonthlyRate)
        : totalMonths;
    const sSip = sGap > 0 && sFactor > 0 ? Math.round(sGap / sFactor) : 0;
    const sInvested = sSip * totalMonths;
    const sGains = Math.max(0, futureCost - (safeSavings + sInvested));

    return {
      label,
      returnRate: scenarioRate,
      monthlySip: sSip,
      totalSipInvested: sInvested,
      estimatedGains: sGains,
      differenceVsBase: sSip - requiredMonthlySip,
    };
  };

  const whatIfScenarios: GoalPlannerWhatIfScenario[] = [
    calcScenario(safeReturn - 2, "Conservative (-2%)"),
    {
      label: "Baseline (Expected)",
      returnRate: safeReturn,
      monthlySip: requiredMonthlySip,
      totalSipInvested,
      estimatedGains,
      differenceVsBase: 0,
    },
    calcScenario(safeReturn + 2, "Optimistic (+2%)"),
  ];

  return {
    currentCost: safeCost,
    years: safeYears,
    inflationRate: safeInflation,
    annualReturn: safeReturn,
    existingSavings: safeSavings,
    futureCost,
    existingSavingsFV,
    remainingTarget,
    requiredMonthlySip,
    totalSipInvested,
    totalCapitalInvested,
    estimatedGains,
    schedule,
    whatIfScenarios,
  };
}

// Mutual Fund Tax Estimator Interfaces & Helper
export type MutualFundTaxCategory =
  | "equity"
  | "debt-post-2023"
  | "other-holding-period";

export interface TaxAssumptions {
  equityStcgRate: number; // default 20%
  equityLtcgRate: number; // default 12.5%
  equityLtcgExemption: number; // default 125000
  cessRate: number; // default 4%
  otherHoldingThresholdMonths: number; // default 24
  otherLtcgRate: number; // default 12.5%
}

export interface TaxCalculationResult {
  purchaseAmount: number;
  saleAmount: number;
  purchaseDate: string;
  saleDate: string;
  holdingDays: number;
  holdingMonths: number;
  holdingYears: number;
  holdingClassification: string;
  isLtcg: boolean;
  isLoss: boolean;
  gain: number;
  availableExemptionBefore: number;
  exemptAmountUsed: number;
  taxableGain: number;
  applicableRatePercent: number;
  baseTax: number;
  cessAmount: number;
  totalTax: number;
  effectiveTaxRate: number;
  netProceeds: number;
}

export function calculateMutualFundTax(
  fundCategory: MutualFundTaxCategory,
  purchaseAmount: number,
  saleAmount: number,
  purchaseDate: string,
  saleDate: string,
  otherLtcgBooked: number = 0,
  slabRate: number = 30,
  assumptions: TaxAssumptions = {
    equityStcgRate: 20,
    equityLtcgRate: 12.5,
    equityLtcgExemption: 125000,
    cessRate: 4,
    otherHoldingThresholdMonths: 24,
    otherLtcgRate: 12.5,
  }
): TaxCalculationResult {
  const safePurchase = Math.max(0, purchaseAmount);
  const safeSale = Math.max(0, saleAmount);
  const safeOtherLtcg = Math.max(0, otherLtcgBooked);
  const safeSlabRate = Math.max(0, Math.min(42.74, slabRate));

  const pDate = new Date(purchaseDate);
  const sDate = new Date(saleDate);

  let holdingDays = 0;
  let holdingMonths = 0;
  let holdingYears = 0;

  if (!isNaN(pDate.getTime()) && !isNaN(sDate.getTime()) && sDate >= pDate) {
    const diffMs = sDate.getTime() - pDate.getTime();
    holdingDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    holdingMonths = (sDate.getFullYear() - pDate.getFullYear()) * 12 + (sDate.getMonth() - pDate.getMonth());
    if (sDate.getDate() < pDate.getDate()) {
      holdingMonths = Math.max(0, holdingMonths - 1);
    }
    holdingYears = Number((holdingDays / 365.25).toFixed(1));
  }

  const gain = safeSale - safePurchase;
  const isLoss = gain < 0;

  let isLtcg = false;
  let holdingClassification = "";
  let applicableRatePercent = 0;

  if (fundCategory === "equity") {
    // Equity: > 12 months (or > 365 days) is LTCG
    isLtcg = holdingDays > 365 || holdingMonths >= 12;
    if (isLtcg) {
      holdingClassification = `Long-Term Capital Asset (${holdingMonths} Months / ${holdingDays} Days > 12 Months)`;
      applicableRatePercent = assumptions.equityLtcgRate;
    } else {
      holdingClassification = `Short-Term Capital Asset (${holdingMonths} Months / ${holdingDays} Days ≤ 12 Months)`;
      applicableRatePercent = assumptions.equityStcgRate;
    }
  } else if (fundCategory === "debt-post-2023") {
    // Specified mutual funds / debt bought on or after 1 Apr 2023:
    // Deemed short-term capital asset irrespective of holding period (taxed at slab rate)
    isLtcg = false;
    holdingClassification = `Deemed Short-Term (Bought on or after 1 Apr 2023, taxed at income slab)`;
    applicableRatePercent = safeSlabRate;
  } else {
    // Other funds with holding period rule (e.g. 24 months / 36 months)
    const threshold = Math.max(1, assumptions.otherHoldingThresholdMonths);
    const thresholdDays = Math.round(threshold * 30.416);
    isLtcg = holdingMonths >= threshold || holdingDays >= thresholdDays;
    if (isLtcg) {
      holdingClassification = `Long-Term Capital Asset (${holdingMonths} Months / ${holdingDays} Days ≥ ${threshold} Months)`;
      applicableRatePercent = assumptions.otherLtcgRate;
    } else {
      holdingClassification = `Short-Term Capital Asset (${holdingMonths} Months / ${holdingDays} Days < ${threshold} Months, taxed at slab)`;
      applicableRatePercent = safeSlabRate;
    }
  }

  let availableExemptionBefore = 0;
  let exemptAmountUsed = 0;
  let taxableGain = 0;
  let baseTax = 0;

  if (isLoss) {
    taxableGain = 0;
    exemptAmountUsed = 0;
    baseTax = 0;
  } else {
    if (fundCategory === "equity" && isLtcg) {
      availableExemptionBefore = Math.max(0, assumptions.equityLtcgExemption - safeOtherLtcg);
      exemptAmountUsed = Math.min(gain, availableExemptionBefore);
      taxableGain = Math.max(0, gain - exemptAmountUsed);
      baseTax = taxableGain * (assumptions.equityLtcgRate / 100);
    } else if (fundCategory === "equity" && !isLtcg) {
      exemptAmountUsed = 0;
      taxableGain = gain;
      baseTax = taxableGain * (assumptions.equityStcgRate / 100);
    } else if (fundCategory === "debt-post-2023") {
      exemptAmountUsed = 0;
      taxableGain = gain;
      baseTax = taxableGain * (safeSlabRate / 100);
    } else {
      // Other holding period
      exemptAmountUsed = 0;
      taxableGain = gain;
      if (isLtcg) {
        baseTax = taxableGain * (assumptions.otherLtcgRate / 100);
      } else {
        baseTax = taxableGain * (safeSlabRate / 100);
      }
    }
  }

  const cessAmount = baseTax * (assumptions.cessRate / 100);
  const totalTax = Math.round(baseTax + cessAmount);
  const effectiveTaxRate = gain > 0 ? (totalTax / gain) * 100 : 0;
  const netProceeds = safeSale - totalTax;

  return {
    purchaseAmount: safePurchase,
    saleAmount: safeSale,
    purchaseDate,
    saleDate,
    holdingDays,
    holdingMonths,
    holdingYears,
    holdingClassification,
    isLtcg,
    isLoss,
    gain,
    availableExemptionBefore,
    exemptAmountUsed,
    taxableGain,
    applicableRatePercent,
    baseTax,
    cessAmount,
    totalTax,
    effectiveTaxRate,
    netProceeds,
  };
}
