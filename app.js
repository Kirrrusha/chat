const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jwt-simple');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const config = require('./config/config');
const routerUser = require('./routes/user')

const PORT = process.env.PORT || 3000;
mongoose.Promise = global.Promise;

async function start() {
  try {
    // const url = 'mongodb+srv://kirrrusha:K14Eh1LQL@cluster0-frxpn.mongodb.net/test?retryWrites=true&w=majority';
    const url = 'mongodb://localhost:27017';
    await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}. Use our API`);
    })
  } catch (e) {
    console.log(e);
  }
}

start();

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


app.use('/api/', routerUser);

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
  res
    .status(500)
    .json({err: '500'});
})

