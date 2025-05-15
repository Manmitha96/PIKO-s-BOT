const { cmd } = require("../command");
const yts = require("yt-search");
const { ytmp4 } = require("@vreden/youtube_scraper");

const videoSessions = new Map(); // Store sessions by user

const resolutionMap = {
  "1": "144",
  "2": "240",
  "3": "360",
  "4": "480",
  "5": "720",
  "6": "1080",
};

// Step 1: Search for video and ask resolution
cmd(
  {
    pattern: "video",
    react: "🎶",
    desc: "Download YouTube Video",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("*Please provide a video name or link.* ❤️");

      const search = await yts(q);
      const data = search.videos[0];
      const url = data.url;

      // Save session step 1
      videoSessions.set(from, { step: 1, url, data });
      console.log("SESSION DATA:", session);


      let menu = `*🎬 Select a resolution:*\n\n`;
      menu += `1 = 144p\n2 = 240p\n3 = 360p\n4 = 480p\n5 = 720p\n6 = 1080p\n\n`;
      menu += `_Reply with a number (e.g. 1 for 144p)_`;

      await robin.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: menu },
        { quoted: mek }
      );
    } catch (e) {
      console.log(e);
      reply("❌ Failed to search for the video.");
    }
  }
);

// Step 2 & 3: Resolution number and doc/video selection
cmd(
  {
    pattern: /.*/, // Listen to all messages
    fromMe: false,
  },
  async (robin, mek, m, { from, body, reply }) => {
    const session = videoSessions.get(from);
    if (!session) return;

    const input = body.trim().toLowerCase();

    // DEBUG
    console.log("SESSION DATA:", session);

    // Step 1: Handle number-based resolution
    if (session.step === 1) {
      const res = resolutionMap[input];
      if (!res) return reply("❌ Invalid number. Please reply with 1 to 6.");

      session.resolution = res;
      session.step = 2;
      videoSessions.set(from, session);

      return reply(`✅ Resolution *${res}p* selected.\n\nNow reply with \`doc\` or \`video\``);
    }

    // Step 2: Handle format (doc or video)
    if (session.step === 2) {
      const { resolution, url, data } = session;

      if (!["doc", "video"].includes(input)) {
        return reply("❌ Invalid option. Please reply with `doc` or `video`.");
      }

      try {
        let durationParts = data.timestamp.split(":").map(Number);
        let totalSeconds =
          durationParts.length === 3
            ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
            : durationParts[0] * 60 + durationParts[1];

        if (totalSeconds > 1800) {
          videoSessions.delete(from);
          return reply("⏱️ Sorry, video must be less than 30 minutes.");
        }

        const videoData = await ytmp4(url, resolution);
        if (!videoData?.download?.url) {
          return reply(`❌ Couldn't fetch ${resolution}p video. Try another resolution.`);
        }

        const fileUrl = videoData.download.url;
        const fileName = `${data.title}_${resolution}p.mp4`;

        if (input === "doc") {
          await robin.sendMessage(
            from,
            {
              document: { url: fileUrl },
              mimetype: "video/mp4",
              fileName,
              caption: "📁 Here is your video as a *document*.",
            },
            { quoted: mek }
          );
        } else {
          await robin.sendMessage(
            from,
            {
              video: { url: fileUrl },
              mimetype: "video/mp4",
              caption: "🎬 Here is your video file.",
            },
            { quoted: mek }
          );
        }

        reply("✅ Video sent successfully!");
        videoSessions.delete(from);
      } catch (e) {
        console.error(e);
        reply("❌ Error downloading the video.");
        videoSessions.delete(from);
      }
    }
  }
);
