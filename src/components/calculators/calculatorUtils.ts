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
