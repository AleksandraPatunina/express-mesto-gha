// const card = require('../models/card');
const Card = require('../models/card');

const ServerErrorCode = 500;
const ClientErrorCode = 400;
const NotFoundCode = 404;
const IncorrectId = 'Некорректный _id';
const ServerErrorMessage = 'На сервере произошла ошибка';
const NotFoundMessage = 'Карточка с указанным _id не найдена';
const CardDeleteMessage = 'Карточка удалена';

// Middleware для валидации _id карточки
module.exports.CastError = (req, res, next) => {
  if (req.params.cardId.length !== 24) {
    return res.status(ClientErrorCode).send({ message: IncorrectId });
  }
  return next(); // передаю управление следующему обработчику-контроллеру
};

module.exports.addCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      Card.findById(card._id)
        .populate('owner')
        .then((data) => res.status(201).send(data))
        .catch(() => res.status(ServerErrorCode).send({ message: ServerErrorMessage }));
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(ClientErrorCode).send({ message: error.message });
      } else {
        res.status(ServerErrorCode).send({ message: ServerErrorMessage });
      }
    });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards))
    .catch(() => res.status(ServerErrorCode).send({ message: ServerErrorMessage }));
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndDelete(req.params.cardId)
    .then((card) => {
      if (!card) {
        return res.status(NotFoundCode).send({ message: NotFoundMessage });
      }
      return res.send({ message: CardDeleteMessage });
    })
    .catch(() => res.status(ServerErrorCode).send({ message: ServerErrorMessage }));
};

module.exports.likeCard = (req, res) => {
  // в params лежит id карточки
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        return res.status(NotFoundCode).send({ message: NotFoundMessage });
      }
      return res.send(card);
    })
    .catch(() => res.status(ServerErrorCode).send({ message: ServerErrorMessage }));
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        return res.status(NotFoundCode).send({ message: NotFoundMessage });
      }
      return res.send(card);
    })
    .catch(() => res.status(ServerErrorCode).send({ message: ServerErrorMessage }));
};

// module.exports.deleteCard = (req, res) => {
//   if (req.params.cardId.length === 24) {
//     Card.findByIdAndDelete(req.params.cardId)
//       .then((card) => {
//         if (!card) {
//           res.status(404).send({ message: 'Карточка с указанным _id не найдена' });
//           return;
//         }
//         res.send({ message: 'Карточка удалена' });
//       })
//       .catch(() => res.status(404).send({ message: 'Карточка с указанным _id не найдена' }));
//   } else {
//     res.status(400).send({ message: ' Некорректный _id для карточки' });
//   }
// };

// module.exports.likeCard = (req, res) => {
//   if (req.params.cardId.length === 24) {
//     // в params лежит id карточки
//     Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } },
// { new: true })
//       .populate(['owner', 'likes'])
//       .then((card) => {
//         if (!card) {
//           res.status(404).send({ message: 'Карточка с указанным _id не найдена' });
//           return;
//         }
//         res.send(card);
//       })
//       .catch(() => res.status(404).send({ message: 'Карточка с указанным _id не найдена' }));
//   } else {
//     res.status(400).send({ message: 'Некорректный _id карточки' });
//   }
// };

// module.exports.dislikeCard = (req, res) => {
//   if (req.params.cardId.length === 24) {
//     Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
//       .populate(['owner', 'likes'])
//       .then((card) => {
//         if (!card) {
//           res.status(404).send({ message: 'Карточка с указанным _id не найдена' });
//           return;
//         }
//         res.send(card);
//       })
//       .catch(() => res.status(404).send({ message: 'Карточка с указанным _id не найдена' }));
//   } else {
//     res.status(400).send({ message: 'Некорректный _id карточки' });
//   }
// };
