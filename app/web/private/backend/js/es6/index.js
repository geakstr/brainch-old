import express from 'express';
import nunjucks from 'nunjucks';
import path from 'path';

const app = express();

app.use('/static', express.static(path.join(__dirname, '../../../../public')));

nunjucks.configure(path.join(__dirname, '../../views'), {
  autoescape: true,
  express: app
});

app.get('/', (req, res) => {
  res.render('index.html');
});

const server = app.listen(8000, () => {
  const port = server.address().port;

  console.log('Web server started on port %s', port);
});