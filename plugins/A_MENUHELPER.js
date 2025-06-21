// plugins/menu-handler.js
// Additional menu handler for better organization

const { cmd } = require("../command");

// Quick access commands for each category
const quickAccessCommands = [
  { pattern: "1", category: 1, name: "Main Commands" },
  { pattern: "2", category: 2, name: "Download Commands" },
  { pattern: "3", category: 3, name: "Group Commands" },
  { pattern: "4", category: 4, name: "Owner Commands" },
  { pattern: "5", category: 5, name: "Convert Commands" },
  { pattern: "6", category: 6, name: "Search Commands" },
  { pattern: "7", category: 7, name: "Anime Commands" },
  { pattern: "8", category: 8, name: "Fun Commands" },
  { pattern: "9", category: 9, name: "AI Commands" },
  { pattern: "10", category: 10, name: "Other Commands" }
];

// Register quick access commands
quickAccessCommands.forEach(({ pattern, category, name }) => {
  cmd(
    {
      pattern: pattern,
      react: "📋",
      desc: `Quick access to ${name}`,
      category: "menu",
      filename: __filename,
    },
    async (robin, mek, m, { from, reply }) => {
      try {
        // Import the sendSubMenu function from menu.js
        const { sendSubMenu } = require('./menu.js');
        
        // Send the appropriate submenu directly
        await sendDirectSubMenu(robin, from, category, mek, reply);
      } catch (e) {
        console.error(`Error in quick access ${pattern}:`, e);
        reply(`❌ Error loading ${name}. Please try .menu instead.`);
      }
    }
  );
});

// Direct submenu function (duplicate of the one in menu.js for independence)
async function sendDirectSubMenu(robin, from, categoryNumber, mek, reply) {
  const config = require("../config");
  
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

module.exports = { sendDirectSubMenu };
