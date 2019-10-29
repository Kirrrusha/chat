const express = require('express');
const router = express.Router();
const ctrlNews = require('../controllers/news');
const passport = require('passport');

let auth = passport.authenticate('jwt', {
  session: false
});

router.get('/api/getNews', auth, ctrlNews.getNews);

router.post('/api/newNews', auth, ctrlNews.newNews);

router.put('/api/updateNews/:id', auth, ctrlNews.updateNews);

router.delete('/api/deleteNews/:id', auth, ctrlNews.deleteNews);

module.exports = router;
