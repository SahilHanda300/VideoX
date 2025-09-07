export const validateLoginForm = ({ email, password }) => {
  const isEmailValid = validateMail(email);
  const isPasswordValid = validatePassword(password);
  return isEmailValid && isPasswordValid;
};

export const validateRegisterForm = ({ email, password, username }) => {
  const isEmailValid = validateMail(email);
  const isPasswordValid = validatePassword(password);
  const isUsernameValid = validateUsername(username);
  return isEmailValid && isPasswordValid && isUsernameValid;
};

const validatePassword = (password) => {
  return password.length >= 6 && password.length <= 12;
};

const validateUsername = (username) => {
  return username.length >= 3 && username.length <= 15;
};

const validateMail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailRegex.test(email);
};
