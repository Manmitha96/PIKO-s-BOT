// plugins/menu.js
const { cmd } = require("../command");
const config = require("../config");
const os = require("os");

// Store menu states temporarily
let menuReplyState = {};

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

      const madeMenu = `👋 *Hello ${pushname}*  
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
9. 🤖 AI Commands  
10. 🎲 Other Commands  

☯️ *Made by P_I_K_O*`;

      await robin.sendMessage(
        from,
        {
          image: { url: config.ALIVE_IMG },
          caption: madeMenu,
        },
        { quoted: mek }
      );

      // Save state to expect a reply
      menuReplyState[senderNumber] = {
        expecting: true,
        timestamp: Date.now(),
        messageId: mek.key.id,
      };
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);

// Listen for number replies only IF replying to menu
cmd(
  {
    pattern: "^[0-9]+$",
    react: "📄",
    desc: "Handle menu replies",
    category: "main",
    filename: __filename,
    usePrefix: false, // Important: ignore dot (.)
  },
  async (robin, mek, m, { senderNumber, reply }) => {
    const state = menuReplyState[senderNumber];

    if (
      !state ||
      !state.expecting ||
      !mek.quoted ||
      mek.quoted.key.id !== state.messageId
    ) {
      return; // Ignore if not reply to menu
    }

    // Timeout after 2 mins
    if (Date.now() - state.timestamp > 120000) {
      delete menuReplyState[senderNumber];
      return reply("⏰ Menu session expired. Type `.menu` again.");
    }

    const option = parseInt(m.body.trim());
    let subMenu = "";

    switch (option) {
      case 1:
        subMenu = `⚔️ *Main Commands*\n.menu\n.ping\n.owner\n.alive`;
        break;
      case 2:
        subMenu = `🔮 *Download Commands*\n.song [name]\n.video [name]\n.ytmp3 [link]`;
        break;
      case 3:
        subMenu = `🔐 *Group Commands*\n.kick\n.add\n.promote\n.demote`;
        break;
      case 4:
        subMenu = `👑 *Owner Commands*\n.eval\n.shutdown\n.setpp`;
        break;
      case 5:
        subMenu = `🪄 *Convert Commands*\n.sticker\n.photo\n.gif\n.mp3`;
        break;
      case 6:
        subMenu = `🔎 *Search Commands*\n.lyrics\n.image\n.google\n.github`;
        break;
      case 7:
        subMenu = `🧚🏻 *Anime Commands*\n.anime\n.manga\n.waifu`;
        break;
      case 8:
        subMenu = `💫 *Fun Commands*\n.joke\n.truth\n.dare\n.meme`;
        break;
      case 9:
        subMenu = `🤖 *AI Commands*\n.ask [question]\n.imagine [prompt]`;
        break;
      case 10:
        subMenu = `🎲 *Other Commands*\n.calc\n.remind\n.short`;
        break;
      default:
        subMenu = `❌ Invalid option. Type \`.menu\` again.`;
    }

    await reply(subMenu);
    delete menuReplyState[senderNumber]; // Clear state after reply
  }
);

module.exports = { menuReplyState };
