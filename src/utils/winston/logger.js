const winston = require("winston");
const { format } = require("winston");
const customWinston = require("./custom.winston");

winston.addColors(customWinston.colors);
const loggerFormat = format.combine(
  winston.format.colorize({ all: true }),
  winston.format.simple()
);

const winstonLogger = winston.createLogger({
  levels: customWinston.levels,
  format: loggerFormat,
  transports: [
    new winston.transports.Console({
      level: "debug",
    }),
  ],
});

module.exports = winstonLogger;
