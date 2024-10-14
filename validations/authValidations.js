const validateRegistration = (data) => {
  const errors = [];
  if (!data.fullname) {
    errors.push("Full Name is required");
  }
  if (!data.username) {
    errors.push("Username is required");
  } else if (data.username.length < 3 || data.username.length > 30) {
    errors.push("Username must be between 3 and 30 characters long");
  }
  if (!data.email) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Email is not valid");
    }
  }
  if (!data.password) {
    errors.push("Password is required");
  } else if (data.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? errors.join(", ") : null,
  };
};


module.exports = { validateRegistration };
