const { Router } = require("express");

const router = Router();

router.get("/login", (req, res) => {
  res.render("login.handlebars");
});

router.get("/signup", (req, res) => {
  res.render("signup.handlebars");
});

router.get("/error-401", (req, res) => {
  console.log("Error 401");
  res.render("unauthorized-page.handlebars");
});

router.get("/loggerTest", (req, res) => {
  req.logger.info("Esto es un mensaje de tipo info");
  req.logger.error("Esto es un mensaje de tipo error");
  req.logger.warning("Esto es un mensaje de tipo warning");
  req.logger.debug("Esto es un mensaje de tipo debug");
  req.logger.fatal("Esto es un mensaje de tipo fatal");
  req.logger.http("Esto es un mensaje de tipo http");

  res.json({ message: "Testeo del logger finalizado" });
});

module.exports = router;
