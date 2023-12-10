const User = require('../models/user');

const ServerErrorCode = 500;
const ClientErrorCode = 400;
const NotFoundCode = 404;
const Success = 201;
const IncorrectUserId = 'Некорректный _id';
const ServerErrorMessage = 'На сервере произошла ошибка';
const NotFoundUserMessage = 'Пользователь по данному _id не найден';

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(ServerErrorCode).send({ message: ServerErrorMessage }));
};

// Middleware для валидации _id пользователя
module.exports.CastError = (req, res, next) => {
  if (req.params.userId.length !== 24) {
    return res.status(ClientErrorCode).send({ message: IncorrectUserId }); // исправила
  }
  return next(); // передаю управление следующему обработчику-контроллеру
};
module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(NotFoundCode).send({ message: NotFoundUserMessage });
      }
      return res.send(user);
    })
    .catch(() => res.status(ServerErrorCode).send({ message: ServerErrorMessage }));
};

// было
// module.exports.getUserById = (req, res) => {
//   // в mongoDB id по длине всегда 24 символа
//   if (req.params.userId.length === 24) {
//     User.findById(req.params.userId)
//       .then((user) => {
//         if (!user) {
//           res.status(404).send({ message: 'Пользователь по данному _id не найден' });
//           return;
//         }
//         res.send(user);
//       })
//       .catch(() => res.status(404).send({ message: 'Пользователь по данному _id не найден' }));
//   } else {
//     res.status(400).send({ message: 'Некорректный _id' });
//   }
// };

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

// Было:
// module.exports.editUserData = (req, res) => {
//   const { name, about } = req.body;
//   if (req.user._id) {
//     User.findByIdAndUpdate(req.user._id, { name, about }, { new: 'true', runValidators: true })
//       .then((user) => res.send(user))
//       .catch((error) => {
//         if (error.name === 'ValidationError') {
//           res.status(400).send({ message: error.message });
//         } else {
//           res.status(404).send({ message: 'Пользователь по указанному _id не найден' });
//         }
//       });
//   } else {
//     res.status(500).send({ message: 'На сервере произошла ошибка' });
//   }
// };
// Было
// module.exports.editUserAvatar = (req, res) => {
//   if (req.user._id) {
//     User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar },
// { new: 'true', runValidators: true })
//       .then((user) => res.send(user))
//       .catch((error) => {
//         if (error.name === 'ValidationError') {
//           res.status(400).send({ message: error.message });
//         } else {
//           res.status(404).send({ message: 'Пользователь по указанному _id не найден' });
//         }
//       });
//   } else {
//     res.status(500).send({ message: 'На сервере произошла ошибка' });
//   }
// };
