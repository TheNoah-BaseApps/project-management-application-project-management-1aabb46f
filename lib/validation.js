export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
}

export function validateFiscalPeriod(period) {
  // Validate format like Q1-2024 or FY2024
  const fiscalRegex = /^(Q[1-4]-\d{4}|FY\d{4})$/;
  return fiscalRegex.test(period);
}

export function validateCurrency(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}

export function validatePercentage(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 100;
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}