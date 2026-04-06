/**
 * Validates email format
 */
export const validateEmail = (email) => {
  if (!email) return { valid: false, error: 'Email is required' };
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: regex.test(email),
    error: regex.test(email) ? null : 'Invalid email format'
  };
};

/**
 * Validates password and determines strength
 */
export const validatePassword = (password) => {
  if (!password) return { valid: false, error: 'Password is required', strength: 'weak' };
  if (password.length < 6) return { valid: false, error: 'At least 6 characters', strength: 'weak' };
  
  let score = 0;
  if (password.length > 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  let strength = 'weak';
  if (score >= 3) strength = 'strong';
  else if (score >= 1) strength = 'fair';

  return { valid: true, error: null, strength };
};

/**
 * Validates Indian phone number format (10 digits)
 */
export const validatePhone = (phone) => {
  if (!phone) return { valid: false, error: 'Phone number is required' };
  const regex = /^[6-9]\d{9}$/;  // Indian mobile context
  return {
    valid: regex.test(phone),
    error: regex.test(phone) ? null : 'Invalid 10-digit phone number'
  };
};

/**
 * Validates patient age (range 1-120)
 */
export const validateAge = (age) => {
  const years = parseInt(age);
  if (isNaN(years)) return { valid: false, error: 'Age must be a number' };
  if (years < 1 || years > 120) return { valid: false, error: 'Age must be between 1 and 120' };
  return { valid: true, error: null };
};

/**
 * Validates 6-digit OTP code
 */
export const validateOTP = (otp) => {
  if (!otp) return { valid: false, error: 'OTP is required' };
  const regex = /^\d{6}$/;
  return {
    valid: regex.test(otp),
    error: regex.test(otp) ? null : 'OTP must be 6 digits'
  };
};
