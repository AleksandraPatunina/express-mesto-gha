const jwt = require('jsonwebtoken');

const { SECRET_KEY = 'mesto secret key' } = process.env;
const UnautorizedError = require('../errors/UnautorizedError');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnautorizedError('Необходима авторизация');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new UnautorizedError('Необходима авторизация');
  }
  req.user = payload;
  next();
};
