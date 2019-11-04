const mongoose = require('mongoose');
const bCrypt = require('bcrypt');
const passport = require('passport');
const uuidv4 = require('uuid/v4');
const User = require('../models/user');
const UserModel = mongoose.model('login');
// const loginToken = require('../models/loginToken');
// const User = mongoose.model('login');
// const loginToken = mongoose.model('loginToken');
const setCookie = require('../lib/setcookie');
const jwt = require('jwt-simple');
const config = require('../config/config');

module.exports.saveNewUser = (req, res, next) => {
  passport.authenticate('loginUsers', (err, user) => {
    if (user) {
      res
        .json({message: 'User with this login already exists.'});
      next();
    } else {
      const newUser = new UserModel();
      newUser.login = req.body.username;
      newUser.hash = createHash(req.body.password);
      newUser.email = req.body.email;
      newUser
        .save()
        .then(user => {
          req.logIn(user, function (err) {
            if (err) {
              return next(err);
            }
            res
              .json({message: `User ${user.login} created`});
          });
        })
        .catch(next);
    }
  })(req, res, next);
};

module.exports.login = (req, res, next) => {
  passport.authenticate('loginUsers', (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.json({message: 'Specify the correct username and password'});
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const payload = {
        id: user.id
      };
      const token = jwt.encode(payload, config.secret);
      res.json({
        username: user.login,
        password: user.hash,
        token: token
      });

    });
  })(req, res, next);
};
module.exports.updateUser = (req, res) => {
};
module.exports.deleteUser = (req, res) => {
};
module.exports.saveUserImage = (req, res) => {
};
module.exports.getUsers = (req, res) => {
};
module.exports.updateUserPermission = (req, res) => {
};
module.exports.authFromToken = (req, res, next) => {
  passport.authenticate('loginUsers', (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json({status: 'Укажите правильный логин и пароль!'});
    }
    req
      .logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        const payload = {
          id: user.id
        };
        res.json({token: `${createToken(payload)}`});
      });
  })(req, res, next);
};
module.exports.logOut = (req, res) => {
  req.logout();
  res.clearCookie('logintoken');
  res.json({message: 'out'});
};

const createHash = (password) => bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);

const createToken = (payload) => jwt.encode(payload, config.secret)

