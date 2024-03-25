const passport = require("passport");
const { logger } = require("../middlewares/logger.middleware");

const passportCall = (strategy) => {
  return (req, res, next) => {
    try {
      passport.authenticate(strategy, function (error, user, info) {
        if (error) return next(error);

        if (!user) return res.status(401).redirect("/api/login");

        req.user = user;
        next();
      })(req, res, next);
    } catch (error) {
      logger.error("error al realizar autenticacion");
      res.send({ error: "An error occurred during authentication." });
    }
  };
};

module.exports = passportCall;
