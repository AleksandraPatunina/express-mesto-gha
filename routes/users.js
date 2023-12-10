const router = require('express').Router();
const {
  getUsers, getUserById, addUser, editUserData, editUserAvatar, CastError,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', CastError, getUserById);
router.post('/', addUser);
router.patch('/me', editUserData);
router.patch('/me/avatar', editUserAvatar);

module.exports = router;

// GET /users — возвращает всех пользователей
// GET /users/:userId - возвращает пользователя по _id
// POST /users — создаёт пользователя
// PATCH /users/me — обновляет профиль
// PATCH /users/me/avatar — обновляет аватар
