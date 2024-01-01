// const card = require('../models/card');
const { HTTP_STATUS_OK, HTTP_STATUS_CREATED } = require('http2').constants;
const mongoose = require('mongoose');
const Card = require('../models/card');

// ошибки
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.addCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      Card.findById(card._id)
        .orFail()
        .populate('owner')
        .then((data) => res.status(HTTP_STATUS_CREATED).send(data))
        .catch((error) => {
          if (error instanceof mongoose.Error.DocumentNotFoundError) {
            next(new NotFoundError('Карточка с указанным _id не найдена.'));
          } else {
            next(error);
          }
        });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(error.message));
      } else {
        next(error);
      }
    });
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.status(HTTP_STATUS_OK).send(cards))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Карточка принадлежит другому пользователю');
      }
      Card.deleteOne(card)
        .orFail()
        .then(() => {
          res.status(HTTP_STATUS_OK).send({ message: 'Карточка удалена' });
        })
        .catch((error) => {
          if (error instanceof mongoose.Error.DocumentNotFoundError) {
            next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена.`));
          } else if (error instanceof mongoose.Error.CastError) {
            next(new BadRequestError(`Некорректный _id карточки: ${req.params.cardId}`));
          } else {
            next(error);
          }
        });
    })
    .catch((err) => {
      if (err.name === 'TypeError') {
        next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена в БД.`));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail()
    .populate(['owner', 'likes'])
    .then((card) => {
      res.status(HTTP_STATUS_OK).send(card);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена.`));
      } else if (error instanceof mongoose.Error.CastError) {
        next(new BadRequestError(`Некорректный _id карточки: ${req.params.cardId}`));
      } else {
        next(error);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail()
    .populate(['owner', 'likes'])
    .then((card) => {
      res.status(HTTP_STATUS_OK).send(card);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена.`));
      } else if (error instanceof mongoose.Error.CastError) {
        next(new BadRequestError(`Некорректный _id карточки: ${req.params.cardId}`));
      } else {
        next(error);
      }
    });
};
