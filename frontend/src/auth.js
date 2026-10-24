// Demo-only accounts, kept in memory (lost on refresh). NOT real security.
const accounts = {};

function cleanEmail(email) {
  return email.trim().toLowerCase();
}

// Create an account. Throws an Error with a friendly message if something is wrong.
export function signUp(email, password) {
  const key = cleanEmail(email);
  if (!/^[^\s@]+@gmail\.com$/.test(key)) throw new Error("Please use a Gmail address (name@gmail.com).");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (accounts[key]) throw new Error("This email already has an account. Please log in.");
  accounts[key] = password;
  return key;
}

// Check email and password. Returns the email if they match.
export function logIn(email, password) {
  const key = cleanEmail(email);
  if (accounts[key] === undefined || accounts[key] !== password) {
    throw new Error("Wrong email or password. If you refreshed the page, sign up again.");
  }
  return key;
}