const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "GFJlFA7b#5b9nYeV6ZKen3_wFwKgks3ax7YFCvkxQO2KmPFRrbtc",
  MONGODB: process.env.MONGODB || "mongodb://mongo:cKqwrneAPMeWgHattnWIDIYjSSpkEMwS@shortline.proxy.rlwy.net:15034",
  OWNER_NUM: process.env.OWNER_NUM || "94726939427",
};
