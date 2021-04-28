const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


const User = require('../models/user');

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, process.env.AWS_SECRET_ACCESS_KEY , {
    expiresIn: 86400,
  });
}

router.post('/register', async (req, res) => {
  
  const emailRegex = /\S+@\S+\.\S+/

  const email = req.body.email || ''
  const password = req.body.password || ''

  if (!email.match(emailRegex)) {
    return res.status(400).send({ errors: ['Invalid email!  (example@example.com)'] })
  }

  if (password.length < 6) {
    return res.status(400).send({
      errors: ["Password must be at least 6 digits "]
    })
  }


  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: 'Email already exists' });

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({
      user,
      token: generateToken({ id: user.id }),
    });
  } catch (err) {
    return res.status(400).send({ error: 'Registration failed' });
  }
});

router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user)
    return res.status(400).send({ error: 'User not exist' });

  if (!await bcrypt.compare(password, user.password))
    return res.status(400).send({ error: 'Invalid password' });

  user.password = undefined;

  res.send({
    user,
    token: generateToken({ id: user.id }),
  });
});



router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email })
      .select('+passwordResetToken passwordResetExpires');

    if (!user)
      return res.status(400).send({ error: 'User not found' });

    if (token !== user.passwordResetToken)
      return res.status(400).send({ error: 'Token invalid' });

    const now = new Date();

    if (now > user.passwordResetExpires)
      return res.status(400).send({ error: 'Token expired, generate a new one' });

    user.password = password;

    await user.save();

    res.send();
  } catch (err) {
    res.status(400).send({ error: 'Cannot reset password, try again' });
  }
});

module.exports = app => app.use('/auth', router);
