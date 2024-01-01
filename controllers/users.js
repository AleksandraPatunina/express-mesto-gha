const { HTTP_STATUS_OK, HTTP_STATUS_CREATED } = require('http2').constants;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

// выводим всех пользователей:
module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(HTTP_STATUS_OK).send(users))
    .catch(next);
};

// выводим всех пользователя по id:
module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => {
      res.status(HTTP_STATUS_OK).send(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        next(new BadRequestError(`Некорректный _id: ${req.params.userId}`)); // ЭКЗЕМПЛЯР НУЖНОЙ ОШИБКИ С НУЖНЫМ ТЕКСТОМ
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError(`Пользователь  по указанному _id: ${req.params.userId} не найден.`));
      } else {
        next(error);
      }
    });
};

// добавляем  пользователя:
module.exports.addUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  // хешируем пароль
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    })
      .then((user) => res.status(HTTP_STATUS_CREATED).send({
        // возвращаем все значения, кроме пароля
        name: user.name, about: user.about, avatar: user.avatar, _id: user._id, email: user.email,
      }))
      .catch((error) => {
        if (error.code === 11000) {
          next(new ConflictError(`Пользователь с email: ${email} уже был зарегистрирован`));
        } else if (error instanceof mongoose.Error.ValidationError) {
          next(new BadRequestError(error.message));
        } else {
          next(error);
        }
      }));
};

// редактируем данные пользователя:
module.exports.editUserData = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(error.message));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError(`Пользователь  по указанному _id: ${req.params.userId} не найден.`));
      } else {
        next(error);
      }
    });
};

// редактируем аватар пользователя:
module.exports.editUserAvatar = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(error.message));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError(`Пользователь  по указанному _id: ${req.params.userId} не найден.`));
      } else {
        next(error);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'mesto secret key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((error) => {
      next(error);
    });
};

// информация о себе
module.exports.getAboutMeUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch(next);
};
