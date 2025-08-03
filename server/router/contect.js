const express = require("express");
const {
  handleContectFrom,
  handleGetContectFrom,
} = require("../controller/contect.controller");

const contectRouter = express.Router();

contectRouter.post("/contect", handleContectFrom);
contectRouter.get("/admin/contect", handleGetContectFrom);

module.exports = contectRouter;
