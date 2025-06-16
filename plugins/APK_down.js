const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

// Simple working APK downloader
cmd({
    pattern: "apk",
    desc: "Download Android APK files",
    category: "download",
    filename: __filename,
    use: '<app name>'
}, async (m, sock, match) => {
    try {
        const appName = match[1];
        if (!appName) return m.reply("Please provide an app name\nExample: .apk facebook");

        m.reply("🔍 Searching for APK... Please wait...");

        // Using APKPure as source (more reliable)
        const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(appName)}`;
        
        // Simple headers to avoid 403
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        };

        // Step 1: Search for the app
        const searchResponse = await axios.get(searchUrl, { headers });
        const $ = cheerio.load(searchResponse.data);
        
        // Find first result
        const firstResult = $('.search-title:first').find('a').first();
        if (!firstResult.length) return m.reply("❌ App not found!");

        const appTitle = firstResult.attr('title');
        const appPageUrl = `https://apkpure.com${firstResult.attr('href')}`;
        const appIcon = $('.search-img:first img').attr('src');

        // Step 2: Get download page
        const appPage = await axios.get(appPageUrl, { headers });
        const $$ = cheerio.load(appPage.data);
        
        // Get download link
        const downloadLink = $$('.download-btn:first').attr('href');
        if (!downloadLink) return m.reply("❌ Download link not found!");

        // Get app details
        const version = $$('.version').text().trim() || "Latest";
        const size = $$('.size').text().trim() || "Unknown";
        const downloads = $$('.download').text().trim() || "Many users";

        // Prepare message with image
        const message = `
📱 *${appTitle}* APK

🔹 *Version:* ${version}
🔹 *Size:* ${size}
🔹 *Downloads:* ${downloads}

⬇️ *Downloading...* Please wait...

⚠️ *Note:* Only install APKs from trusted sources
`;

        // Send image + details first
        if (appIcon) {
            await sock.sendMessage(m.chat, { 
                image: { url: appIcon },
                caption: message 
            }, { quoted: m });
        } else {
            await m.reply(message);
        }

        // Step 3: Download and send APK
        const apkResponse = await axios.get(`https://apkpure.com${downloadLink}`, { 
            headers,
            responseType: 'stream'
        });

        await sock.sendMessage(m.chat, {
            document: apkResponse.data,
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${appTitle.replace(/[^a-zA-Z0-9]/g, '_')}.apk`,
            caption: `✅ *${appTitle}* APK downloaded!\n\nInstall and enjoy!`
        }, { quoted: m });

    } catch (error) {
        console.error("APK Error:", error);
        m.reply(`❌ Error: ${error.message}\n\nTry searching manually at https://apkpure.com`);
    }
});
