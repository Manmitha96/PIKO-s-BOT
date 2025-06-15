const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "ig",
    react: "📱",
    desc: "Download YouTube Shorts",
    category: "download",
    filename: __filename,
  },
  async function handleInstagram(robin, mek, from, input, reply) {
  try {
    const apiUrl = `https://api.instagramdownloader.com/download?url=${encodeURIComponent(input)}`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.success) {
      const data = response.data.data;
      
      let desc = `📸 *PIKO INSTAGRAM DOWNLOADER* 📸
👻 Caption: ${data.caption || 'No caption'}
👻 Type: ${data.type || 'Post'}
👻 Username: ${data.username || 'Unknown'}
👻 Link: ${input}

𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️`;

      if (data.type === 'video') {
        await robin.sendMessage(
          from,
          {
            video: { url: data.download_url },
            caption: desc
          },
          { quoted: mek }
        );
      } else {
        await robin.sendMessage(
          from,
          {
            image: { url: data.download_url },
            caption: desc
          },
          { quoted: mek }
        );
      }

      reply("✅ *Instagram content downloaded successfully!* 📸💜");
    } else {
      throw new Error("Failed to fetch Instagram content");
    }
  } catch (error) {
    throw new Error(`Instagram download failed: ${error.message}`);
  }
}
