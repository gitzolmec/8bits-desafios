const passport = require("passport");
const local = require("passport-local");
const GithubStrategy = require("passport-github2");
const Users = require("../models/users.model");
const {
  createHash,
  useValidPassword,
} = require("../utils/crypt.password.util");

const LocalStrategy = local.Strategy;
const ghClientId = "Iv1.fabcb3c8fd6a1a21";
const ghClientSecret = "e427c10b811a57fa8346169df416fd6cfc24dd6f";

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          const { first_name, last_name, email } = req.body;
          const user = await Users.findOne({ email: username });
          if (user) {
            console.log("User exists");
            return done(null, false);
          }

          const newUserInfo = {
            first_name,
            last_name,
            email,
            password: createHash(password),
          };

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
          console.log(profile);

          const { id, login, name, email } = profile._json;
          const completeName = name.split(" ");
          const user = await Users.findOne({ email: email });
          if (!user) {
            const newUserInfo = {
              first_name: completeName[0],
              last_name: completeName[1],
              email: email,
              githubId: id,
              githubUsername: login,
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

  passport.serializeUser((user, done) => {
    console.log(user);
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = Users.findById(id);
    done(null, user);
  });
};

module.exports = initializePassport;
