const router = require('express').Router();
const {
  Post,
  Comment,
  User
} = require('../models');

const serialize = require('../utils/serialize');
const withAuth = require('../utils/auth');

router.get("/", withAuth, async (req, res) => {
  try {
    const postData = await Post.findAll({
      where: {
        user_id: req.session.userId
      }, 
      include: [User, Comment]
    });
    const posts = serialize(postData);

    res.render('dashboard', {
      loggedIn: req.session.loggedIn,
      posts
    });
  } catch (err) {
    console.log(err);
  }
})

module.exports = router;