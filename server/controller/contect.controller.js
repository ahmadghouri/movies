const Contect = require("../models/contect");

const handleContectFrom = async (req, res) => {
  let body = req.body;
  console.log(body);

  try {
    const contect = await Contect.create(body);
    console.log(contect);
    return res.status(200).json(contect);
  } catch (error) {
    console.log(error);
  }
};

const handleGetContectFrom = async (req, res) => {
  try {
    const contect = await Contect.find().sort({ createdAt: -1 });
    return res.status(200).json(contect);
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  handleContectFrom,
  handleGetContectFrom,
};
