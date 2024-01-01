const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { addUser } = require('../controllers/users');
const { regexForUrl, regexForEmail } = require('../utils/constants');

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(regexForUrl),
    email: Joi.string().required().pattern(regexForEmail),
    password: Joi.string().required(),
  }).unknown(true),
}), addUser);

module.exports = router;
