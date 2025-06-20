const { cmd } = require("../command");
const config = require("../config");
const os = require("os");

let menuReplyState = {};

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h} hours, ${m} minutes, ${s} seconds`;
};

// Submenus
const categoryMenus = {
  "1": "⚔️ *Main Commands*\n\n.menu\n.ping\n.alive",

  "2": `*HELLO* @M
*╭─「 ᴄᴏᴍᴍᴀɴᴅꜱ ᴘᴀɴᴇʟ」*
*│◈ 𝚁𝙰𝙼 𝚄𝚂𝙰𝙶𝙴 -* 117.71MB / 63276MB
*│◈ 𝚁𝚄𝙽𝚃𝙸𝙼𝙴 -* ${formatDuration(process.uptime())}
*╰──────────●●►*

*╭──────────●●►*
*│⚜️ DOWNLOAD Command List:*
*╰──────────●●►*

*╭──────────●●►*
*│Command:* twitter
*│Use:* .twitter < Link >
*╰──────────●●►*
*│Command:* gdrive2\n│Use:* .gdrive2 < Link >
*╰──────────●●►*
*│Command:* gdrive\n│Use:* .gdrive < Link >
*╰──────────●●►*
*│Command:* mediafire\n│Use:* .mediafire < Link >
*╰──────────●●►*
*│Command:* ig\n│Use:* .ig < Link >
*╰──────────●●►*
*│Command:* apk\n│Use:* .apk < Link or Name >
*╰──────────●●►*
*│Command:* mega\n│Use:* .mega < Link >
*╰──────────●●►*
*│Command:* tiktok\n│Use:* .tiktok < Link >
*╰──────────●●►*
*│Command:* fb\n│Use:* .fb < Link >
*╰──────────●●►*
*│Command:* modapk\n│Use:* undefined
*╰──────────●●►*
*│Command:* xnxxdown\n│Use:* .xnxxdown <query>
*╰──────────●●►*
*│Command:* xvs\n│Use:* .xvs <query>
*╰──────────●●►*
*│Command:* ringtone\n│Use:* .ringtone *<Song Name>*
*╰──────────●●►*
*│Command:* xvdown\n│Use:* .xvdown <xvideos link>
*╰──────────●●►*
*│Command:* pronhub\n│Use:* .pronhub <query>
*╰──────────●●►*
*│Command:* prondl\n│Use:* .prondl <pronhub link>
*╰──────────●●►*
*│Command:* epron\n│Use:* .eporner <query>
*╰──────────●●►*
*│Command:* epdl\n│Use:* .epdl <eporner link>
*╰──────────●●►*
*│Command:* xhamster\n│Use:* .xhamster <query>
*╰──────────●●►*
*│Command:* xhadl\n│Use:* .xhadl <eporner link>
*╰──────────●●►*
*│Command:* getrepo\n│Use:* .getrepo <GitHub Repository URL>
*╰──────────●●►*
*│Command:* img\n│Use:* .gimage *<query>*
*╰──────────●●►*
*│Command:* song\n│Use:* .song < Text or Link >
*╰──────────●●►*
*│Command:* video2\n│Use:* .video2 < Text or Link >
*╰──────────●●►*
*│Command:* video\n│Use:* .video < Text or Link >
*╰──────────●●►*
*│Command:* spotifydl\n│Use:* .spotifydl <spotify Link>
*╰──────────●●►*

➠ *Total Commands in DOWNLOAD*: 26

*Github Repo:* https://github.com/nbbb15092/abc
*㋛ 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝙰𝚂𝙸𝚃𝙷𝙰 〽️Ｄ*`,

  "3": "🔐 *Group Commands*\n\n.promote\n.demote\n.kick",
  "4": "👑 *Owner Commands*\n\n.eval\n.block\n.unblock",
  "5": "🪄 *Convert Commands*\n\n.sticker\n.photo\n.tomp3",
  "6": "🔎 *Search Commands*\n\n.google\n.github\n.lyrics",
  "7": "🧚🏻 *Anime Commands*\n\n.anime\n.manga\n.waifu",
  "8": "💫 *Fun Commands*\n\n.joke\n.meme\n.truth",
  "9": "🤖 *AI Commands*\n\n.gpt\n.gptimg\n.chatbot",
  "10": "🎲 *Other Commands*\n\n.calc\n.time\n.weather",
};

// Main menu command
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

      const caption = `👋 *Hello ${pushname}*

🕐 *Uptime:* ${uptime} minutes
📦 *RAM Usage:* ${ramUsage}

📍 *Reply to this message with a number to select a category:*

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

*_Reply with a number like (1) to get commands in that category._*

☯️ *Made by P_I_K_O*`;

      const sent = await robin.sendMessage(
        from,
        {
          image: { url: config.ALIVE_IMG },
          caption,
        },
        { quoted: mek }
      );

      menuReplyState[senderNumber] = {
        msgId: sent.key.id,
        timestamp: Date.now(),
      };
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);

// Listen for replies to the menu message
cmd(
  {
    pattern: ".*",
    filename: __filename,
  },
  async (robin, m, mek, { senderNumber, reply }) => {
    const state = menuReplyState[senderNumber];
    const quoted = m.quoted;

    if (!state || !quoted) return;
    if (Date.now() - state.timestamp > 5 * 60 * 1000) {
      delete menuReplyState[senderNumber];
      return;
    }

    const repliedMsgId = quoted.key.id;
    if (repliedMsgId !== state.msgId) return;

    const text = m.body?.trim();
    const match = text.match(/^\.?(\d{1,2})$/);
    if (!match) return;

    const category = match[1];
    const submenu = categoryMenus[category];

    if (submenu) {
      await reply(submenu);
      delete menuReplyState[senderNumber];
    } else {
      await reply("❌ Invalid number. Please reply with a number between 1 and 10.");
    }
  }
);
