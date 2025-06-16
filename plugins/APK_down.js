const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

cmd(
  {
    pattern: "apk",
    react: "📱",
    desc: "Download APK files from APKPure",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      if (!q) return reply("*Please provide an app name to search.* 📱💜");

      // Search for the app on APKPure
      const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(q)}`;
      const searchResponse = await axios.get(searchUrl);
      const $ = cheerio.load(searchResponse.data);

      // Get the first search result
      const firstResult = $(".search-title:first").find("a").first();
      if (!firstResult.length) {
        return reply("*No results found for your query.* 😢");
      }

      const appName = firstResult.text().trim();
      const appUrl = `https://apkpure.com${firstResult.attr("href")}/download`;

      // Fetch the download page
      const appResponse = await axios.get(appUrl);
      const $$ = cheerio.load(appResponse.data);

      // Get download link and version info
      const downloadLink = $$(".download-btn:first").attr("href");
      const version = $$(".details-sdk:first").text().trim();
      const size = $$(".details-size:first").text().trim();
      const updateDate = $$(".details-update:first").text().trim();

      if (!downloadLink) {
        return reply("*Failed to get download link for this app.* ❌");
      }

      // Construct the response message
      const message = `📱 *APK Downloader* 📱

🔍 *App Name*: ${appName}
🔄 *Version*: ${version}
📦 *Size*: ${size}
📅 *Updated*: ${updateDate}

⬇️ *Download Link*: ${downloadLink}

⚠️ *Note*: Download APK files at your own risk. Make sure to scan for viruses before installing.

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

      // Send the app information with download link
      await robin.sendMessage(
        from,
        { text: message },
        { quoted: mek }
      );

    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
