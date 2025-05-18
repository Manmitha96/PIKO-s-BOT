// commands/menu.js

const { cmd } = require("../command");
const config = require("../config");
const os = require("os");

// Temporary state storage
let menuReplyState = {};

cmd(
  {
    pattern: "menu",
    alias: ["getmenu"],
    react: "💙",
    desc: "Get command list",
    category: "main",
    filename: __filename,
  },
  async (robin, mek, m, { from, senderNumber, pushname, reply }) => {
    try {
      // System info
      let uptime = (process.uptime() / 60).toFixed(2); // minutes
      let used = process.memoryUsage().heapUsed / 1024 / 1024;
      let ramUsage = `${Math.round(used * 100) / 100} MB`;

      // Build main menu
      let madeMenu = `👋 *Hello ${pushname}*

🕐 *Uptime:* ${uptime} minutes
📦 *RAM Usage:* ${ramUsage}

📍 *Select a Category by replying with a number:*

1. 🛠️ Main Commands
2. ⬇️ Download Commands
3. 👥 Group Commands
4. 👑 Owner Commands
5. 🌀 Convert Commands
6. 🔎 Search Commands

_Reply with a number (e.g., 1) to view the commands in that category._

☯️ Made by P_I_K_O`;

      // Send menu
      await robin.sendMessage(
        from,
        {
          image: {
            url: config.ALIVE_IMG || "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/IMG-20250427-WA0145.jpg",
          },
          caption: madeMenu,
        },
        { quoted: mek }
      );

      // Mark user as “in menu mode”
      menuReplyState[senderNumber] = {
        expecting: true,
        timestamp: Date.now(),
      };
    } catch (e) {
      console.error(e);
      reply(`Error: ${e.message}`);
    }
  }
);

module.exports = { menuReplyState };
