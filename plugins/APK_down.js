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
  async (robin, mek, m, { from, reply, q }) => {
    try {
      if (!q) return reply("*Please provide an app name to search.* 📱💜");

      // First try with direct scraping
      try {
        const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(q)}`;
        const headers = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        };

        const searchResponse = await axios.get(searchUrl, { headers });
        const $ = cheerio.load(searchResponse.data);

        const firstResult = $(".search-title:first").find("a").first();
        if (!firstResult.length) {
          return reply("*No results found for your query.* 😢");
        }

        const appName = firstResult.text().trim();
        const appUrl = `https://apkpure.com${firstResult.attr("href")}/download`;

        // Fetch the download page
        const appResponse = await axios.get(appUrl, { headers });
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

        return reply(message);

      } catch (directError) {
        console.log("Direct scraping failed, trying alternative method...");
        
        // Fallback to alternative APK download site
        const alternativeUrl = `https://dlandroid.com/?s=${encodeURIComponent(q)}`;
        const headers = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        };

        const altResponse = await axios.get(alternativeUrl, { headers });
        const $ = cheerio.load(altResponse.data);

        const firstResult = $(".post-title:first").find("a").first();
        if (!firstResult.length) {
          return reply("*No results found on alternative site.* 😢");
        }

        const appName = firstResult.text().trim();
        const appPageUrl = firstResult.attr("href");

        // Fetch the app page
        const appPageResponse = await axios.get(appPageUrl, { headers });
        const $$ = cheerio.load(appPageResponse.data);

        // Find download link
        const downloadLink = $$("a[href*='download?hash=']").first().attr("href");

        if (!downloadLink) {
          return reply("*Failed to get download link from alternative site.* ❌");
        }

        const message = `📱 *APK Downloader (Alternative)* 📱

🔍 *App Name*: ${appName}
⬇️ *Download Link*: ${downloadLink}

⚠️ *Note*: Download APK files at your own risk. Make sure to scan for viruses before installing.

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

        return reply(message);
      }

    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
