const jwt = require("jsonwebtoken");
const { tokenSecret } = require("../configs/token.config");

const generateToken = (user) => {
  return jwt.sign(user, tokenSecret, { expiresIn: "20m" });
};

const authToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ status: "error", error: "Unauthorized" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, tokenSecret, (error, credentials) => {
    console.log(error);
    if (error)
      return res.status(401).json({ status: "error", error: "Unauthorized" });

    req.user = credentials.user;

    next();
  });
};

module.exports = {
  generateToken,
  authToken,
};
