const mongoose = require('mongoose');
const bCrypt = require('bcrypt-nodejs');const passport = require('passport');
const uuidv4 = require('uuid/v4');
const User = require('../models/user');
const loginToken = require('../models/loginToken');
// const User = mongoose.model('login');
// const loginToken = mongoose.model('loginToken');
const setCookie = require('../lib/setcookie');
const jwt = require('jwt-simple');

module.exports.saveNewUser = (req, res) => {
  User.findOne({ login: req.body.username })
    .then(user => {
      if (user) {
        res.json({message: 'User with this login already exists.'});
      } else {
        const newUser = new User();
        newUser.login = req.body.username;
        newUser.password = createHash(req.body.password);
        newUser.email = req.body.email;
        newUser.name = req.body.name;
        newUser
          .save()
          .then(user => {
            req.logIn(user, function(err) {
              if (err) {
                return next(err);
              }
              res.json({message: `User ${req.body.username} created`});
            });
          })
          .catch(next);
      }
    })
};

module.exports.login = (req, res) => {
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
      if (req.body.remember) {
        let data = {};
        data.series = uuidv4();
        data.token = uuidv4();
        data.login = user.login;
        let recordDb = new loginToken(data);
        loginToken
          .remove({ login: user.login })
          .then(user => {
            recordDb
              .save()
              .then(user => {
                setCookie(res, {series: user.series, token: user.token, login: user.login});
                res.json({user});
              })
              .catch(next);
          })
          .catch(next);
      } else {
        res.json({user});
      }
    });
  })(req, res, next);
};
module.exports.updateUser = (req, res) => {};
module.exports.deleteUser = (req, res) => {};
module.exports.saveUserImage = (req, res) => {};
module.exports.getUsers = (req, res) => {};
module.exports.updateUserPermission = (req, res) => {};
module.exports.authFromToken = (req, res) => {
  passport.authenticate('loginUsers', (err, user) => {
    console.log(err)
    console.log(user)
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
        const token = jwt.encode(payload, config.secret); // line 10 passport-config
        res.json({token: token});
      });
  })(req, res, next);
};
module.exports.logOut = (req, res) => {
  req.logout();
  res.clearCookie('logintoken');
  res.json({message: 'out'});
};

const createHash = (password) => bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);

