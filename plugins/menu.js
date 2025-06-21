// plugins/menu.js

const { cmd } = require("../command");
const config = require("../config");
const os = require("os");

// Enhanced state storage with persistent memory
let menuReplyState = {};

// Auto cleanup function - runs every minute
setInterval(() => {
  const now = Date.now();
  Object.keys(menuReplyState).forEach(number => {
    // Remove states older than 8 minutes (480,000 ms)
    if (now - menuReplyState[number].timestamp > 480000) {
      console.log(`🧹 Cleaning up menu state for ${number} (expired after 8 minutes)`);
      delete menuReplyState[number];
    }
  });
}, 60000); // Check every minute

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

*_Reply with a number (e.g., "1") to view commands._*
*_Menu stays active for 8 minutes!_*

☯️ *Made by P_I_K_O*`;

      const menuMessage = await robin.sendMessage(
        from,
        {
          image: { url: config.ALIVE_IMG },
          caption: madeMenu,
        },
        { quoted: mek }
      );

      // Store menu state with persistent memory
      menuReplyState[senderNumber] = {
        expecting: true,
        timestamp: Date.now(),
        messageId: menuMessage.key.id,
        type: 'main_menu',
        chatId: from,
        lastMenuMessageId: menuMessage.key.id
      };

      console.log(`📋 Menu activated for ${senderNumber} - Active for 8 minutes`);

    } catch (e) {
      console.error(e);
      reply(`Error: ${e.message}`);
    }
  }
);

// Enhanced menu navigation handler
cmd(
  {
    on: "body",
    fromMe: false,
  },
  async (robin, mek, m, { from, senderNumber, body, reply, quoted }) => {
    try {
      // Check if user has an active menu state
      const userState = menuReplyState[senderNumber];
      if (!userState || !userState.expecting) return;

      // Check if this is a reply to any menu message OR just a number
      const userInput = body.trim();
      const selected = parseInt(userInput);

      // Accept replies to menu messages OR direct number inputs
      const isValidReply = quoted && (
        quoted.id === userState.messageId || 
        quoted.id === userState.lastMenuMessageId
      );
      
      const isDirectNumber = !isNaN(selected) && selected >= 1 && selected <= 10 && userInput.length <= 2;

      if (isValidReply || isDirectNumber) {
        if (!isNaN(selected) && selected >= 1 && selected <= 10) {
          // Send the appropriate submenu
          const submenuMessage = await sendSubMenu(robin, from, selected, mek, reply);
          
          // Update user state but KEEP expecting more replies
          userState.timestamp = Date.now(); // Refresh the 8-minute timer
          userState.expecting = true; // Keep expecting replies!
          userState.lastMenuMessageId = submenuMessage.key.id; // Track latest message
          
          console.log(`📋 User ${senderNumber} selected menu ${selected} - Menu still active`);
        } else {
          reply("❌ Please reply with a valid number (1-10) to select a category.");
        }
      }
    } catch (e) {
      console.error("Menu navigation error:", e);
    }
  }
);

// Enhanced submenu function that returns message info
async function sendSubMenu(robin, from, categoryNumber, mek, reply) {
  const subMenus = {
    1: {
      title: "⚔️ *MAIN COMMANDS* ⚔️",
      commands: [
        "▪️ .alive - Check if bot is online",
        "▪️ .menu - Show main menu",
        "▪️ .ping - Check bot response time",
        "▪️ .system - Show system information",
        "▪️ More commands coming soon..."
      ]
    },
    2: {
      title: "🔮 *DOWNLOAD COMMANDS* 🔮",
      commands: [
        "▪️ .song <text> - Download YouTube audio",
        "▪️ .video <text> - Download YouTube video",
        "▪️ .fb <link> - Download Facebook video",
        "▪️ .movie <text> - Download movies",
        "▪️ .ytshort <link> - Download YouTube Shorts",
        "▪️ .tiktok <link> - Download TikTok videos",
        "▪️ .igpost <link> - Download Instagram posts",
        "▪️ .igvideo <link> - Download Instagram videos"
      ]
    },
    3: {
      title: "🔐 *GROUP COMMANDS* 🔐",
      commands: [
        "▪️ .kick - Remove user from group",
        "▪️ .mute - Mute group chat",
        "▪️ .unmute - Unmute group chat",
        "▪️ .add <number> - Add user to group",
        "▪️ .left - Leave group or remove user",
        "▪️ .demote - Remove admin privileges",
        "▪️ .promote - Give admin privileges",
        "▪️ .vv - Convert view once to normal",
        "▪️ .dp - Download profile picture"
      ]
    },
    4: {
      title: "👑 *OWNER COMMANDS* 👑",
      commands: [
        "▪️ .restart - Restart the bot",
        "▪️ .update - Update bot system",
        "▪️ .left - Leave any group",
        "▪️ .block - Block a user",
        "▪️ .vv - Convert view once messages",
        "▪️ .dp - Download any profile picture"
      ]
    },
    5: {
      title: "🪄 *CONVERT COMMANDS* 🪄",
      commands: [
        "▪️ .tosticker <reply img> - Convert image to sticker",
        "▪️ .toimg <reply sticker> - Convert sticker to image",
        "▪️ .tr <lang><text> - Translate text",
        "▪️ .tts <text> - Text to speech",
        "▪️ More converters coming soon..."
      ]
    },
    6: {
      title: "🔎 *SEARCH COMMANDS* 🔎",
      commands: [
        "▪️ Search commands coming soon...",
        "▪️ Stay tuned for updates!"
      ]
    },
    7: {
      title: "🧚🏻 *ANIME COMMANDS* 🧚🏻",
      commands: [
        "▪️ .loli - Random loli images",
        "▪️ .waifu - Random waifu images",
        "▪️ .neko - Random neko images",
        "▪️ .megumin - Random megumin images",
        "▪️ .maid - Random maid images",
        "▪️ .awoo - Random awoo images"
      ]
    },
    8: {
      title: "💫 *FUN COMMANDS* 💫",
      commands: [
        "▪️ .animegirl - Random anime girl image",
        "▪️ .fact - Get random fun facts",
        "▪️ .joke - Get random jokes",
        "▪️ .hack - Fun hacking simulation",
        "▪️ .dog - Random dog images"
      ]
    },
    9: {
      title: "🤖 *AI COMMANDS* 🤖",
      commands: [
        "▪️ .ai <text> - Chat with AI",
        "▪️ .gemini <text> - Google Gemini AI",
        "▪️ .imagine <text> - Generate AI images",
        "▪️ .aivideoframes <text> - AI video frames",
        "▪️ .aislideshow <text> - AI slideshow",
        "▪️ .vidpreview <text> - Video preview",
        "▪️ .aigifframes <text> - AI GIF frames"
      ]
    },
    10: {
      title: "🎲 *OTHER COMMANDS* 🎲",
      commands: [
        "▪️ .gpass <number> - Generate password",
        "▪️ .githubstalk <username> - GitHub profile info",
        "▪️ .sh - Study helper tips",
        "▪️ More utilities coming soon..."
      ]
    }
  };

  const selectedMenu = subMenus[categoryNumber];
  if (selectedMenu) {
    const menuText = `${selectedMenu.title}

${selectedMenu.commands.join('\n')}

💡 *Usage:* Simply type any command to use it!
🔙 *Back to main menu:* Type .menu
⏰ *Menu expires in 8 minutes*

*Reply with another number (1-10) for more categories!*

☯️ *Made by P_I_K_O*`;

    const submenuMessage = await robin.sendMessage(
      from,
      {
        image: { url: config.ALIVE_IMG },
        caption: menuText,
      },
      { quoted: mek }
    );

    return submenuMessage; // Return message info for tracking
  }
}

// Command to check menu status (for debugging)
cmd(
  {
    pattern: "menustatus",
    desc: "Check menu status",
    category: "main",
    filename: __filename,
  },
  async (robin, mek, m, { from, senderNumber, reply }) => {
    try {
      const userState = menuReplyState[senderNumber];
      if (userState) {
        const timeLeft = Math.max(0, 480000 - (Date.now() - userState.timestamp));
        const minutesLeft = Math.floor(timeLeft / 60000);
        const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
        
        reply(`📋 *Menu Status:* Active\n⏰ *Time Left:* ${minutesLeft}m ${secondsLeft}s\n🎯 *Type a number (1-10) to navigate!*`);
      } else {
        reply(`📋 *Menu Status:* Inactive\n💡 *Type .menu to activate!*`);
      }
    } catch (e) {
      console.error(e);
      reply(`Error: ${e.message}`);
    }
  }
);

module.exports = { menuReplyState, sendSubMenu };