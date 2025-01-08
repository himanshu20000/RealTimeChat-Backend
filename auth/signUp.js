const User = require('../Models/Users/UserModals');
const generateToken = require('../utils/makeJwtToken');
const bcrypt = require('bcryptjs');

const signUp = async (req, res) => {
  try {
    const { username, emailId, password } = req.body;

    if (!username || !emailId || !password) {
      return res.status(400).send({ message: 'All fields are required' });
    }

    const isExistingUsername = await User.findOne({ username });
    const isExistingEmail = await User.findOne({ emailId });
    if (isExistingUsername || isExistingEmail) {
      return res.status(400).send({
        message: 'User already exists, please try a different username or email',
      });
    }

    const encryptPwd = await bcrypt.hash(password, 10);

    const user = await User.create({ username, password: encryptPwd, emailId });

    const token = generateToken(user._id);

    res.cookie('token', token, { httpOnly: true });

    res.status(201).send({
      message: 'Account created successfully',
      token,
    });
  } catch (err) {
    console.error('Error in signUp:', err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports = { signUp };
