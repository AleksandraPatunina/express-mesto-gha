const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { login } = require('../controllers/users');
const { regexForEmail } = require('../utils/constants');

router.post('/', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().pattern(regexForEmail),
    password: Joi.string().required(),
  }),
}), login);

module.exports = router;
