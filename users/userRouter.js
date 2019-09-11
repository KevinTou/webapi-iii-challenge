const express = require('express');

const router = express.Router();

const Users = require('./userDb');
const Posts = require('../posts/postDb');

router.use(express.json());

router.post('/', validateUser, (req, res) => {
  const { name } = req.body;

  Users.insert({ name })
    .then(newUser => {
      res.status(201).json(newUser);
    })
    .catch(err => {
      console.log('posting a new user: ', err);
      res
        .status(500)
        .json({ error: 'Error occurred while adding a new user.' });
    });
});

router.post('/:id/posts', validateUserId, validatePost, (req, res) => {
  const { id } = req.params;
  const newPost = req.body;
  newPost.user_id = id;

  Posts.insert(newPost)
    .then(post => {
      res.status(201).json(post);
    })
    .catch(err => {
      res.status(500).json({ error: 'Error occurred while adding new post.' });
    });
});

router.get('/', (req, res) => {
  Users.get()
    .then(users => {
      console.log('users: ', users);
      res.status(200).json(users);
    })
    .catch(err => {
      console.log('get users error: ', err);
      res.status(500).json({ error: 'Error occurred while getting users.' });
    });
});

router.get('/:id', validateUserId, (req, res) => {
  const { id } = req.params;

  Users.getById(id)
    .then(user => {
      if (user) {
        res.status(200).json(user);
      } else {
        res
          .status(404)
          .json({ error: `The user with id ${id} does not exist.` });
      }
    })
    .catch(err => {
      console.log('get user by id: ', err);
      res
        .status(500)
        .json({ error: 'Error occurred while getting user by id.' });
    });
});

router.get('/:id/posts', validateUserId, (req, res) => {
  const { id } = req.params;

  Users.getUserPosts(id)
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      console.log("get posts for user by user's id", err);
      res.status(500).json({
        error: "Error occurred while getting posts for user by user's id",
      });
    });
});

router.delete('/:id', validateUserId, (req, res) => {
  const { id } = req.params;
  const { user } = req.user;

  Users.remove(id)
    .then(deleted => {
      res.status(200).json(user);
    })
    .catch(err => {
      console.log('deleted user: ', err);
      res.status(500).json({ error: 'Error occurred while deleting' });
    });
});

router.put('/:id', validateUserId, validateUser, (req, res) => {
  const { id } = req.params;
  const changes = req.body;

  Users.update(id, changes)
    .then(updated => {
      Users.getById(id)
        .then(newUser => {
          if (newUser) {
            res.status(201).json(newUser);
          } else {
            res
              .status(404)
              .json({ error: `The user with id ${id} does not exist.` });
          }
        })
        .catch(err => {
          res
            .status(404)
            .json({ error: `The user with id ${id} does not exist.` });
        });
    })
    .catch(err => {
      console.log('updated user: ', err);
      res.status(500).json({ error: 'Error occurred while updating' });
    });
});

//custom middleware

function validateUserId(req, res, next) {
  const { id } = req.params;

  Users.getById(id).then(user => {
    if (user) {
      req.user = user;
      next();
    } else {
      return res.status(400).json({ message: 'Invalid user id.' });
    }
  });
}

function validateUser(req, res, next) {
  const { body } = req;

  if (Object.keys(body).length === 0) {
    return res.status(400).json({ message: 'Missing user data.' });
  }

  if (Object.keys(body).includes('name')) {
    next();
  } else {
    return res.status(400).json({ message: 'Missing required name field' });
  }
}

function validatePost(req, res, next) {
  const { body } = req;

  if (Object.keys(body).length === 0) {
    return res.status(400).json({ message: 'Missing post data.' });
  }

  if (
    Object.keys(body).includes('text') &&
    Object.keys(body).includes('user_id')
  ) {
    next();
  } else {
    return res.status(400).json({ message: 'Missing required text field' });
  }
}

module.exports = router;
