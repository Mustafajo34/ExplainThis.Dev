const Redis = require("ioredis");
const redis = new Redis();

const HARD_CAP = 5;
const WINDOW_SECONDS = 60;

const HardCap = async (req, resizeBy, next) => {};

module.exports = HardCap;
