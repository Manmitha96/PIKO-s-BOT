// plugins/menu.js

const { cmd } = require("../command");
const config = require("../config");
const os = require("os");

// Temporary state storage
let menuReplyState = {};

cmd(
  {
    pattern: "menu22",
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

*_Reply with a number (e.g., "1") to view the commands in that category._*

☯️ *Made by P_I_K_O*`;

      const menuMessage = await robin.sendMessage(
        from,
        {
          image: { url: config.ALIVE_IMG },
          caption: madeMenu,
        },
        { quoted: mek }
      );

      // Store menu message ID for tracking replies
      menuReplyState[senderNumber] = {
        expecting: true,
        timestamp: Date.now(),
        messageId: menuMessage.key.id,
        type: 'main_menu'
      };

      // Clean up old states (older than 10 minutes)
      setTimeout(() => {
        Object.keys(menuReplyState).forEach(number => {
          if (Date.now() - menuReplyState[number].timestamp > 600000) {
            delete menuReplyState[number];
          }
        });
      }, 600000);

    } catch (e) {
      console.error(e);
      reply(`Error: ${e.message}`);
    }
  }
);

// Handle menu navigation replies
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

      // Check if this is a reply to the menu message
      if (quoted && quoted.id === userState.messageId) {
        const userInput = body.trim();
        const selected = parseInt(userInput);

        if (!isNaN(selected) && selected >= 1 && selected <= 10) {
          // Send the appropriate submenu
          await sendSubMenu(robin, from, selected, mek, reply);
          
          // Update user state
          userState.timestamp = Date.now();
          userState.expecting = false; // Stop expecting replies after selection
        } else {
          reply("❌ Please reply with a valid number (1-10) to select a category.");
        }
      }
    } catch (e) {
      console.error("Menu navigation error:", e);
    }
  }
);

// Function to send submenus
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

☯️ *Made by P_I_K_O*`;

    await robin.sendMessage(
      from,
      {
        image: { url: config.ALIVE_IMG },
        caption: menuText,
      },
      { quoted: mek }
    );
  }
}

module.exports = { menuReplyState };
