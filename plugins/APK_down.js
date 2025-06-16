const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

cmd(
  {
    pattern: "apk",
    react: "📱",
    desc: "Download APK files",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m) => {
    try {
      if (!m.q) return robin.sendMessage(m.from, { text: "*Please provide an app name*\n\nExample: .apk facebook" }, { quoted: mek });

      await robin.sendMessage(m.from, { text: "🔍 *Searching for APK...* Please wait..." }, { quoted: mek });

      // 1. First try APKCombo
      let result = await tryAPKCombo(m.q);
      if (!result.success) {
        // 2. Fallback to APKPure
        result = await tryAPKPure(m.q);
      }

      if (result.success) {
        // Send app info
        const infoMsg = `
📱 *${result.appName}* APK

🔹 *Version:* ${result.version || "Latest"}
🔹 *Size:* ${result.size || "Unknown"}
🔹 *Source:* ${result.source}

⬇️ *Downloading...* Please wait...
        `;

        if (result.icon) {
          await robin.sendMessage(m.from, {
            image: { url: result.icon },
            caption: infoMsg
          }, { quoted: mek });
        } else {
          await robin.sendMessage(m.from, { text: infoMsg }, { quoted: mek });
        }

        // Send the APK file
        const apkResponse = await axios.get(result.downloadUrl, {
          responseType: 'stream',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
          }
        });

        await robin.sendMessage(m.from, {
          document: apkResponse.data,
          mimetype: 'application/vnd.android.package-archive',
          fileName: `${result.appName.replace(/[^a-zA-Z0-9]/g, '_')}.apk`,
          caption: `✅ *Download Complete!*\n\n${result.appName} ${result.version || ''}`
        }, { quoted: mek });

      } else {
        // If all methods fail
        robin.sendMessage(m.from, {
          text: `❌ *APK not found!*\n\nTry searching manually:\n• https://apkpure.com\n• https://apkcombo.com`
        }, { quoted: mek });
      }

    } catch (error) {
      console.error("APK Error:", error);
      robin.sendMessage(m.from, {
        text: `❌ *Error:* ${error.message}\n\nTry again later or search manually.`
      }, { quoted: mek });
    }
  }
);

// APKCombo download function
async function tryAPKCombo(appName) {
  try {
    const searchUrl = `https://apkcombo.com/search/${encodeURIComponent(appName)}`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
      }
    });

    const $ = cheerio.load(data);
    const firstApp = $('.item').first();
    
    if (firstApp.length) {
      const appTitle = firstApp.find('.title').text().trim();
      const appLink = firstApp.find('a').attr('href');
      const appIcon = firstApp.find('img').attr('src');

      if (appLink) {
        const appPageUrl = appLink.startsWith('http') ? appLink : `https://apkcombo.com${appLink}`;
        const appPage = await axios.get(appPageUrl);
        const $$ = cheerio.load(appPage.data);

        const downloadLink = $$('.download-btn').first().attr('href');
        if (downloadLink) {
          return {
            success: true,
            appName: appTitle,
            downloadUrl: downloadLink.startsWith('http') ? downloadLink : `https://apkcombo.com${downloadLink}`,
            source: 'APKCombo',
            icon: appIcon
          };
        }
      }
    }
    return { success: false };
  } catch (e) {
    return { success: false };
  }
}

// APKPure download function
async function tryAPKPure(appName) {
  try {
    const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(appName)}`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
      }
    });

    const $ = cheerio.load(data);
    const firstApp = $('.search-title:first').find('a').first();
    
    if (firstApp.length) {
      const appTitle = firstApp.attr('title');
      const appLink = firstApp.attr('href');
      const appIcon = $('.search-img:first img').attr('src');

      if (appLink) {
        const appPageUrl = `https://apkpure.com${appLink}`;
        const appPage = await axios.get(appPageUrl);
        const $$ = cheerio.load(appPage.data);

        const version = $$('.version').text().trim();
        const size = $$('.size').text().trim();
        const downloadLink = $$('.download-btn').first().attr('href');

        if (downloadLink) {
          return {
            success: true,
            appName: appTitle,
            downloadUrl: `https://apkpure.com${downloadLink}`,
            source: 'APKPure',
            version,
            size,
            icon: appIcon
          };
        }
      }
    }
    return { success: false };
  } catch (e) {
    return { success: false };
  }
}
