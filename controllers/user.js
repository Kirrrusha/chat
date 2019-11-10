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
const fs = require('fs');

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
      newUser.surname = req.body.surname;
      newUser.name = req.body.name;
      newUser.patronymic = req.body.patronymic;
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

      res.json({
        id: user._id,
        username: user.login,
        password: user.hash,
        surname: user.surname,
        name: user.name,
        patronymic: user.patronymic,
        token: createToken(payload)
      });
    });
  })(req, res, next);
};
module.exports.updateUser = (req, res, next) => {
  UserModel.updateOne({_id: req.params.id}, {email: req.body.email}, {upsert: true}, (err) => {
    if (!err) {
      return res
        .json({
          ...req.body
        });
    } else {
      next(err);
    }
  });
};
module.exports.deleteUser = (req, res, next) => {
  UserModel.remove({_id: req.params.id}, (err) => {
    if (!err) {
      return res
        .json({
          message: 'remove user'
        });
    } else {
      next(err);
    }
  });
};
module.exports.saveUserImage = (req, res, next) => {
  UserModel.findOne({_id: req.params.id})
    .then(user => {
      if (user.img === './images/default.png') {
        updateImage(req, user);
      } else {
        fs.unlink(`${user.img}`, (err) => {
          if (err)
            next(err);
          updateImage(req, user);
        });
      }
    });
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

const createToken = (payload) => jwt.encode(payload, config.secret);

const updateImage = (req, user) => {
  user.img = `./images/${req.files.userImage.name}`;
  let image = req.files.userImage;
  image.mv('./images/' + image.name);
  user.save()
    .then(newUser => {
      return res
        .json({path: `${newUser.img}`});
    });
};

