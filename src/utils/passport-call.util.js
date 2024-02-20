const passport = require("passport");

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
      console.error(error);
      res
        .status(500)
        .send({ error: "An error occurred during authentication." });
    }
  };
};

module.exports = passportCall;
