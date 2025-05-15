const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

const videoSessions = new Map();

const resolutionMap = {
  "1": "144",
  "2": "240",
  "3": "360",
  "4": "480",
  "5": "720",
  "6": "1080",
};

// Command to search and choose video
cmd(
  {
    pattern: "video",
    react: "🎥",
    desc: "Download YouTube Video",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("*Provide a name or YouTube link.* 🎥❤️");

      const search = await yts(q);
      const data = search.videos[0];
      const url = data.url;

      // Save session to keep track of the user and video details
      videoSessions.set(from, { step: 1, url, data });

      const menu = `*❤️💟 PIKO YT VIDEO DOWNLOADER 💜*

👻 *Title* : ${data.title}
👻 *Duration* : ${data.timestamp}
👻 *Views* : ${data.views}
👻 *Uploaded* : ${data.ago}
👻 *Channel* : ${data.author.name}
👻 *Link* : ${data.url}

*Choose quality:*
1 = 144p
2 = 240p
3 = 360p
4 = 480p
5 = 720p
6 = 1080p

_Reply with the number (e.g., 1 for 144p)_`;

      // Send video details and options to the user
      await robin.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: menu },
        { quoted: mek }
      );
    } catch (e) {
      console.error(e);
      reply("❌ Failed to search for the video.");
    }
  }
);

// Follow-up responses for resolution and file type
cmd(
  {
    pattern: /.,/ // Catch all replies
    fromMe: true,
  },
  async (robin, mek, m, { from, body, reply }) => {
    const session = videoSessions.get(from);
    if (!session) return;

    // Normalize input by stripping anything that is not a number
    const input = body.trim().replace(/[^0-9]/g, "");

    // Step 1: Process resolution selection
    if (session.step === 1) {
      const quality = resolutionMap[input];
      if (!quality) return reply("❌ Invalid option. Reply with 1 to 6 for resolution.");

      session.quality = quality;
      session.step = 2;
      videoSessions.set(from, session);
      return reply(`✅ *${quality}p* selected. Now reply with \`video\` or \`doc\`.`);
    }

    // Step 2: Process file format selection (video or document)
    if (session.step === 2) {
      const inputType = body.trim().toLowerCase();
      if (!["video", "doc"].includes(inputType)) {
        return reply("❌ Invalid type. Reply with `video` or `doc`.");
      }

      const { url, quality, data } = session;

      try {
        // Prepare API
        const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=${quality}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;

        const response = await axios.get(apiUrl);
        if (!response.data || !response.data.success) {
          return reply("❌ Failed to fetch video data.");
        }

        const { id, title } = response.data;

        const progressUrl = `https://p.oceansaver.in/ajax/progress.php?id=${id}`;

        let downloadUrl = null;
        let waitTime = 0;
        while (waitTime < 60000) { // 1 min timeout
          const progRes = await axios.get(progressUrl);
          if (progRes.data.success && progRes.data.progress === 1000) {
            downloadUrl = progRes.data.download_url;
            break;
          }
          await new Promise((res) => setTimeout(res, 4000));
          waitTime += 4000;
        }

        if (!downloadUrl) {
          videoSessions.delete(from);
          return reply("❌ Video conversion timed out.");
        }

        const videoBuffer = await axios.get(downloadUrl, {
          responseType: "arraybuffer",
        });

        const filename = `${title}_${quality}p.mp4`;

        if (inputType === "doc") {
          await robin.sendMessage(
            from,
            {
              document: videoBuffer.data,
              fileName: filename,
              mimetype: "video/mp4",
              caption: "📁 Sent as document",
            },
            { quoted: mek }
          );
        } else {
          await robin.sendMessage(
            from,
            {
              video: videoBuffer.data,
              mimetype: "video/mp4",
              caption: `🎬 *${title}* - ${quality}p`,
            },
            { quoted: mek }
          );
        }

        videoSessions.delete(from);
        return reply("✅ Video sent. Thanks for using PIKO Bot 💜");

      } catch (err) {
        console.error(err);
        videoSessions.delete(from);
        return reply("❌ Error during download.");
      }
    }
  }
);
