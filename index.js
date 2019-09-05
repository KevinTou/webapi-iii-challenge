const server = require('./server.js');

const port = process.env.PORT || 8000;

server.listen(8000, () => console.log(`\n Listening on port ${port} \n`));
