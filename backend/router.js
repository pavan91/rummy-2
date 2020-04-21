const express = require("express");
const gameController = require("./controllers/game");

const router = express.Router();

router.post("/game/:id", gameController.getGameData);

module.exports = router;
