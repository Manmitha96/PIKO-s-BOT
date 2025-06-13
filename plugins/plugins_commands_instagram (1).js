const { cmd } = require("../command");
// Replace with a real Instagram downloader package or API
const { getInstaVideoInfo } = require("instagram-url-direct");

cmd(
  {
    pattern: "insta",
    alias: ["instagram", "ig"],
    react: "📸",
    desc: "Download Instagram Video",
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
      if (!q) return reply("*Please provide a valid Instagram video URL!* ❌");

      // Validate the Instagram URL format
      const instaRegex = /(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv)\/[A-Za-z0-9_\-]+/;
      if (!instaRegex.test(q))
        return reply("*Invalid Instagram URL! Please check and try again.* ❌");

      reply("*Downloading your video...* ⏳💖");

      const result = await getInstaVideoInfo(q);

      if (!result || !result.url) {
        return reply("*Failed to download video. Please try again later.* 🌚");
      }

      // Prepare and send the message with video details
      let desc = `*💟 PIKO INSTA VIDEO DOWNLOADER 💜*

👑 *Type*: ${result.type || "Video"}
📸 *User*: ${result.username || "Unknown"}

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
        { video: { url: result.url }, caption: "*----------INSTA VIDEO----------*" },
        { quoted: mek }
      );

      return reply("*UPLOAD COMPLETED* ✅");
    } catch (e) {
      console.error(e);
      reply(`*Error:* ${e.message || e}`);
    }
  }
);
