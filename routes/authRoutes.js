const express = require('express');
const { signUp } = require('../auth/signUp');
const { signIn } = require('../auth/signIn');
const { getCredentials } = require('../middleware/getCredential');

const router = express.Router();


router.post('/signup', signUp);
router.post('/signIn',signIn);
router.get('/',getCredentials);

module.exports = router;
