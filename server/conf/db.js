const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONG_DB);
    console.log("DBConnect");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
