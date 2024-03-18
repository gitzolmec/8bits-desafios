const passport = require("passport");
const local = require("passport-local");
const GithubStrategy = require("passport-github2");
const jwt = require("passport-jwt");
const { tokenSecret } = require("./token.config");
const { ghClientSecret, ghClientId } = require("./github.config");
const Users = require("../models/users.model");
const CartDao = require("../DAO/Mongo/cart-dao.mongo");
const carts = new CartDao();
const {
  createHash,
  useValidPassword,
} = require("../utils/crypt.password.util");
const { generateToken } = require("../utils/jwt.util");

const cookieExtractor = require("../utils/cookie-extractor.util");
const calculateAge = require("../middlewares/calculateAge.middleware");
const generateUserErrorInfo = require("../handlers/errors/generate-error-info");
const EErrors = require("../handlers/errors/enum.error");
const CustomError = require("../handlers/errors/custom.error");
const TYPES_ERRORS = require("../handlers/errors/user-error-types");

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          const { first_name, last_name, email, age } = req.body;

          if (!first_name || !last_name || !email || !age) {
            CustomError.createError({
              name: TYPES_ERRORS.USER_CREATION_ERROR,
              cause: generateUserErrorInfo({
                first_name,
                last_name,
                email,
                age,
              }),
              message: "Error trying to create User",
              code: EErrors.INVALID_USER_INFO,
            });
          }
          const user = await Users.findOne({ email: username });
          if (user) {
            console.log("User exists");
            return done(null, false);
          }
          const userAge = calculateAge(age);
          const cart = await carts.addCart();
          const cartId = cart._id;
          const newUserInfo = {
            first_name,
            last_name,
            age: userAge,
            email,
            password: createHash(password),
            cartId,
          };
          console.log(newUserInfo);
          const newUser = await Users.create(newUserInfo);

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const usuario = await Users.findOne({ email: username });

          if (!usuario) {
            console.log("Usuario no existe");
            return done(null, false);
          }

          if (!useValidPassword(usuario, password)) {
            return done(null, false);
          }

          return done(null, usuario);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: ghClientId,
        clientSecret: ghClientSecret,
        callbackURL: "http://localhost:8080/api/auth/githubcallback",
      },
      async (accessToken, RefreshToken, profile, done) => {
        try {
          const { id, login, name, email } = profile._json;
          const completeName = name.split(" ");
          const user = await Users.findOne({ email: email });
          const cart = await carts.addCart();
          const cartId = cart._id;
          if (!user) {
            const newUserInfo = {
              first_name: completeName[0],
              last_name: completeName[1],
              email: email,
              githubId: id,
              githubUsername: login,
              cartId: cartId,
            };

            const newUser = await Users.create(newUserInfo);
            return done(null, newUser);
          }

          return done(null, user);
        } catch (error) {
          console.log(error);
          done(error);
        }
      }
    )
  );

  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: jwt.ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: tokenSecret,
      },
      (jwt_payload, done) => {
        try {
          done(null, jwt_payload);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = Users.findById(id);
    done(null, user);
  });
};

module.exports = initializePassport;
