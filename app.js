const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jwt-simple");
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const config = require('./config/config');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://kirrrusha:K14Eh1LQL@cluster0-frxpn.mongodb.net/test?retryWrites=true&w=majority/chat', {useMongoClient: true});
require('./models/user');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: 'secret',
  key: 'keys',
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: null
  },
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

require('./config/config-passport');
app.use(passport.initialize({userProperty: 'payload'}));
app.use(passport.session());

app.post('/token', function (req, res, next) {
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
        const token = jwt.encode(payload, config.secret); // line 10 passport-config
        res.json({token: token});
      });
  })(req, res, next);
});


// app.use((req, res, next) => {
//   if (cluster.isWorker) {
//     console.log(`ID: ${cluster.worker.id}`)
//   }
//   next();
// });


app.use((req, res, next) => {
  res
    .status(404)
    .json({err: '404'});
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res
    .status(500)
    .json({err: '500'});
})

app.listen(3000, function () {
  console.log('Server running. Use our API');
})
