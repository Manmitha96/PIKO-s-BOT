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
      let totalRam = Math.round(require('os').totalmem / 1024 / 1024);
      let ramUsage = `${Math.round(used * 100) / 100}MB / ${totalRam}MB`;

      // Convert uptime to hours, minutes, seconds
      let uptimeSeconds = Math.floor(process.uptime());
      let hours = Math.floor(uptimeSeconds / 3600);
      let minutes = Math.floor((uptimeSeconds % 3600) / 60);
      let seconds = uptimeSeconds % 60;
      let formattedUptime = hours > 0 ? `${hours} hours, ${minutes} minutes, ${seconds} seconds` : `${minutes} minutes, ${seconds} seconds`;

      let madeMenu = `*HELLO* @${senderNumber}
*╭─「 ᴄᴏᴍᴍᴀɴᴅꜱ ᴘᴀɴᴇʟ」*
*│◈ 𝚁𝙰𝙼 𝚄𝚂𝙰𝙶𝙴 -* ${ramUsage}
*│◈ 𝚁𝚄𝙽𝚃𝙸𝙼𝙴 -* ${formattedUptime}
*╰──────────●●►*

*╭──────────●●►*
*│⛵ LIST MENU*
*│   ───────*
*│ 1   OWNER*
*│ 2   MAIN*
*│ 3   DOWNLOAD*
*│ 4   SEARCH*
*│ 5   AI*
*│ 6   CONVERT*
*│ 7   MATHTOOL*
*│ 8   GROUP*
*│ 9   STICKER*
*│ 10   GAME*
*╰───────────●●►*

*🌟 Reply the Number you want to select*

*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙿_𝙸_𝙺_𝙾 〽️*`;

      const menuMessage = await robin.sendMessage(
        from,
        {
          image: { url: config.MAINMENU_IMG },
          caption: madeMenu,
          contextInfo: {
            mentionedJid: [`${senderNumber}@s.whatsapp.net`]
          }
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

// Enhanced menu navigation handler - REPLY ONLY
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

      // 🎯 CRITICAL: Only accept if this is a REPLY to a menu message
      if (!quoted) return; // Must be a reply

      // Check if replying to any menu message
      const isReplyToMenu = quoted.id === userState.messageId || 
                           quoted.id === userState.lastMenuMessageId;
      
      if (!isReplyToMenu) return; // Must reply to menu message

      // Parse the user input
      const userInput = body.trim();
      const selected = parseInt(userInput);

      // Validate number selection (1-10)
      if (!isNaN(selected) && selected >= 1 && selected <= 10) {
        // Send the appropriate submenu
        const submenuMessage = await sendSubMenu(robin, from, selected, mek, reply, senderNumber);
        
        // Update user state but KEEP expecting more replies
        userState.timestamp = Date.now(); // Refresh the 8-minute timer
        userState.expecting = true; // Keep expecting replies!
        userState.lastMenuMessageId = submenuMessage.key.id; // Track latest message
        
        console.log(`📋 User ${senderNumber} selected menu ${selected} via REPLY - Menu still active`);
      } else {
        reply("❌ Please reply with a valid number (1-10) to select a category.");
      }
    } catch (e) {
      console.error("Menu navigation error:", e);
    }
  }
);

// Enhanced submenu function that returns message info
async function sendSubMenu(robin, from, categoryNumber, mek, reply, senderNumber) {
  let uptime = (process.uptime() / 60).toFixed(2);
  let used = process.memoryUsage().heapUsed / 1024 / 1024;
  let totalRam = Math.round(require('os').totalmem / 1024 / 1024);
  let ramUsage = `${Math.round(used * 100) / 100}MB / ${totalRam}MB`;

  // Convert uptime to hours, minutes, seconds
  let uptimeSeconds = Math.floor(process.uptime());
  let hours = Math.floor(uptimeSeconds / 3600);
  let minutes = Math.floor((uptimeSeconds % 3600) / 60);
  let seconds = uptimeSeconds % 60;
  let formattedUptime = hours > 0 ? `${hours} hours, ${minutes} minutes, ${seconds} seconds` : `${minutes} minutes, ${seconds} seconds`;

  const subMenus = {
    1: {
      title: "OWNER",
      image: "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/IMG-20250427-WA0142.jpg",
      commands: [
        { name: "restart", use: ".restart" },
        { name: "block", use: ".block <reply to user>" },
        { name: "left", use: ".left" },
        { name: "update", use: ".update" }
      ]
    },
    2: {
      title: "MAIN",
      image: "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/2025051419391432.jpg",
      commands: [
        { name: "alive", use: ".alive" },
        { name: "menu", use: ".menu" },
        { name: "ping", use: ".ping" },
        { name: "system", use: ".system" }
      ]
    },
    3: {
      title: "DOWNLOAD",
      image: "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/IMG-20250427-WA0144.jpg",
      commands: [
        { name: "song", use: ".song < Text or Link >" },
        { name: "video", use: ".video < Text or Link >" },
        { name: "fb", use: ".fb < Link >" },
        { name: "tiktok", use: ".tiktok < Link >" },
        { name: "igpost", use: ".igpost < Link >" },
        { name: "igvideo", use: ".igvideo < Link >" },
        { name: "ytshort", use: ".ytshort < Link >" },
        { name: "movie", use: ".movie < Movie Name >" }
      ]
    },
    4: {
      title: "SEARCH",
      image: "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/2025051319552258.jpg",
      commands: [
        { name: "githubstalk", use: ".githubstalk < username >" },
        { name: "Coming soon..", use: ".Coming soon.." }
      ]
    },
    5: {
      title: "AI",
      image: "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/IMG-20250427-WA0142.jpg",
      commands: [
        { name: "ai", use: ".ai < text >" },
        { name: "gemini", use: ".gemini < text >" },
        { name: "imagine", use: ".imagine < text >" },
        { name: "aivideoframes", use: ".aivideoframes < text >" },
        { name: "aislideshow", use: ".aislideshow < text >" },
        { name: "vidpreview", use: ".vidpreview < text >" },
        { name: "aigifframes", use: ".aigifframes < text >" }
      ]
    },
    6: {
      title: "CONVERT",
      image: "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/2025051419391432.jpg",
      commands: [
        { name: "tosticker", use: ".tosticker <reply to image>" },
        { name: "toimg", use: ".toimg <reply to sticker>" },
        { name: "vv", use: ".vv <reply to view once>" }
      ]
    },
    7: {
      title: "MATHTOOL",
      image: "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/IMG-20250427-WA0144.jpg",
      commands: [
        { name: "Coming soon..", use: ".Coming soon.." },
        { name: "Coming soon..", use: ".Coming soon.." }
      ]
    },
    8: {
      title: "GROUP",
      image: "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/2025051319552258.jpg",
      commands: [
        { name: "kick", use: ".kick <reply to user>" },
        { name: "add", use: ".add < number >" },
        { name: "promote", use: ".promote <reply to user>" },
        { name: "demote", use: ".demote <reply to user>" },
        { name: "mute", use: ".mute" },
        { name: "unmute", use: ".unmute" },
        { name: "dp", use: ".dp < number or reply >" }
      ]
    },
    9: {
      title: "STICKER",
      image: "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/IMG-20250427-WA0142.jpg",
      commands: [
        { name: "loli", use: ".loli" },
        { name: "waifu", use: ".waifu" },
        { name: "neko", use: ".neko" },
        { name: "megumin", use: ".megumin" },
        { name: "maid", use: ".maid" },
        { name: "awoo", use: ".awoo" }
      ]
    },
    10: {
      title: "GAME",
      image: "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/2025051419391432.jpg",
      commands: [
        { name: "hack", use: ".hack" },
        { name: "animegirl", use: ".animegirl" },
        { name: "fact", use: ".fact" },
        { name: "joke", use: ".joke" },
        { name: "dog", use: ".dog" },
        { name: "gpass", use: ".gpass < number >" },
        { name: "sh", use: ".sh" }
      ]
    }
  };

  const selectedMenu = subMenus[categoryNumber];
  if (selectedMenu) {
    let commandList = "";
    selectedMenu.commands.forEach(cmd => {
      commandList += `*╭──────────●●►*\n*│Command:* ${cmd.name}\n*│Use:* ${cmd.use}\n*╰──────────●●►*\n\n`;
    });

    const menuText = `*HELLO* @${senderNumber}
*╭─「 ᴄᴏᴍᴍᴀɴᴅꜱ ᴘᴀɴᴇʟ」*
*│◈ 𝚁𝙰𝙼 𝚄𝚂𝙰𝙶𝙴 -* ${ramUsage}
*│◈ 𝚁𝚄𝙽𝚃𝙸𝙼𝙴 -* ${formattedUptime}
*╰──────────●●►*

*╭──────────●●►*
*│⚜️ ${selectedMenu.title} Command List:*
*╰──────────●●►*

${commandList}➠ *Total Commands in ${selectedMenu.title}*: ${selectedMenu.commands.length}

*Reply with another number (1-10) for more categories!*

*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙿_𝙸_𝙺_𝙾 〽️*`;

    const submenuMessage = await robin.sendMessage(
      from,
      {
        image: { url: selectedMenu.image },
        caption: menuText,
        contextInfo: {
          mentionedJid: [`${senderNumber}@s.whatsapp.net`]
        }
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
        
        reply(`📋 *Menu Status:* Active\n⏰ *Time Left:* ${minutesLeft}m ${secondsLeft}s\n🎯 *Reply to menu with a number (1-10) to navigate!*`);
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
