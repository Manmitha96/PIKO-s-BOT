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
      videoSessions.set(from, { 
        step: 1, 
        url, 
        data,
        timestamp: Date.now()
      });

      const menu = `*❤️💟 PIKO YT VIDEO DOWNLOADER 💜*\n\n` +
                  `👻 *Title* : ${data.title}\n` +
                  `👻 *Duration* : ${data.timestamp}\n` +
                  `👻 *Views* : ${data.views}\n` +
                  `👻 *Uploaded* : ${data.ago}\n` +
                  `👻 *Channel* : ${data.author.name}\n\n` +
                  `*Choose quality:*\n` +
                  `1 = 144p\n2 = 240p\n3 = 360p\n` +
                  `4 = 480p\n5 = 720p\n6 = 1080p\n\n` +
                  `_Reply with the number (e.g., 1 for 144p)_`;

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

// Dedicated handler for video download steps
cmd(
  {
    pattern: "vdl",
    fromMe: false,
    desc: "Handle video download steps"
  },
  async (robin, mek, m, { from, body, reply }) => {
    try {
      const session = videoSessions.get(from);
      if (!session) return;

      // Check if session is expired (5 minutes)
      if (Date.now() - session.timestamp > 300000) {
        videoSessions.delete(from);
        return reply("❌ Session expired. Please start over.");
      }

      // Step 1: Process resolution selection
      if (session.step === 1) {
        const input = body.trim().replace(/[^0-9]/g, "");
        const quality = resolutionMap[input];
        
        if (!quality) {
          return reply("❌ Invalid option. Please reply with:\n" +
                      Object.entries(resolutionMap)
                        .map(([num, res]) => `${num} = ${res}p`)
                        .join("\n"));
        }

        session.quality = quality;
        session.step = 2;
        session.timestamp = Date.now();
        videoSessions.set(from, session);
        
        return reply(`✅ *${quality}p* selected.\n\n` +
                     `Should I send this as:\n` +
                     `• *video* (playable in chat)\n` +
                     `• *doc* (file download)\n\n` +
                     `Reply with your choice`);
      }

      // Step 2: Process file format selection
      if (session.step === 2) {
        const inputType = body.trim().toLowerCase();
        if (!["video", "doc"].includes(inputType)) {
          return reply("❌ Please reply with either:\n• video\n• doc");
        }

        const { url, quality, data } = session;
        await reply("⏳ Processing your request, please wait...");

        try {
          const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=${quality}&url=${encodeURIComponent(url)}`;

          const response = await axios.get(apiUrl, { timeout: 10000 });
          if (!response.data?.success) {
            throw new Error("API request failed");
          }

          const { id, title } = response.data;
          const downloadUrl = await waitForConversion(id);

          if (!downloadUrl) {
            throw new Error("Conversion timeout");
          }

          const videoBuffer = await axios.get(downloadUrl, {
            responseType: "arraybuffer",
            timeout: 60000
          });

          const filename = `${title.substring(0, 50)}_${quality}p.mp4`
            .replace(/[^\w\s.-]/g, '');

          if (inputType === "doc") {
            await robin.sendMessage(
              from,
              {
                document: videoBuffer.data,
                fileName: filename,
                mimetype: "video/mp4",
                caption: "📁 Here's your video file"
              },
              { quoted: mek }
            );
          } else {
            await robin.sendMessage(
              from,
              {
                video: videoBuffer.data,
                mimetype: "video/mp4",
                caption: `🎬 ${title} (${quality}p)`
              },
              { quoted: mek }
            );
          }

          videoSessions.delete(from);
          return reply("✅ Download complete! Enjoy your video 🎥");

        } catch (err) {
          console.error("Download error:", err);
          videoSessions.delete(from);
          return reply("❌ Failed to process video. Please try again later.");
        }
      }
    } catch (e) {
      console.error("Handler error:", e);
      videoSessions.delete(from);
      reply("❌ An error occurred. Please start over.");
    }
  }
);

async function waitForConversion(id, timeout = 120000) {
  const startTime = Date.now();
  const progressUrl = `https://p.oceansaver.in/ajax/progress.php?id=${id}`;

  while (Date.now() - startTime < timeout) {
    try {
      const response = await axios.get(progressUrl, { timeout: 5000 });
      if (response.data?.progress === 1000) {
        return response.data.download_url;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error("Progress check error:", error);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  return null;
}
