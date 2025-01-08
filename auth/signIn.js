
const UserModals = require('../Models/Users/UserModals');
const generateToken = require('../utils/makeJwtToken');
const bcrypt = require('bcryptjs');

const signIn = async(req,res) =>{
   try{ const {username,password} = req.body;
    const userExist = await UserModals.findOne({username});

    if(!userExist) return res.status(401).send({message:"No user found"});
    const isPasswordValid = await bcrypt.compare(password, userExist.password);
  if (!isPasswordValid) return res.status(401).send({ message: 'Invalid credentials' });

  const token = generateToken(userExist._id);
  res.status(200).send({
    message:"User signin successfull",
    token,
  });
}catch(e){
    res.status(500).send({ message: `Something went wrong: ${e.message}` });
}
}

module.exports = {signIn};