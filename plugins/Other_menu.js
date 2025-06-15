// plugins/menu.js

const { cmd } = require("../command");
const config = require("../config");
const os = require("os");

// Temporary state storage
let menuReplyState = {};

cmd(
  {
    pattern: "2",
    react: "📜",
    desc: "Get command list",
    category: "main",
    filename: __filename,
  },
  async (robin, mek, m, { from, senderNumber, pushname, reply }) => {
    try {
      let uptime = (process.uptime() / 60).toFixed(2);
      let used = process.memoryUsage().heapUsed / 1024 / 1024;
      let ramUsage = `${Math.round(used * 100) / 100} MB`;

      let madeMenu = `👋 *Hello ${pushname}*

🕐 *Uptime:* ${uptime} minutes
📦 *RAM Usage:* ${ramUsage}

🎲 *OTHER COMMANDS:*

1. ▪️.gpass <numbers of pw>
2. ▪️.githubstalk <username>
3. ▪️.sh (study help tips)
4. ▪️.Coming soon
5. ▪️.Coming soon
6. ▪️.Coming soon
7. ▪️.Coming soon

*_Reply with a command to download that category._*

☯️ 𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O*`;

      await robin.sendMessage(
        from,
        {
          image: { url: config.ALIVE_IMG },
          caption: madeMenu,
        },
        { quoted: mek }
      );

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
