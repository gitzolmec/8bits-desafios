function validarAmbiente(winstonUser) {
  winstonUser = winstonUser.trim();
  switch (winstonUser) {
    case "dev":
      return require("./logger");

    case "prod":
      return require("./prodLogger");
  }
}

module.exports = { validarAmbiente };
