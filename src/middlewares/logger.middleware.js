const { validarAmbiente } = require("../utils/winston/factory.winston");
const { winstonUser } = require("../configs/winston.config");

const winstonLogger = (req, res, next) => {
  const logger = validarAmbiente(winstonUser);

  req.logger = logger;
  // req.logger.http(
  //   `METHOD: ${req.method} / URL: ${req.url} / USER-AGENT: ${
  //     req.headers["user-agent"]
  //   } - ${new Date().toUTCString()}`
  // );
  next();
};

const logger = validarAmbiente(winstonUser);

module.exports = { winstonLogger, logger };
