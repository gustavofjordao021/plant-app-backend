const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const uploadCloud = require("../configs/cloudinary-setup");

const router = express.Router();
const User = require("../models/User.model");

const bcryptjs = require("bcryptjs");
const saltRounds = 10;

router.post("/signup", (req, res, next) => {
  const { username, email, password, avatar } = req.body;
  if (!username || !email || !password) {
    res.status(401).json({
      errorMessage:
        "All fields are mandatory. Please provide your username, email and password.",
    });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  if (!regex.test(password)) {
    res.json({
      errorMessage:
        "Password needs to have at least 8 characters, and must contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      if (!avatar) {
        return User.create({
          provider: "local",
          username,
          email,
          passwordHash: hashedPassword,
        })
          .then((user) => {
            req.login(user, (err) => {
              if (err)
                return res.json({
                  errorMessage: "Something went wrong with login!",
                });
              user.passwordHash = undefined;
              res.json({ user });
            });
          })
          .catch((err) => {
            if (err instanceof mongoose.Error.ValidationError) {
              res.json({ errorMessage: "test error" });
            } else if (err.code === 11000) {
              res.json({
                errorMessage:
                  "Email needs to be unique. This e-mail is already in use.",
              });
            } else {
              next(err);
            }
          });
      }
      return User.create({
        provider: "local",
        username,
        email,
        avatar,
        passwordHash: hashedPassword,
      })
        .then((user) => {
          req.login(user, (err) => {
            if (err)
              return res.json({
                errorMessage: "Something went wrong with login!",
              });
            user.passwordHash = undefined;
            res.json({ user });
          });
        })
        .catch((err) => {
          if (err instanceof mongoose.Error.ValidationError) {
            res.json({ errorMessage: "test error" });
          } else if (err.code === 11000) {
            res.json({
              errorMessage:
                "Username and email need to be unique. Either username or email is already used.",
            });
          } else {
            next(err);
          }
        });
    })
    .catch((err) => next(err));
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, failureDetails) => {
    if (err) {
      res
        .status(200)
        .json({ errorMessage: "Something went wrong with database query" });
    } else if (!user) {
      res.status(200).json({ errorMessage: failureDetails.message });
    } else {
      req.login(user, (err) => {
        if (err) {
          return res.json({ errorMessage: "Something went wrong with login!" });
        }
        user.passwordHash = undefined;
        res.status(200).json({ successMessage: "Login Successful!", user });
      });
    }
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout();
  res.status(200).json({ message: "Logout successful!" });
});

router.get("/isLoggedIn", (req, res) => {
  if (req.user) {
    User.findById(req.user._id)
      .populate({
        path: "collections",
        model: "Collection",
      })
      .then((userFound) => {
        userFound.passwordHash = undefined;
        res.json({ user: userFound });
        return;
      })
      .catch((err) => res.json({ errorMessage: "Unauthorized access!" }));
  } else {
    res.status(403).json({ errorMessage: "Unauthorized access!" });
  }
});

router.post("/avatar-upload", uploadCloud.single("avatar"), (req, res) => {
  if (!req.file) {
    res.status(500).json({ errorMessage: "There's no file to be uploaded!" });
  } else {
    res.status(200).json({ secure_url: req.file.secure_url });
  }
});

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/success/facebook",
  passport.authenticate("facebook", {
    failureRedirect: "/auth/login",
    failureFlash: "Invalid Facebook credentials.",
    successRedirect: "https://plant-app-test.herokuapp.com/signup",
  }),
  (req, res, next) => {
    res.redirect("https://plant-app-test.herokuapp.com/signup");
  }
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  })
);

router.get(
  "/success/google",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    failureFlash: "Invalid Google credentials.",
  }),
  (req, res, next) => {
    res.redirect("https://plant-app-test.herokuapp.com/signup");
  }
);

module.exports = router;
