const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "ig",
    react: "📸",
    desc: "Download Instagram Post, Reel, or Video",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, q, reply }
  ) => {
    try {
      if (!q) return reply("*Provide an Instagram post/reel/video link.* 💜");

      // RapidAPI endpoint and key
      const apiUrl = "https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/ics/post";
      const apiKey = "96e8da0069msh691a5d3aac5b0b1p116e57jsn274dec1d7491"; // Your RapidAPI key

      const { data } = await axios.get(apiUrl, {
        params: { url: q },
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com",
        },
      });

      if (!data || !data.data) {
        return reply("❌ Failed to fetch media. Make sure the link is correct and public.");
      }

      const ig = data.data;
      let desc = `💜 *PIKO INSTAGRAM DOWNLOADER* 💜

👤 *Author*: ${ig.username || ""}
📝 *Caption*: ${ig.caption || ""}

🔗 *Post Link*: ${q}

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️
`;

      // Send thumbnail and info if available
      if (ig.thumbnail) {
        await robin.sendMessage(
          from,
          { image: { url: ig.thumbnail }, caption: desc },
          { quoted: mek }
        );
      } else {
        await reply(desc);
      }

      // Handle multiple media (carousel)
      if (Array.isArray(ig.medias) && ig.medias.length > 0) {
        for (const [i, media] of ig.medias.entries()) {
          if (media.type === "image") {
            await robin.sendMessage(
              from,
              {
                image: { url: media.url },
                caption: i === 0 ? `📸 *Instagram Carousel*\n${ig.medias.length} images\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️` : undefined,
              },
              { quoted: mek }
            );
          } else if (media.type === "video") {
            // Fetch video buffer for reliability
            const videoBuffer = await axios.get(media.url, { responseType: "arraybuffer" });
            await robin.sendMessage(
              from,
              {
                video: videoBuffer.data,
                caption: i === 0 ? `🎬 *Instagram Carousel Video*\n${ig.medias.length} posts\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️` : undefined,
              },
              { quoted: mek }
            );
          }
        }
        return reply("*Sent all Instagram media!* 💙");
      }

      // Single media
      if (ig.type === "image" && ig.url) {
        await robin.sendMessage(
          from,
          { image: { url: ig.url } },
          { quoted: mek }
        );
      } else if (ig.type === "video" && ig.url) {
        const videoBuffer = await axios.get(ig.url, { responseType: "arraybuffer" });
        await robin.sendMessage(
          from,
          { video: videoBuffer.data },
          { quoted: mek }
        );
      }

      reply("*Thanks for using my Instagram downloader!* 💙");
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
