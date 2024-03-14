const adminValidation = (role) => {
  let adminValidation = "";
  if (role == "admin") {
    adminValidation = "admin";
  }
  return adminValidation;
};

module.exports = adminValidation;
