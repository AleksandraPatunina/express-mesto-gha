const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Данное поле должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "name" — 2 символа'],
    maxlength: [30, 'Максимальная длина поля "name"— 30 символов'],
  },
  about: {
    type: String,
    required: [true, 'Поле "about" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "about" — 2 символа'],
    maxlength: [30, 'Максимальная длина поля "about" — 30 символов'],
  },
  avatar: {
    type: String,
    required: [true, 'Поле "avatar" должно быть заполнено'],
    validate: {
      // взято  с сайта https://uibakery.io/regex-library/url
      validator(url) {
        return /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&\/=]*)$/.test(url);
      },
      message: 'Неправильно введен URL',
    },
  },
}, { versionKey: false });

module.exports = mongoose.model('user', userSchema);
