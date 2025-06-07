const { cmd } = require("../command");
const { getMovies } = require("dark-yasiya-sinhalasub.lk");
const axios = require("axios");

async function getPremiumUsers() {
  const res = await axios.get("https://raw.githubusercontent.com/Manmitha96/BOT-PHOTOS/main/premium.json");
  return res.data.split(",").map((u) => u.replace(/[^0-9]/g, "") + "@s.whatsapp.net");
}

cmd(
  {
    pattern: "mv",
    react: "🎬",
    desc: "Search Sinhala-subbed movies",
    category: "movie",
    filename: __filename,
  },
  async (robin, mek, m, { q, sender, from, reply }) => {
    try {
      if (!q) return reply("🎥 *Please enter a movie name to search.*");

      const premium = await getPremiumUsers();
      if (!premium.includes(sender)) return reply("💎 *Premium feature!* Contact 0743381623");

      const PREFIX = "."; // Replace with your actual command prefix

      const results = await getMovies(q);
      if (!results.result.length) return reply("❌ *No movies found.*");

      const buttons = [
        {
          name: "single_select",
          buttonParamsJson: JSON.stringify({
            title: "🎞 Select a Movie",
            sections: [
              {
                title: "🎬 Search Results",
                highlight_label: "Click to Download",
                rows: results.result.map((v) => ({
                  title: v.title,
                  id: PREFIX + "mds " + v.link,
                })),
              },
            ],
          }),
        },
      ];

      const header = {
        header: "🎥 Sinhala Movie Search",
        footer: "Made by *P_I_K_O* ☯️",
        body: "🔽 Select a movie to get download options.",
      };

      await robin.sendButtonMessage(from, buttons, m, header);
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
