const mongoose = require('mongoose');
// const validator = require('validator');
const bcrypt = require('bcryptjs');
// const { default: isEmail } = require('validator/lib/isEmail');
const UnautorizedError = require('../errors/UnautorizedError');
const { regexForUrl } = require('../utils/constants');
const { regexForEmail } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: [2, 'Минимальная длина поля "name" — 2 символа'],
    maxlength: [30, 'Максимальная длина поля "name"— 30 символов'],
  },
  about: {
    type: String,
    default: 'Исследователь',
    required: [true, 'Поле "about" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "about" — 2 символа'],
    maxlength: [30, 'Максимальная длина поля "about" — 30 символов'],
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      // взято  с сайта https://uibakery.io/regex-library/url
      validator(url) {
        return regexForUrl.test(url);
      },
      message: 'Неправильно введен URL',
    },
  },
  email: {
    type: String,
    required: [true, 'Поле должно быть заполнено'],
    unique: true,
    validate: {
      validator(email) {
        // return isEmail(email);
        return regexForEmail.test(email);
      },
      message: 'Введите правильный email',
    },
  },
  password: {
    type: String,
    required: [true, 'Поле должно быть заполнено'],
    select: false,
  },
}, { versionKey: false });

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new UnautorizedError('Неправильно введена почта или пароль'); // обрываемся и ошибку передаем в catch
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnautorizedError('Неправильно введена почта или пароль');
          }

          return user; // теперь user доступен
        });
    });
};

module.exports = mongoose.model('user', userSchema);
