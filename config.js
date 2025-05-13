const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "fBBIBSyK#quD9TMYjjVxVbLB6lmSle0-OwSn7eEEw3Tn3f4IFzk",
  MONGODB: process.env.MONGODB || "mongodb://mongo:cKqwrneAPMeWgHattnWIDIYjSSpkEMwS@shortline.proxy.rlwy.net:15034",
  OWNER_NUM: process.env.OWNER_NUM || "94726939427",
};
