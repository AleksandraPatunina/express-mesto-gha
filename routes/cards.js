const router = require('express').Router();
const {
  addCard, getCards, deleteCard, likeCard, dislikeCard, CastError,
} = require('../controllers/cards');

router.get('/', getCards);
router.delete('/:cardId', CastError, deleteCard);
router.post('/', addCard);
router.put('/:cardId/likes', CastError, likeCard);
router.delete('/:cardId/likes', CastError, dislikeCard);

module.exports = router;

// GET /cards — возвращает все карточки
// POST /cards — создаёт карточку
// DELETE /cards/:cardId — удаляет карточку по идентификатору
// PUT /cards/:cardId/likes — поставить лайк карточке
// DELETE /cards/:cardId/likes — убрать лайк с карточки
