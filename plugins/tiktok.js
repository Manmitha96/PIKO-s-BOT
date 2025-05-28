const { cmd } = require("../command");
const { getTikTokVideoInfo } = require("../lib/tiktok-downloader-scrapper");

cmd(
  {
    pattern: "tiktok",
    alias: ["tt"],
    react: "🎵",
    desc: "Download TikTok Video (No Watermark)",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*Please provide a valid TikTok video URL!* ❌");

      // Check if the link looks like TikTok
      const tiktokRegex = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/(@[\w.-]+\/video\/\d+|\w+\/video\/\d+|\d+)/;
      if (!tiktokRegex.test(q)) {
        return reply("*Invalid TikTok URL! Please try again.* ❌");
      }

      reply("*Downloading your TikTok video (No Watermark)...* 🎥");

      const result = await getTikTokVideoInfo(q);

      if (!result || !result.video) {
        return reply("*Failed to download video. Try another link.* ❌");
      }

      const { video, title, author } = result;

      const desc = `*💫 PIKO TIKTOK DOWNLOADER 💜*

👤 *User*: ${author}
🎬 *Title*: ${title}

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O*
      `;

      await robin.sendMessage(
        from,
        {
          image: {
            url: "https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/refs/heads/main/2025051319552258.jpg",
          },
          caption: desc,
        },
        { quoted: mek }
      );

      await robin.sendMessage(
        from,
        {
          video: { url: video },
          caption: "*✨ TIKTOK NO-WATERMARK VIDEO ✨*",
        },
        { quoted: mek }
      );

      return reply("*UPLOAD COMPLETED ✅*");
    } catch (e) {
      console.error(e);
      reply(`*Error:* ${e.message || e}`);
    }
  }
);
