// plugins/menu.js
const { cmd } = require("../command");
const config = require("../config");

// Store menu message IDs
let menuMessageStore = {};

const subMenus = {
  1: `⚔️ *Main Commands* ⚔️
• .ping - Check bot
• .help - Get help`,

  2: `🔮 *Download Commands* 🔮
• .yt [url] - YouTube DL
• .ig [url] - Instagram DL`,

  // Add more submenus...
};

cmd(
  {
    pattern: "menu2",
    alias: ["getmenu"],
    react: "📜",
    desc: "Show command menu",
    category: "main",
    filename: __filename,
  },
  async (robin, mek, m, { from, senderNumber, pushname }) => {
    try {
      const uptime = (process.uptime() / 60).toFixed(2);
      const ramUsage = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;

      const menuMsg = await robin.sendMessage(
        from,
        {
          image: { url: config.ALIVE_IMG },
          caption: `👋 *Hello ${pushname}*\n\n` +
                   `🕐 Uptime: ${uptime} min\n` +
                   `📦 RAM: ${ramUsage}\n\n` +
                   `📜 *Select Category:*\n\n` +
                   `1. ⚔️ Main\n2. 🔮 Download\n3. 🔐 Group\n` +
                   `...\n\n` +
                   `*Reply with number* (e.g. "1")`,
        },
        { quoted: mek }
      );

      // Store menu message ID
      menuMessageStore[senderNumber] = {
        id: menuMsg.key.id,
        timestamp: Date.now()
      };

    } catch (e) {
      console.error("Menu error:", e);
    }
  }
);

// Handle menu replies
cmd(
  {
    on: "text",
    fromMe: false,
    deleteCommand: false,
  },
  async (robin, mek, m, { from, senderNumber, reply }) => {
    try {
      // Check if this is a reply to a message
      if (mek.message?.extendedTextMessage?.contextInfo) {
        const quotedId = mek.message.extendedTextMessage.contextInfo.stanzaId;
        const userState = menuMessageStore[senderNumber];
        
        // Verify this is a reply to the menu message
        if (userState && quotedId === userState.id) {
          const userInput = mek.message.extendedTextMessage.text.trim();
          const selected = parseInt(userInput);
          
          // Validate input and send submenu
          if (!isNaN(selected) && subMenus[selected]) {
            await reply(subMenus[selected]);
            // Update last activity time
            userState.timestamp = Date.now();
          }
        }
      }
    } catch (e) {
      console.error("Menu reply error:", e);
    }
  }
);

// Clean old menu states hourly
setInterval(() => {
  const now = Date.now();
  Object.keys(menuMessageStore).forEach(number => {
    if (now - menuMessageStore[number].timestamp > 3600000) {
      delete menuMessageStore[number];
    }
  });
}, 3600000);

module.exports = { menuMessageStore };
