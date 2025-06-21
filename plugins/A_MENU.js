// plugins/menu.js

const { cmd } = require("../command");
const config = require("../config");
const os = require("os");

// Temporary state storage
let menuReplyState = {};

// Submenu data (you can expand this)
const subMenus = {
  1: {
    title: "⚔️ Main Commands",
    commands: [
      "• .ping - Check bot response",
      "• .menu - Show this menu",
      "• .help - Get help",
      // Add more commands here
    ]
  },
  2: {
    title: "🔮 Download Commands",
    commands: [
      "• .ytdl [url] - Download from YouTube",
      "• .igdl [url] - Download from Instagram",
      // Add more commands here
    ]
  },
  // Add more submenus here...
};

cmd(
  {
    pattern: "menu",
    alias: ["getmenu"],
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

📍 *Select a Category by replying with a number:*

1. ⚔️ Main Commands
2. 🔮 Download Commands
3. 🔐 Group Commands
4. 👑 Owner Commands
5. 🪄 Convert Commands
6. 🔎 Search Commands
7. 🧚🏻 Anime Commands
8. 💫 Fun Commands
9. 🤖 Ai Commands
10. 🎲 Other Commands

*_Reply with a number (e.g. "1") to view the commands in that category._*

☯️ *Made by P_I_K_O*`;

      const sentMsg = await robin.sendMessage(
        from,
        {
          image: { url: config.ALIVE_IMG },
          caption: madeMenu,
        },
        { quoted: mek }
      );

      // Store the menu message ID for reference
      menuReplyState[senderNumber] = {
        menuMessageId: sentMsg.key.id,
        expecting: true,
        timestamp: Date.now(),
      };
    } catch (e) {
      console.error(e);
      reply(`Error: ${e.message}`);
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
  async (robin, mek, m, { from, senderNumber, pushname, reply }) => {
    try {
      // Check if this is a reply to the menu
      if (mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage || 
          mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
        
        const quotedId = mek.message.extendedTextMessage.contextInfo.stanzaId;
        const menuState = menuReplyState[senderNumber];
        
        // Check if this is a reply to the menu message
        if (menuState && menuState.expecting && quotedId === menuState.menuMessageId) {
          const userInput = mek.message.extendedTextMessage.text.trim();
          const selectedOption = parseInt(userInput);
          
          if (!isNaN(selectedOption) && selectedOption >= 1 && selectedOption <= 10) {
            const subMenu = subMenus[selectedOption];
            if (subMenu) {
              let subMenuText = `*${subMenu.title}*\n\n`;
              subMenuText += subMenu.commands.join('\n');
              subMenuText += `\n\n*Reply with another number or use .menu to go back*`;
              
              await robin.sendMessage(
                from,
                { text: subMenuText },
                { quoted: mek }
              );
            } else {
              reply("Submenu not available yet.");
            }
          } else {
            reply("Please reply with a number between 1 and 10.");
          }
          
          // Keep the state active for further replies
          menuReplyState[senderNumber].timestamp = Date.now();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
);

// Clean up old states periodically
setInterval(() => {
  const now = Date.now();
  for (const [number, state] of Object.entries(menuReplyState)) {
    if (now - state.timestamp > 300000) { // 5 minutes
      delete menuReplyState[number];
    }
  }
}, 60000); // Check every minute

module.exports = { menuReplyState };
