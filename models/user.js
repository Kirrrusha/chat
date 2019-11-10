const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bCrypt = require('bcrypt');

const UserSchema = new Schema({
  login: {
    type: String,
    required: [true, 'Enter login']
  },
  email: {
    type: String,
    required: [true, 'Enter email']
  },
  hash: {
    type: String,
    required: [true, 'Enter password']
  },
  surname: String,
  name: String,
  patronymic: String,
  img: {
    type: String,
    default: './images/default.png'
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

UserSchema.methods.setPassword = (password) => {
  this.hash = bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

UserSchema.methods.validPassword = function (password) {
  return bCrypt.compareSync(password, this.hash);
};

const login = mongoose.model('login', UserSchema);

module.exports = ({
  login
});
