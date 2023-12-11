const express = require('express');
const mongoose = require('mongoose');

const NotFoundCode = 404;
const PageNotFound = 'страница не найдена';

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/testdb' } = process.env;

const app = express();

app.use(express.json()); // для собирания JSON-формата
app.use(express.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

// подключаемся к серверу mongo
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// временное решение для авторизации
app.use((req, res, next) => {
  req.user = {
    _id: '6568ebf38f0abf7e507a52eb',
  };

  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use('*', (req, res) => {
  res.status(NotFoundCode).send({ message: PageNotFound });
});

app.listen(PORT);
