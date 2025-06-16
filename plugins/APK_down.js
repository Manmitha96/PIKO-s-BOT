const { cmd, commands } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

// Create axios instance with better headers and settings
const createAxiosInstance = () => {
  return axios.create({
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    }
  });
};

// Alternative APK sources
const apkSources = [
  {
    name: 'APKMirror',
    searchUrl: 'https://www.apkmirror.com/?s=',
    selector: '.appRow',
    titleSelector: '.appRowTitle a',
    linkSelector: '.appRowTitle a'
  },
  {
    name: 'APKPure',
    searchUrl: 'https://apkpure.com/search?q=',
    selector: '.search-dl',
    titleSelector: '.p1',
    linkSelector: 'a'
  }
];

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

      // Try alternative method using APK download API
      try {
        const searchQuery = encodeURIComponent(q);
        
        // Method 1: Try direct APK download service
        const apiUrl = `https://api.apkdl.in/apk/search?q=${searchQuery}`;
        
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.get(apiUrl);
        
        if (response.data && response.data.results && response.data.results.length > 0) {
          const app = response.data.results[0];
          
          let desc = `
*📱💜 PIKO APK DOWNLOADER 💜📱*

👻 *App Name* : ${app.name || q}
👻 *Package* : ${app.package || 'Unknown'}
👻 *Version* : ${app.version || 'Latest'}
👻 *Size* : ${app.size || 'Unknown'}

⏳ *Getting download link...* Please wait...

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜
`;

          await robin.sendMessage(from, { text: desc }, { quoted: mek });

          // Get download link
          const downloadUrl = app.download_url || app.url;
          
          if (downloadUrl) {
            // Send APK as document
            await robin.sendMessage(
              from,
              {
                document: { url: downloadUrl },
                mimetype: "application/vnd.android.package-archive",
                fileName: `${app.name.replace(/[^a-zA-Z0-9]/g, '_')}.apk`,
                caption: `📱 *${app.name}*\n\n⚠️ *Install at your own risk*\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`,
              },
              { quoted: mek }
            );

            return reply("*APK DOWNLOAD COMPLETED* ✅\n\n⚠️ *Security Notice:*\n• Only install APKs from trusted sources\n• Enable 'Unknown Sources' in Android settings to install\n• Scan with antivirus before installing");
          }
        }
      } catch (apiError) {
        console.log("API method failed, trying alternative...");
      }

      // Method 2: Try alternative APK site
      try {
        const searchUrl = `https://apk-dl.com/search?q=${encodeURIComponent(q)}`;
        const axiosInstance = createAxiosInstance();
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const searchResponse = await axiosInstance.get(searchUrl);
        const $ = cheerio.load(searchResponse.data);
        
        const firstResult = $('.result-item').first();
        
        if (firstResult.length > 0) {
          const appName = firstResult.find('.app-name').text().trim() || q;
          const appLink = firstResult.find('a').attr('href');
          
          if (appLink) {
            let desc = `
*📱💜 PIKO APK DOWNLOADER 💜📱*

👻 *App Name* : ${appName}
👻 *Status* : Found
👻 *Source* : APK-DL

⏳ *Preparing download...* Please wait...

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜
`;

            await robin.sendMessage(from, { text: desc }, { quoted: mek });

            // Get the actual download page
            const fullUrl = appLink.startsWith('http') ? appLink : `https://apk-dl.com${appLink}`;
            const appResponse = await axiosInstance.get(fullUrl);
            const appPage = cheerio.load(appResponse.data);
            
            const downloadLink = appPage('.download-btn').attr('href') || appPage('a[href*=".apk"]').attr('href');
            
            if (downloadLink) {
              const finalUrl = downloadLink.startsWith('http') ? downloadLink : `https://apk-dl.com${downloadLink}`;
              
              // Send APK as document
              await robin.sendMessage(
                from,
                {
                  document: { url: finalUrl },
                  mimetype: "application/vnd.android.package-archive",
                  fileName: `${appName.replace(/[^a-zA-Z0-9]/g, '_')}.apk`,
                  caption: `📱 *${appName}*\n\n⚠️ *Install at your own risk*\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`,
                },
                { quoted: mek }
              );

              return reply("*APK DOWNLOAD COMPLETED* ✅\n\n⚠️ *Security Notice:*\n• Only install APKs from trusted sources\n• Enable 'Unknown Sources' in Android settings to install\n• Scan with antivirus before installing");
            }
          }
        }
      } catch (altError) {
        console.log("Alternative method failed:", altError.message);
      }

      // Method 3: Provide manual download instructions
      const manualInstructions = `
*📱 APK SEARCH RESULTS 📱*

❌ *Automatic download temporarily unavailable*

*Manual Download Options:*

1️⃣ **APKPure**: https://apkpure.com/search?q=${encodeURIComponent(q)}
2️⃣ **APKMirror**: https://www.apkmirror.com/?s=${encodeURIComponent(q)}
3️⃣ **Uptodown**: https://en.uptodown.com/android/search/${encodeURIComponent(q)}

*How to download manually:*
• Click any link above
• Search for "${q}"
• Download the APK file
• Install on your device

⚠️ *Always download from trusted sources only!*

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜
`;

      return reply(manualInstructions);

    } catch (e) {
      console.log("APK Download Error:", e);
      
      const errorMsg = `❌ *APK Download Error*

*Possible reasons:*
• App not found
• Server temporarily unavailable
• Network connection issues

*Try these alternatives:*
1️⃣ Search with exact app name
2️⃣ Try: .apkinfo ${q}
3️⃣ Manual download from:
   • https://apkpure.com
   • https://apkmirror.com

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`;

      return reply(errorMsg);
    }
  }
);

// APK Info command (more reliable)
cmd(
  {
    pattern: "apkinfo",
    react: "ℹ️",
    desc: "Get APK information and download links",
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

      const searchQuery = encodeURIComponent(q);
      
      let infoMessage = `*📱 APK SEARCH RESULTS FOR: ${q.toUpperCase()} 📱*\n\n`;
      
      // Provide multiple reliable sources
      infoMessage += `*🔗 Download Sources:*\n\n`;
      
      infoMessage += `*1. APKPure*\n`;
      infoMessage += `   🔗 https://apkpure.com/search?q=${searchQuery}\n`;
      infoMessage += `   ✅ Most popular APK site\n\n`;
      
      infoMessage += `*2. APKMirror*\n`;
      infoMessage += `   🔗 https://www.apkmirror.com/?s=${searchQuery}\n`;
      infoMessage += `   ✅ Trusted by developers\n\n`;
      
      infoMessage += `*3. Uptodown*\n`;
      infoMessage += `   🔗 https://en.uptodown.com/android/search/${searchQuery}\n`;
      infoMessage += `   ✅ Multiple versions available\n\n`;
      
      infoMessage += `*4. APKCombo*\n`;
      infoMessage += `   🔗 https://apkcombo.com/search/${searchQuery}\n`;
      infoMessage += `   ✅ Fast downloads\n\n`;
      
      infoMessage += `*📋 Instructions:*\n`;
      infoMessage += `• Click any link above\n`;
      infoMessage += `• Search for "${q}"\n`;
      infoMessage += `• Download the APK file\n`;
      infoMessage += `• Enable "Unknown Sources" in Android settings\n`;
      infoMessage += `• Install the APK\n\n`;
      
      infoMessage += `⚠️ *Security Tips:*\n`;
      infoMessage += `• Only download from trusted sources\n`;
      infoMessage += `• Check app permissions before installing\n`;
      infoMessage += `• Scan with antivirus if possible\n\n`;
      
      infoMessage += `💡 *To try auto-download:* .apk ${q}\n\n`;
      infoMessage += `𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`;

      return reply(infoMessage);

    } catch (e) {
      console.log("APK Info Error:", e);
      return reply(`❌ *Error getting APK info:* ${e.message}\n\nTry searching with a different app name.`);
    }
  }
);

// APK search command for finding specific apps
cmd(
  {
    pattern: "apksearch",
    react: "🔍",
    desc: "Search for APK with multiple results",
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
      if (!q) return reply("*Please provide an app name to search* 🔍\n\nExample: .apksearch facebook");

      reply("🔍 *Searching APK databases...* Please wait...");

      const searchQuery = encodeURIComponent(q);
      
      let searchMessage = `*🔍 APK SEARCH: ${q.toUpperCase()}*\n\n`;
      
      // Popular apps suggestions based on search term
      const suggestions = {
        'facebook': ['Facebook', 'Facebook Lite', 'Facebook Messenger', 'Facebook Business'],
        'whatsapp': ['WhatsApp', 'WhatsApp Business', 'WhatsApp Web'],
        'instagram': ['Instagram', 'Instagram Lite', 'Instagram Business'],
        'youtube': ['YouTube', 'YouTube Music', 'YouTube TV', 'YouTube Kids'],
        'tiktok': ['TikTok', 'TikTok Lite'],
        'telegram': ['Telegram', 'Telegram X'],
        'spotify': ['Spotify', 'Spotify Lite'],
        'netflix': ['Netflix'],
        'twitter': ['Twitter', 'Twitter Lite'],
        'snapchat': ['Snapchat']
      };
      
      const lowerQ = q.toLowerCase();
      let foundSuggestions = [];
      
      for (const [key, apps] of Object.entries(suggestions)) {
        if (lowerQ.includes(key) || key.includes(lowerQ)) {
          foundSuggestions = apps;
          break;
        }
      }
      
      if (foundSuggestions.length > 0) {
        searchMessage += `*📱 Popular ${q} Apps:*\n`;
        foundSuggestions.forEach((app, index) => {
          searchMessage += `${index + 1}. ${app}\n`;
        });
        searchMessage += `\n`;
      }
      
      searchMessage += `*🔗 Search Links:*\n\n`;
      searchMessage += `*APKPure:*\nhttps://apkpure.com/search?q=${searchQuery}\n\n`;
      searchMessage += `*APKMirror:*\nhttps://www.apkmirror.com/?s=${searchQuery}\n\n`;
      searchMessage += `*Uptodown:*\nhttps://en.uptodown.com/android/search/${searchQuery}\n\n`;
      
      searchMessage += `*💡 Quick Commands:*\n`;
      searchMessage += `• .apk ${q} - Try auto download\n`;
      searchMessage += `• .apkinfo ${q} - Get detailed info\n\n`;
      
      searchMessage += `𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`;

      return reply(searchMessage);

    } catch (e) {
      console.log("APK Search Error:", e);
      return reply(`❌ *Error searching APK:* ${e.message}\n\nTry with a different search term.`);
    }
  }
);
