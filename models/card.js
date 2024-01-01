const mongoose = require('mongoose');
const { regexForUrl } = require('../utils/constants');

const cardSchema = new mongoose.Schema({
  //  имя карточки
  name: {
    type: String,
    required: [true, 'Данное поле должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "name" — 2 символа'],
    maxlength: [30, 'Максимальная длина поля "name"— 30 символов'],
  },
  // ссылка на картинку
  link: {
    type: String,
    required: [true, 'Поле "link" должно быть заполнено'],
    validate: {
      // взято  с сайта https://uibakery.io/regex-library/url
      validator(url) {
        return regexForUrl.test(url);
      },
      message: 'Неправильно введен URL',
    },
  },
  // ссылка на модель автора карточки
  owner: {

    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  // список лайкнувших пост пользователей
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: [],
  },
  ],
  // дата создания
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

module.exports = mongoose.model('card', cardSchema);
