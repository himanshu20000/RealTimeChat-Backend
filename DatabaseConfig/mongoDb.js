const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDb = async() =>{
try {
    await mongoose.connect(process.env.MONGO_URI,{
    });
    console.log("Db connected success");
} catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
}
};

module.exports =  connectMongoDb;