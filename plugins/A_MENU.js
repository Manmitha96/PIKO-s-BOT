// plugins/menu.js
const { cmd } = require("../command");
const config = require("../config");
const os = require("os");

// Store menu states
let menuStates = {};

// Submenus data
const subMenus = {
  1: `⚔️ *Main Commands* ⚔️
• .ping - Check bot response
• .menu - Show main menu
• .help - Get help
• .owner - Contact owner`,

  2: `🔮 *Download Commands* 🔮
• .yt [url] - Download YouTube video
• .ig [url] - Download Instagram content
• .fb [url] - Download Facebook video`,

  3: `🔐 *Group Commands* 🔐
• .add [number] - Add user to group
• .kick [@tag] - Remove user from group
• .promote [@tag] - Make user admin`,
};

// Clean up old states every 5 minutes
setInterval(() => {
  console.log('[MENU] Running cleanup of old menu states');
  const now = Date.now();
  for (const [number, state] of Object.entries(menuStates)) {
    if (now - state.timestamp > 300000) {
      console.log(`[MENU] Cleaning up state for ${number}`);
      delete menuStates[number];
    }
  }
}, 60000);

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
      console.log(`[MENU] Received menu command from ${senderNumber}`);
      
      let uptime = (process.uptime() / 60).toFixed(2);
      let used = process.memoryUsage().heapUsed / 1024 / 1024;
      let ramUsage = `${Math.round(used * 100) / 100} MB`;

      let menuText = `👋 *Hello ${pushname}*\n\n🕐 *Uptime:* ${uptime} minutes\n📦 *RAM Usage:* ${ramUsage}\n\n📍 *Select a Category:*\n\n1. ⚔️ Main\n2. 🔮 Download\n3. 🔐 Group\n4. 👑 Owner\n5. 🪄 Convert\n6. 🔎 Search\n7. 🧚 Anime\n8. 💫 Fun\n9. 🤖 AI\n10. 🎲 Other\n\n*Reply with a number (e.g. "1")*\n\n☯️ *Made by P_I_K_O*`;

      console.log(`[MENU] Sending menu to ${senderNumber}`);
      const sentMsg = await robin.sendMessage(
        from,
        {
          image: { url: config.ALIVE_IMG },
          caption: menuText,
        },
        { quoted: mek }
      );

      console.log(`[MENU] Storing state for ${senderNumber}, message ID: ${sentMsg.key.id}`);
      menuStates[senderNumber] = {
        menuId: sentMsg.key.id,
        timestamp: Date.now()
      };

    } catch (e) {
      console.error('[MENU ERROR] In main menu command:', e);
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
      console.log(`[MENU] Received message from ${senderNumber}`);
      
      if (mek.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedId = mek.message.extendedTextMessage.contextInfo.stanzaId;
        console.log(`[MENU] Detected reply to message ID: ${quotedId}`);
        
        const menuState = menuStates[senderNumber];
        console.log(`[MENU] Current state for ${senderNumber}:`, menuState);
        
        if (menuState && quotedId === menuState.menuId) {
          console.log(`[MENU] Valid reply to menu detected from ${senderNumber}`);
          
          const userInput = mek.message.extendedTextMessage.text.trim();
          console.log(`[MENU] User input: "${userInput}"`);
          
          const selectedOption = parseInt(userInput);
          
          if (!isNaN(selectedOption) && subMenus[selectedOption]) {
            console.log(`[MENU] Sending submenu ${selectedOption} to ${senderNumber}`);
            await robin.sendMessage(
              from,
              { text: subMenus[selectedOption] },
              { quoted: mek }
            );
          } else {
            console.log(`[MENU] Invalid input from ${senderNumber}: ${userInput}`);
            reply("Please reply with a valid number (1-10)");
          }
          
          menuState.timestamp = Date.now();
        } else {
          console.log(`[MENU] Reply not matching menu state for ${senderNumber}`);
        }
      } else {
        console.log(`[MENU] Regular message from ${senderNumber}, not a reply`);
      }
    } catch (e) {
      console.error('[MENU ERROR] In reply handler:', e);
    }
  }
);

module.exports = { menuStates };
