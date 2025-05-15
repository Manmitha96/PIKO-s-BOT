const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

cmd(
  {
    pattern: "video",
    react: "🎥",
    desc: "Download YouTube Video",
    category: "download",
    filename: __filename,
  },
  async (
    robin, mek, m, 
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      if (!q) return reply("*Provide a name or a YouTube link.* 🎥❤️");

      // Search for the video
      const search = await yts(q);
      const data = search.videos[0];
      const url = data.url;

      // Video metadata description
      let desc = `❤️💟 PIKO YT VIDEO DOWNLOADER 💜*\n\n
👻 *Title* : ${data.title}
👻 *Duration* : ${data.timestamp}
👻 *Views* : ${data.views}
👻 *Uploaded* : ${data.ago}
👻 *Channel* : ${data.author.name}
👻 *Link* : ${data.url}\n\n
*Available Qualities:* 144p, 240p, 360p, 480p, 720p, 1080p\n\n
*Reply with your desired quality (e.g., "720p")*\n\n
𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`;

      // Send metadata and thumbnail message
      await robin.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: desc },
        { quoted: mek }
      );

      // Store video info for later use
      robin.ytdl = robin.ytdl || {};
      robin.ytdl[sender] = {
        url: url,
        title: data.title,
        timestamp: new Date().getTime()
      };

    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);

// Handle quality selection reply
cmd({ on: "text", fromMe: false }, async (robin, mek, m, { from, sender, body, reply }) => {
  try {
    // Check if this is a reply to a previous video request
    if (!robin.ytdl || !robin.ytdl[sender]) return;
    
    const quality = body.trim().toLowerCase();
    const validQualities = ["144p", "240p", "360p", "480p", "720p", "1080p"];
    
    if (!validQualities.includes(quality)) return;
    
    const videoInfo = robin.ytdl[sender];
    // Clear the stored info to prevent multiple downloads
    delete robin.ytdl[sender];
    
    // Check if the request is too old (5 minutes)
    const now = new Date().getTime();
    if (now - videoInfo.timestamp > 300000) {
      return reply("❌ Request expired. Please make a new video request.");
    }
    
    reply("*Downloading video in " + quality + "... Please wait* ⏳");
    
    // Video download function
    const downloadVideo = async (url, quality) => {
      const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=${quality.replace('p','')}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.success) {
        const { id, title } = response.data;

        // Wait for download URL generation
        const progressUrl = `https://p.oceansaver.in/ajax/progress.php?id=${id}`;
        while (true) {
          const progress = await axios.get(progressUrl);
          if (progress.data.success && progress.data.progress === 1000) {
            const videoBuffer = await axios.get(progress.data.download_url, {
              responseType: "arraybuffer",
            });
            return { buffer: videoBuffer.data, title };
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } else {
        throw new Error("Failed to fetch video details.");
      }
    };

    // Download and send video
    const video = await downloadVideo(videoInfo.url, quality);
    await robin.sendMessage(
      from,
      {
        video: video.buffer,
        caption: `🎥 *${video.title}*\n\nQuality: ${quality}\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`,
      },
      { quoted: mek }
    );

    reply("*Thanks for using my bot!* 🎥❤️");
    
  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
  }
});
