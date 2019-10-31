const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bCrypt = require('bcrypt');

const UserSchema = new Schema({
  login: {
    type: String,
    required: [true, 'Enter login']
  },
  email: {
    type: String
  },
  hash: String
});

UserSchema.methods.setPassword = (password) => {
  this.hash = bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

UserSchema.methods.validPassword = function(password) {
  return bCrypt.compareSync(password, this.hash)
};

mongoose.model('login', UserSchema);
