const asNumber = value => Number.isFinite(Number(value)) ? Number(value) : 0;

export function calculateQuote(input) {
  const currency = String(input.currency || 'USD').toUpperCase();
  const weightMt = asNumber(input.weightMt);
  const materialPerMt = asNumber(input.materialPerMt);
  const processingPerMt = asNumber(input.processingPerMt);
  const freightPerMt = asNumber(input.freightPerMt);
  const packagingTotal = asNumber(input.packagingTotal);
  const fixedFees = asNumber(input.fixedFees);
  const financeRate = asNumber(input.financeRate) / 100;
  const riskRate = asNumber(input.riskRate) / 100;
  const marginRate = asNumber(input.marginRate) / 100;
  const enteredFxRate = asNumber(input.fxRate);
  const fxRate = currency === 'CNY' ? 1 : enteredFxRate;

  const material = weightMt * materialPerMt;
  const processing = weightMt * processingPerMt;
  const freight = weightMt * freightPerMt;
  const directCost = material + processing + freight + packagingTotal + fixedFees;
  const finance = directCost * financeRate;
  const risk = directCost * riskRate;
  const costBeforeMargin = directCost + finance + risk;
  const quoteTotal = marginRate >= 1 ? costBeforeMargin : costBeforeMargin / (1 - marginRate);
  const grossProfit = quoteTotal - costBeforeMargin;

  return {
    material,
    processing,
    freight,
    directCost,
    finance,
    risk,
    costBeforeMargin,
    quoteTotal,
    quotePerMt: weightMt ? quoteTotal / weightMt : 0,
    grossProfit,
    grossMargin: quoteTotal ? grossProfit / quoteTotal : 0,
    currency,
    fxRate,
    localCurrencyTotal: quoteTotal * fxRate
  };
}
