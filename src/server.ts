import app from './app';

const port = process.env.PORT || 3007;

const server = app({
  logger: {
    level: 'info',
    prettyPrint: true,
  },
  ignoreTrailingSlash: true,
});

server.listen(port, err => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
