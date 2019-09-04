const express = require('express');
const userRouter = require('./users/userRouter');
// const postRouter = require('./posts/postRouter');

const server = express();

// global middleware
server.use(express.json());
server.use(logger);

// router
server.use('/users', userRouter);
// server.use('/posts', postRouter);

server.get('/', (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`);
});

//custom middleware

function logger(req, res, next) {
  console.log(
    `[${new Date().toISOString()}] ${req.method} to ${req.url} from ${req.get(
      'Origin',
    )}`,
  );

  next();
}

module.exports = server;
