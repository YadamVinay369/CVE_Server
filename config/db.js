const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MongoURL);
    console.log(`Connected to MongoDB DataBase ${mongoose.connection.host}`);
  } catch (error) {
    console.log(`MongoDB connection Error ${error.message}`);
  }
};

module.exports = connectDB;
