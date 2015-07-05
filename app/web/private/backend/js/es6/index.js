import express from 'express';
import ejs from 'ejs';

const app = express();

app.use('/static', express.static(__dirname + '/../../../public'));

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/../views')


app.get('/', (req, res) => {
  res.render('index');
});


const server = app.listen(8000, () => {
  const port = server.address().port;

  console.log('Web server started on port %s', port);
});