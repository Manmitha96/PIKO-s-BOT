const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

cmd({
    pattern: "apk",
    desc: "Download Android APK files",
    category: "download",
    filename: __filename,
    use: '<app name>'
}, async (m, sock) => {
    try {
        const appName = m.q;
        if (!appName) return sock.sendMessage(m.chat, { text: "Please provide an app name\nExample: .apk facebook" }, { quoted: m });

        await sock.sendMessage(m.chat, { text: "🔍 Searching for APK... Please wait..." }, { quoted: m });

        // Using APKPure as source
        const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(appName)}`;
        
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        };

        // Search for the app
        const { data } = await axios.get(searchUrl, { headers });
        const $ = cheerio.load(data);
        
        const firstResult = $('.search-title:first').find('a').first();
        if (!firstResult.length) return sock.sendMessage(m.chat, { text: "❌ App not found!" }, { quoted: m });

        const appTitle = firstResult.attr('title');
        const appPageUrl = `https://apkpure.com${firstResult.attr('href')}`;
        const appIcon = $('.search-img:first img').attr('src');

        // Get download page
        const appPage = await axios.get(appPageUrl, { headers });
        const $$ = cheerio.load(appPage.data);
        
        const downloadLink = $$('.download-btn:first').attr('href');
        if (!downloadLink) return sock.sendMessage(m.chat, { text: "❌ Download link not found!" }, { quoted: m });

        // App details
        const version = $$('.version').text().trim() || "Latest";
        const size = $$('.size').text().trim() || "Unknown";

        // Send app info with image
        const infoMsg = `
📱 *${appTitle}* APK

🔹 *Version:* ${version}
🔹 *Size:* ${size}

⬇️ *Downloading...* Please wait...
`;

        if (appIcon) {
            await sock.sendMessage(m.chat, { 
                image: { url: appIcon },
                caption: infoMsg 
            }, { quoted: m });
        } else {
            await sock.sendMessage(m.chat, { text: infoMsg }, { quoted: m });
        }

        // Download and send APK
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
        sock.sendMessage(m.chat, { 
            text: `❌ Error: ${error.message}\n\nTry searching manually at https://apkpure.com`
        }, { quoted: m });
    }
});
