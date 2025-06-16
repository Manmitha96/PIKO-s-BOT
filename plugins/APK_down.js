const { cmd, commands } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

// Create axios instance with better anti-detection
const createAxiosInstance = () => {
  return axios.create({
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    }
  });
};

// Working APK download function using alternative method
async function downloadAPKAlternative(appName) {
  try {
    // Method 1: Try APKCombo API (more reliable)
    const searchUrl = `https://apkcombo.com/search/${encodeURIComponent(appName)}`;
    const axiosInstance = createAxiosInstance();
    
    // Add random delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    const response = await axiosInstance.get(searchUrl);
    const $ = cheerio.load(response.data);
    
    // Look for the first app result
    const firstApp = $('.item').first();
    if (firstApp.length > 0) {
      const appTitle = firstApp.find('.title').text().trim() || appName;
      const appLink = firstApp.find('a').attr('href');
      
      if (appLink) {
        const fullLink = appLink.startsWith('http') ? appLink : `https://apkcombo.com${appLink}`;
        
        // Get the app page to find download link
        const appPage = await axiosInstance.get(fullLink);
        const appPageHtml = cheerio.load(appPage.data);
        
        // Look for download button
        const downloadBtn = appPageHtml('.download-btn, .btn-download, [href*=".apk"]').first();
        const downloadLink = downloadBtn.attr('href');
        
        if (downloadLink) {
          const finalDownloadUrl = downloadLink.startsWith('http') ? downloadLink : `https://apkcombo.com${downloadLink}`;
          
          return {
            success: true,
            appName: appTitle,
            downloadUrl: finalDownloadUrl,
            source: 'APKCombo'
          };
        }
      }
    }
    
    return { success: false, error: 'No download link found' };
    
  } catch (error) {
    console.log('APKCombo method failed:', error.message);
    return { success: false, error: error.message };
  }
}

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

      // Try the alternative download method
      const result = await downloadAPKAlternative(q);
      
      if (result.success) {
        let desc = `
*📱💜 PIKO APK DOWNLOADER 💜📱*

👻 *App Name* : ${result.appName}
👻 *Source* : ${result.source}
👻 *Status* : Found ✅

⏳ *Preparing download...* Please wait...

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜
`;

        await robin.sendMessage(from, { text: desc }, { quoted: mek });

        try {
          // Try to send the APK file
          await robin.sendMessage(
            from,
            {
              document: { url: result.downloadUrl },
              mimetype: "application/vnd.android.package-archive",
              fileName: `${result.appName.replace(/[^a-zA-Z0-9]/g, '_')}.apk`,
              caption: `📱 *${result.appName}*\n\n⚠️ *Install at your own risk*\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`,
            },
            { quoted: mek }
          );

          return reply("*APK DOWNLOAD COMPLETED* ✅\n\n⚠️ *Security Notice:*\n• Only install APKs from trusted sources\n• Enable 'Unknown Sources' in Android settings to install\n• Scan with antivirus before installing");
          
        } catch (downloadError) {
          console.log('File download failed:', downloadError.message);
          // If file download fails, provide the direct link
          return reply(`*📱 APK FOUND BUT DIRECT DOWNLOAD FAILED*\n\n*Direct Download Link:*\n${result.downloadUrl}\n\n*App:* ${result.appName}\n*Source:* ${result.source}\n\n⚠️ *Click the link above to download manually*\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`);
        }
      }

      // If all methods fail, provide manual options
      const manualInstructions = `
*📱 APK SEARCH: ${q.toUpperCase()}*

❌ *Automatic download currently unavailable*

*📋 Manual Download Options:*

*1. APKPure* ⭐ (Most Popular)
🔗 https://apkpure.com/search?q=${encodeURIComponent(q)}

*2. APKMirror* ⭐ (Developer Trusted)
🔗 https://www.apkmirror.com/?s=${encodeURIComponent(q)}

*3. Uptodown* ⭐ (Multiple Versions)
🔗 https://en.uptodown.com/android/search/${encodeURIComponent(q)}

*4. APKCombo* ⭐ (Fast Downloads)
🔗 https://apkcombo.com/search/${encodeURIComponent(q)}

*5. F-Droid* (Open Source Apps)
🔗 https://f-droid.org/en/packages/

*📱 How to Install:*
1. Download APK from any link above
2. Enable "Unknown Sources" in Android Settings
3. Install the downloaded APK file
4. Enjoy your app! 🎉

⚠️ *Security Tips:*
• Only download from trusted sources above
• Check app permissions before installing
• Scan with antivirus if possible
• Avoid modified/cracked APKs

💡 *Try:* .apkinfo ${q} for more details

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜
`;

      return reply(manualInstructions);

    } catch (e) {
      console.log("APK Download Error:", e);
      
      const errorMsg = `❌ *APK Download Error*

*Error:* ${e.message}

*Quick Solutions:*
1️⃣ Try: .apkinfo ${q}
2️⃣ Try: .apksearch ${q}
3️⃣ Manual download from:
   • https://apkpure.com
   • https://apkmirror.com
   • https://uptodown.com

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`;

      return reply(errorMsg);
    }
  }
);

// Enhanced APK Info command
cmd(
  {
    pattern: "apkinfo",
    react: "ℹ️",
    desc: "Get comprehensive APK information and download links",
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
      if (!q) return reply("*Please provide an app name* ℹ️\n\nExample: .apkinfo facebook");

      reply("🔍 *Getting APK information...* Please wait...");

      const searchQuery = encodeURIComponent(q);
      
      let infoMessage = `*📱 COMPREHENSIVE APK INFO: ${q.toUpperCase()} 📱*\n\n`;
      
      // Popular app suggestions
      const suggestions = {
        'facebook': ['Facebook', 'Facebook Lite', 'Facebook Messenger', 'Facebook Business Suite'],
        'whatsapp': ['WhatsApp', 'WhatsApp Business', 'GB WhatsApp'],
        'instagram': ['Instagram', 'Instagram Lite', 'Instagram Business'],
        'youtube': ['YouTube', 'YouTube Music', 'YouTube TV', 'YouTube Kids', 'YouTube Vanced'],
        'tiktok': ['TikTok', 'TikTok Lite'],
        'telegram': ['Telegram', 'Telegram X'],
        'spotify': ['Spotify', 'Spotify Lite'],
        'netflix': ['Netflix'],
        'twitter': ['Twitter', 'Twitter Lite', 'X (Twitter)'],
        'snapchat': ['Snapchat'],
        'discord': ['Discord'],
        'zoom': ['Zoom', 'Zoom Cloud Meetings'],
        'pubg': ['PUBG Mobile', 'PUBG Mobile Lite'],
        'minecraft': ['Minecraft', 'Minecraft PE'],
        'chrome': ['Google Chrome', 'Chrome Beta', 'Chrome Dev']
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
        infoMessage += `*🎯 Popular ${q} Apps:*\n`;
        foundSuggestions.forEach((app, index) => {
          infoMessage += `${index + 1}. ${app}\n`;
        });
        infoMessage += `\n`;
      }
      
      infoMessage += `*🔗 TRUSTED DOWNLOAD SOURCES:*\n\n`;
      
      infoMessage += `*1. APKPure* 🥇\n`;
      infoMessage += `   🔗 https://apkpure.com/search?q=${searchQuery}\n`;
      infoMessage += `   ✅ Most popular, regularly updated\n`;
      infoMessage += `   ✅ Virus scanned, safe downloads\n\n`;
      
      infoMessage += `*2. APKMirror* 🥈\n`;
      infoMessage += `   🔗 https://www.apkmirror.com/?s=${searchQuery}\n`;
      infoMessage += `   ✅ Trusted by developers\n`;
      infoMessage += `   ✅ Original APKs, no modifications\n\n`;
      
      infoMessage += `*3. Uptodown* 🥉\n`;
      infoMessage += `   🔗 https://en.uptodown.com/android/search/${searchQuery}\n`;
      infoMessage += `   ✅ Multiple app versions available\n`;
      infoMessage += `   ✅ Detailed app information\n\n`;
      
      infoMessage += `*4. APKCombo*\n`;
      infoMessage += `   🔗 https://apkcombo.com/search/${searchQuery}\n`;
      infoMessage += `   ✅ Fast downloads\n`;
      infoMessage += `   ✅ Multiple download servers\n\n`;
      
      infoMessage += `*5. F-Droid* (Open Source)\n`;
      infoMessage += `   🔗 https://f-droid.org/en/packages/\n`;
      infoMessage += `   ✅ Open source apps only\n`;
      infoMessage += `   ✅ Privacy focused\n\n`;
      
      infoMessage += `*📋 INSTALLATION GUIDE:*\n`;
      infoMessage += `1. Download APK from trusted source\n`;
      infoMessage += `2. Go to Settings > Security\n`;
      infoMessage += `3. Enable "Unknown Sources"\n`;
      infoMessage += `4. Open downloaded APK file\n`;
      infoMessage += `5. Follow installation prompts\n\n`;
      
      infoMessage += `*🛡️ SECURITY CHECKLIST:*\n`;
      infoMessage += `✅ Download from trusted sources only\n`;
      infoMessage += `✅ Check app permissions\n`;
      infoMessage += `✅ Scan with antivirus\n`;
      infoMessage += `✅ Avoid modified/cracked APKs\n`;
      infoMessage += `✅ Keep apps updated\n\n`;
      
      infoMessage += `*💡 QUICK COMMANDS:*\n`;
      infoMessage += `• .apk ${q} - Try auto download\n`;
      infoMessage += `• .apksearch ${q} - Enhanced search\n\n`;
      
      infoMessage += `𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`;

      return reply(infoMessage);

    } catch (e) {
      console.log("APK Info Error:", e);
      return reply(`❌ *Error getting APK info:* ${e.message}\n\nTry with a different app name or use .apksearch command.`);
    }
  }
);

// Enhanced APK search command
cmd(
  {
    pattern: "apksearch",
    react: "🔍",
    desc: "Advanced APK search with recommendations",
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

      reply("🔍 *Advanced APK search...* Please wait...");

      const searchQuery = encodeURIComponent(q);
      
      let searchMessage = `*🔍 ADVANCED APK SEARCH: ${q.toUpperCase()}*\n\n`;
      
      // Category-based suggestions
      const categories = {
        'social': {
          keywords: ['facebook', 'instagram', 'twitter', 'snapchat', 'tiktok', 'discord', 'telegram', 'whatsapp'],
          apps: ['Facebook', 'Instagram', 'Twitter/X', 'Snapchat', 'TikTok', 'Discord', 'Telegram', 'WhatsApp']
        },
        'entertainment': {
          keywords: ['youtube', 'netflix', 'spotify', 'twitch', 'disney', 'hulu', 'prime'],
          apps: ['YouTube', 'Netflix', 'Spotify', 'Twitch', 'Disney+', 'Hulu', 'Amazon Prime']
        },
        'gaming': {
          keywords: ['pubg', 'minecraft', 'roblox', 'fortnite', 'clash', 'pokemon', 'candy'],
          apps: ['PUBG Mobile', 'Minecraft', 'Roblox', 'Fortnite', 'Clash of Clans', 'Pokemon GO', 'Candy Crush']
        },
        'productivity': {
          keywords: ['office', 'word', 'excel', 'powerpoint', 'google', 'drive', 'zoom', 'teams'],
          apps: ['Microsoft Office', 'Google Workspace', 'Zoom', 'Microsoft Teams', 'Notion', 'Evernote']
        },
        'communication': {
          keywords: ['zoom', 'skype', 'teams', 'slack', 'messenger', 'viber', 'line'],
          apps: ['Zoom', 'Skype', 'Microsoft Teams', 'Slack', 'Messenger', 'Viber', 'LINE']
        }
      };
      
      const lowerQ = q.toLowerCase();
      let matchedCategory = null;
      
      for (const [category, data] of Object.entries(categories)) {
        if (data.keywords.some(keyword => lowerQ.includes(keyword) || keyword.includes(lowerQ))) {
          matchedCategory = { name: category, ...data };
          break;
        }
      }
      
      if (matchedCategory) {
        searchMessage += `*📂 Category: ${matchedCategory.name.toUpperCase()}*\n`;
        searchMessage += `*Related Apps:*\n`;
        matchedCategory.apps.forEach((app, index) => {
          searchMessage += `${index + 1}. ${app}\n`;
        });
        searchMessage += `\n`;
      }
      
      searchMessage += `*🔗 SEARCH THESE PLATFORMS:*\n\n`;
      
      searchMessage += `*APKPure:*\n`;
      searchMessage += `https://apkpure.com/search?q=${searchQuery}\n\n`;
      
      searchMessage += `*APKMirror:*\n`;
      searchMessage += `https://www.apkmirror.com/?s=${searchQuery}\n\n`;
      
      searchMessage += `*Uptodown:*\n`;
      searchMessage += `https://en.uptodown.com/android/search/${searchQuery}\n\n`;
      
      searchMessage += `*APKCombo:*\n`;
      searchMessage += `https://apkcombo.com/search/${searchQuery}\n\n`;
      
      // Popular alternatives based on search
      const alternatives = {
        'facebook': 'Try: Facebook Lite, Messenger, Instagram',
        'youtube': 'Try: YouTube Music, YouTube TV, NewPipe',
        'whatsapp': 'Try: WhatsApp Business, Telegram, Signal',
        'instagram': 'Try: Instagram Lite, Threads, Pinterest',
        'chrome': 'Try: Firefox, Opera, Edge, Brave',
        'tiktok': 'Try: Instagram Reels, YouTube Shorts',
        'spotify': 'Try: YouTube Music, Apple Music, Deezer',
        'pubg': 'Try: Call of Duty Mobile, Free Fire, Fortnite'
      };
      
      for (const [key, suggestion] of Object.entries(alternatives)) {
        if (lowerQ.includes(key)) {
          searchMessage += `*💡 Alternatives:* ${suggestion}\n\n`;
          break;
        }
      }
      
      searchMessage += `*⚡ QUICK COMMANDS:*\n`;
      searchMessage += `• .apk ${q} - Try auto download\n`;
      searchMessage += `• .apkinfo ${q} - Get detailed info\n\n`;
      
      searchMessage += `*🎯 SEARCH TIPS:*\n`;
      searchMessage += `• Use exact app names for better results\n`;
      searchMessage += `• Try alternative spellings\n`;
      searchMessage += `• Search for "lite" versions for smaller apps\n`;
      searchMessage += `• Check developer names for authenticity\n\n`;
      
      searchMessage += `𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`;

      return reply(searchMessage);

    } catch (e) {
      console.log("APK Search Error:", e);
      return reply(`❌ *Error in APK search:* ${e.message}\n\nTry with a different search term.`);
    }
  }
);

// Quick APK command for popular apps
cmd(
  {
    pattern: "getapk",
    react: "⚡",
    desc: "Quick download for popular apps",
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
      if (!q) {
        const popularApps = `*⚡ QUICK APK DOWNLOAD*

*Popular Apps Available:*
• facebook, instagram, whatsapp
• youtube, spotify, netflix
• tiktok, telegram, discord
• pubg, minecraft, roblox
• chrome, firefox, opera
• zoom, teams, skype

*Usage:* .getapk facebook
*Or use:* .apk facebook

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`;
        
        return reply(popularApks);
      }

      // Redirect to main apk command
      return reply(`🔄 *Redirecting to APK downloader...*\n\nProcessing: .apk ${q}`);
      
    } catch (e) {
      console.log("GetAPK Error:", e);
      return reply(`❌ *Error:* ${e.message}\n\nTry: .apk ${q || 'appname'}`);
    }
  }
);
