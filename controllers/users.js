const mongoose = require('mongoose');
const User = require('../models/user');

const ServerErrorCode = 500;
const ClientErrorCode = 400;
const NotFoundCode = 404;
const Success = 201;
const IncorrectUserId = 'Некорректный _id';
const ServerErrorMessage = 'На сервере произошла ошибка';
const NotFoundUserMessage = 'Пользователь по данному _id не найден';

// CastError - Ошибка валидации. Возникает, когда передан невалидный ID.
module.exports.CastError = ({ params: { userId } }, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(ClientErrorCode).send({ message: IncorrectUserId });
  }
  return next();
};

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(ServerErrorCode).send({ message: ServerErrorMessage }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(NotFoundCode).send({ message: NotFoundUserMessage });
      }
      return res.send(user);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(ClientErrorCode).send({ message: IncorrectUserId });
      }
      return res.status(ServerErrorCode).send({ message: ServerErrorMessage });
    });
};

module.exports.addUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(Success).send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(ClientErrorCode).send({ message: error.message });
      } else {
        res.status(ServerErrorCode).send({ message: ServerErrorMessage });
      }
    });
};

module.exports.editUserData = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(ClientErrorCode).send({ message: error.message });
      } else {
        res.status(NotFoundCode).send({ message: NotFoundUserMessage });
      }
    });
};

module.exports.editUserAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
    .then((user) => res.send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(ClientErrorCode).send({ message: error.message });
      } else {
        res.status(NotFoundCode).send({ message: NotFoundUserMessage });
      }
    });
};
