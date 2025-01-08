const jwt = require('jsonwebtoken');
const UserModals = require('../Models/Users/UserModals');
const getCredentials= async(req,res) =>{
try{
    const tokenId = req.cookies.token;

if(!tokenId)  return res.status(401).send(
    {
        message:"Token is invalid"
    }
);
 const decodedId = jwt.verify(tokenId,process.env.JWT_SECRET);
 const user = await UserModals.findById(decodedId.id);
if(!user){
    return res.status(404).send({message:"User not found in records"});
}
const {password, ...userData} = user.toObject();
res.status(200).send({user:userData});
}catch(e){
    res.status(401).send({message:`Something went wrong: ${e}`});
}
};

module.exports = {getCredentials};