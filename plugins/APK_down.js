const { cmd, commands } = require("../command");
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
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*Please provide an app name to search* 📱\n\nExample: .apk facebook");

      reply("🔍 *Searching for APK...* Please wait...");

      // Search for APK on APKPure
      const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(q)}`;
      
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(searchResponse.data);
      const firstResult = $('.search-dl').first();
      
      if (firstResult.length === 0) {
        return reply("❌ *No APK found for:* " + q + "\n\nTry searching with a different name.");
      }

      const appLink = firstResult.find('a').attr('href');
      const appName = firstResult.find('.p1').text().trim();
      const appDeveloper = firstResult.find('.p2').text().trim();
      const appIcon = firstResult.find('img').attr('src');

      if (!appLink) {
        return reply("❌ *Could not find download link for:* " + q);
      }

      // Get app details page
      const appUrl = `https://apkpure.com${appLink}`;
      const appResponse = await axios.get(appUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const appPage = cheerio.load(appResponse.data);
      const downloadLink = appPage('.download-btn').attr('href');
      const appVersion = appPage('.details-sdk span').first().text().trim();
      const appSize = appPage('.details-sdk span').eq(1).text().trim();
      const appRating = appPage('.stars span').text().trim();

      if (!downloadLink) {
        return reply("❌ *Could not find download link for:* " + appName);
      }

      // Get final download URL
      const finalDownloadUrl = `https://apkpure.com${downloadLink}`;
      const downloadResponse = await axios.get(finalDownloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const downloadPage = cheerio.load(downloadResponse.data);
      const directDownloadUrl = downloadPage('#download_link').attr('href');

      if (!directDownloadUrl) {
        return reply("❌ *Could not get direct download link for:* " + appName);
      }

      // App details message
      let desc = `
*📱💜 PIKO APK DOWNLOADER 💜📱*

👻 *App Name* : ${appName}
👻 *Developer* : ${appDeveloper}
👻 *Version* : ${appVersion || 'Unknown'}
👻 *Size* : ${appSize || 'Unknown'}
👻 *Rating* : ${appRating || 'Unknown'}
👻 *Download Link* : ${appUrl}

⏳ *Downloading APK...* Please wait...

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜
`;

      // Send app details with icon
      if (appIcon) {
        await robin.sendMessage(
          from,
          { image: { url: appIcon }, caption: desc },
          { quoted: mek }
        );
      } else {
        await robin.sendMessage(from, { text: desc }, { quoted: mek });
      }

      // Check file size before downloading
      try {
        const headResponse = await axios.head(directDownloadUrl);
        const fileSize = parseInt(headResponse.headers['content-length']);
        
        // Limit file size to 100MB (100 * 1024 * 1024 bytes)
        if (fileSize > 104857600) {
          return reply("❌ *File too large!* APK size exceeds 100MB limit.\n\nPlease download manually from: " + appUrl);
        }
      } catch (e) {
        console.log("Could not check file size:", e.message);
      }

      // Download and send APK file
      const apkResponse = await axios.get(directDownloadUrl, {
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      // Send APK as document
      await robin.sendMessage(
        from,
        {
          document: { stream: apkResponse.data },
          mimetype: "application/vnd.android.package-archive",
          fileName: `${appName.replace(/[^a-zA-Z0-9]/g, '_')}.apk`,
          caption: `📱 *${appName}*\n\n⚠️ *Install at your own risk*\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`,
        },
        { quoted: mek }
      );

      return reply("*APK DOWNLOAD COMPLETED* ✅\n\n⚠️ *Security Notice:*\n• Only install APKs from trusted sources\n• Enable 'Unknown Sources' in Android settings to install\n• Scan with antivirus before installing");

    } catch (e) {
      console.log("APK Download Error:", e);
      
      if (e.message.includes('timeout')) {
        return reply("⏱️ *Download timeout!* The APK file might be too large or server is slow.\n\nTry again later or search for a different app.");
      } else if (e.message.includes('Network Error')) {
        return reply("🌐 *Network Error!* Please check your internet connection and try again.");
      } else {
        return reply(`❌ *Error downloading APK:* ${e.message}\n\nTry searching with a different app name.`);
      }
    }
  }
);

// Additional command for APK info only (without download)
cmd(
  {
    pattern: "apkinfo",
    react: "ℹ️",
    desc: "Get APK information without downloading",
    category: "search",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*Please provide an app name to get info* ℹ️\n\nExample: .apkinfo facebook");

      reply("🔍 *Getting APK info...* Please wait...");

      // Search for APK on APKPure
      const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(q)}`;
      
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(searchResponse.data);
      const results = $('.search-dl').slice(0, 5); // Get top 5 results
      
      if (results.length === 0) {
        return reply("❌ *No APK found for:* " + q + "\n\nTry searching with a different name.");
      }

      let infoMessage = `*📱 APK SEARCH RESULTS FOR: ${q.toUpperCase()} 📱*\n\n`;
      
      results.each((index, element) => {
        const appName = $(element).find('.p1').text().trim();
        const appDeveloper = $(element).find('.p2').text().trim();
        const appLink = $(element).find('a').attr('href');
        
        infoMessage += `*${index + 1}.* ${appName}\n`;
        infoMessage += `   👨‍💻 *Developer:* ${appDeveloper}\n`;
        infoMessage += `   🔗 *Link:* https://apkpure.com${appLink}\n\n`;
      });

      infoMessage += `💡 *To download, use:* .apk ${q}\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`;

      return reply(infoMessage);

    } catch (e) {
      console.log("APK Info Error:", e);
      return reply(`❌ *Error getting APK info:* ${e.message}\n\nTry searching with a different app name.`);
    }
  }
);
