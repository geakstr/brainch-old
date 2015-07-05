import express from 'express';
import ejs from 'ejs';
import path from 'path';

const app = express();

app.use('/static', express.static(path.join(__dirname, '/../../../public')));


app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '/../views'));


app.get('/', (req, res) => {
  res.render('index');
});


const server = app.listen(8000, () => {
  const port = server.address().port;

  console.log('Web server started on port %s', port);
});