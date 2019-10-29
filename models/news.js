let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let NewsSchema = new Schema({
  theme: {
    type: String,
    required: [
      true, 'Enter news topic'
    ],
  },
  text: {
    type: String,
    required: [
      true, 'Enter news text'
    ],
  },
  createdAt: Date,
  date: Date,
  updatedAt: Date,
  id: Number,
  userId: Number,
  user: Object
});

NewsSchema.methods.setUser = (user) => this.user = user;

const News = mongoose.model('news', NewsSchema);

module.exports = News;
