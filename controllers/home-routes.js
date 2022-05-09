const router = require('express').Router();
const {
  Post,
  Comment,
  User
} = require('../models');

const serialize = require('../utils/serialize');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
  const postData = await Post.findAll({
      include: [User]
    }

  ).catch((err) => {
    res.json(err);
  });
  const posts = serialize(postData);
  res.render('homepage', {
    loggedIn: req.session.loggedIn,
    posts
  });
});


router.get('/posts', withAuth, async (req, res) => {
  const postData = await Post.findAll({
    include: [User]
  }).catch((err) => {
    res.json(err);
  });

  const posts = serialize(postData);

  res.render('post', {
    loggedIn: req.session.loggedIn,
    posts
  });
});


router.get('/posts/:id', withAuth, async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [User, {
        model: Comment,
        include: [User]
      }]
    });
    if (!postData) {
      res.status(404).json({
        message: 'There is no post with this ID'
      });
      return;
    };
    const posts = serialize(postData);
    if (req.session.loggedIn) {
      res.render('post-comment',
        posts
      );
    };
  } catch (err) {
    res.status(500).json(err);
  };
});



router.post('/newcomment', async (req, res) => {
  try {
    const commentData = await Comment.create({...req.body, user_id:req.session.userId});

    req.session.save(() => {
      req.session.loggedIn = true;

    });

    if (!commentData) {
      res.status(404).json({
        message: 'Your comment was not created.'
      });
      return;
    }

    res.status(200).json(commentData);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.get('/login', async (req, res) => {
  try {
    if (req.session.loggedIn) {
      res.redirect('/');
      return;
    }
    res.render('login');
  } catch (err) {
    console.log(err);
  }
});


router.post('/newpost', async (req, res) => {
  if(!req.session.loggedIn){
    res.status(403).json({
      message: 'You must login to create a post'
    })
  }
  try {
    const postData = await Post.create({...req.body, user_id:req.session.userId} )
    if (!postData) {
      res.status(404).json({
        message: 'Your post was not created.'
      });
      return;
    }
    res.status(200).json(postData);
  } catch (err) {
    res.status(400).json(err);
  }
});




module.exports = router;
