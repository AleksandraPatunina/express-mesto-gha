// const card = require('../models/card');
const mongoose = require('mongoose');
const Card = require('../models/card');

const ServerErrorCode = 500;
const ClientErrorCode = 400;
const NotFoundCode = 404;
const SuccessCard = 201;
const IncorrectId = 'Некорректный _id';
const ServerErrorMessage = 'На сервере произошла ошибка';
const NotFoundMessage = 'Карточка с указанным _id не найдена';
const CardDeleteMessage = 'Карточка удалена';

// Middleware для валидации _id карточки
// CastError - Ошибка валидации. Возникает, когда передан невалидный ID.
module.exports.CastError = ({ params: { cardId } }, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(ClientErrorCode).send({ message: IncorrectId });
  }
  return next();
};

module.exports.addCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      Card.findById(card._id)
        .populate('owner')
        .then((data) => res.status(SuccessCard).send(data))
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
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(ClientErrorCode).send({ message: IncorrectId });
      }
      return res.status(ServerErrorCode).send({ message: ServerErrorMessage });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        return res.status(NotFoundCode).send({ message: NotFoundMessage });
      }
      return res.send(card);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(ClientErrorCode).send({ message: IncorrectId });
      }
      return res.status(ServerErrorCode).send({ message: ServerErrorMessage });
    });
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
    .catch((error) => {
      if (error.name === 'CastError') {
        return res.status(ClientErrorCode).send({ message: IncorrectId });
      }
      return res.status(ServerErrorCode).send({ message: ServerErrorMessage });
    });
};
