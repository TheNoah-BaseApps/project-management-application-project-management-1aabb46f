export function calculateVariance(estimated, actual) {
  const estimatedNum = parseFloat(estimated) || 0;
  const actualNum = parseFloat(actual) || 0;
  return actualNum - estimatedNum;
}

export function calculateForecastRemaining(estimated, actual) {
  const estimatedNum = parseFloat(estimated) || 0;
  const actualNum = parseFloat(actual) || 0;
  return Math.max(estimatedNum - actualNum, 0);
}

export function calculateContingency(estimated, percentage) {
  const estimatedNum = parseFloat(estimated) || 0;
  const percentageNum = parseFloat(percentage) || 0;
  return (estimatedNum * percentageNum) / 100;
}

export function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatPercentage(value) {
  const num = parseFloat(value) || 0;
  return `${num.toFixed(2)}%`;
}

export function calculateBudgetStatus(estimated, actual) {
  const variance = calculateVariance(estimated, actual);
  const variancePercentage = (variance / parseFloat(estimated)) * 100;

  if (variancePercentage > 10) {
    return 'over_budget';
  } else if (variancePercentage < -10) {
    return 'under_budget';
  } else {
    return 'on_track';
  }
}

export function calculateProjectProgress(budgetItems) {
  if (!budgetItems || budgetItems.length === 0) return 0;

  const totalEstimated = budgetItems.reduce((sum, item) => sum + parseFloat(item.estimated_cost || 0), 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + parseFloat(item.actual_cost || 0), 0);

  if (totalEstimated === 0) return 0;

  return Math.min((totalActual / totalEstimated) * 100, 100);
}