const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

// YouTube Download Command
cmd({
  pattern: "yt",
  react: "🎥",
  desc: "Download YouTube videos",
  category: "download",
  filename: __filename,
}, async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
  try {
    if (!q) return reply("🔗 *PIKO YOUTUBE DOWNLOADER* 🎥\n\nUsage:\n• .yt <YouTube URL>\n• .yt <search query>\n\nExample:\n.yt https://youtu.be/example\n.yt never gonna give you up\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️");

    await reply("🔄 Processing YouTube video...");

    // Search for the video if it's not a direct URL
    let data;
    if (q.includes('youtube.com') || q.includes('youtu.be')) {
      // Direct URL - extract video info
      const videoId = extractYouTubeId(q);
      const search = await yts({ videoId });
      data = search;
    } else {
      // Search query
      const search = await yts(q);
      data = search.videos[0];
    }

    const url = data.url;

    let desc = `🎥 *PIKO YOUTUBE DOWNLOADER* 🎥
👻 Title: ${data.title}
👻 Duration: ${data.timestamp}
👻 Views: ${data.views}
👻 Uploaded: ${data.ago}
👻 Channel: ${data.author.name}
👻 Link: ${data.url}

𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️`;

    await robin.sendMessage(
      from,
      { image: { url: data.thumbnail }, caption: desc },
      { quoted: mek }
    );

    // Download video
    const video = await downloadYouTubeVideo(url, "720");
    await robin.sendMessage(
      from,
      {
        video: video.buffer,
        caption: `🎥 *${video.title}*\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`,
      },
      { quoted: mek }
    );

    reply("✅ *YouTube video downloaded successfully!* 🎥💙");
  } catch (error) {
    console.error(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// Instagram Download Command
cmd({
  pattern: "ig",
  react: "📸",
  desc: "Download Instagram content",
  category: "download",
  filename: __filename,
}, async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
  try {
    if (!q) return reply("🔗 *PIKO INSTAGRAM DOWNLOADER* 📸\n\nUsage:\n.ig <Instagram URL>\n\nExample:\n.ig https://instagram.com/p/example\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️");

    if (!q.includes('instagram.com')) {
      return reply("❌ Please provide a valid Instagram URL");
    }

    await reply("🔄 Processing Instagram content...");

    const apiUrl = `https://api.instagramdownloader.com/download?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.success) {
      const data = response.data.data;
      
      let desc = `📸 *PIKO INSTAGRAM DOWNLOADER* 📸
👻 Caption: ${data.caption || 'No caption'}
👻 Type: ${data.type || 'Post'}
👻 Username: ${data.username || 'Unknown'}
👻 Link: ${q}

𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️`;

      if (data.type === 'video') {
        await robin.sendMessage(
          from,
          {
            video: { url: data.download_url },
            caption: desc
          },
          { quoted: mek }
        );
      } else {
        await robin.sendMessage(
          from,
          {
            image: { url: data.download_url },
            caption: desc
          },
          { quoted: mek }
        );
      }

      reply("✅ *Instagram content downloaded successfully!* 📸💜");
    } else {
      throw new Error("Failed to fetch Instagram content");
    }
  } catch (error) {
    console.error(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// Twitter Download Command
cmd({
  pattern: "twt",
  react: "🐦",
  desc: "Download Twitter content",
  category: "download",
  filename: __filename,
}, async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
  try {
    if (!q) return reply("🔗 *PIKO TWITTER DOWNLOADER* 🐦\n\nUsage:\n.twt <Twitter URL>\n\nExample:\n.twt https://twitter.com/user/status/123\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️");

    if (!q.includes('twitter.com') && !q.includes('x.com')) {
      return reply("❌ Please provide a valid Twitter URL");
    }

    await reply("🔄 Processing Twitter content...");

    const apiUrl = `https://api.twitterdownloader.com/download?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.success) {
      const data = response.data.data;
      
      let desc = `🐦 *PIKO TWITTER DOWNLOADER* 🐦
👻 Tweet: ${data.text || 'No text'}
👻 Username: ${data.username || 'Unknown'}
👻 Date: ${data.date || 'Unknown'}
👻 Link: ${q}

𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️`;

      if (data.media_type === 'video') {
        await robin.sendMessage(
          from,
          {
            video: { url: data.download_url },
            caption: desc
          },
          { quoted: mek }
        );
      } else if (data.media_type === 'image') {
        await robin.sendMessage(
          from,
          {
            image: { url: data.download_url },
            caption: desc
          },
          { quoted: mek }
        );
      }

      reply("✅ *Twitter content downloaded successfully!* 🐦💙");
    } else {
      throw new Error("Failed to fetch Twitter content");
    }
  } catch (error) {
    console.error(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// Spotify Download Command
cmd({
  pattern: "spotify",
  react: "🎵",
  desc: "Download Spotify tracks",
  category: "download",
  filename: __filename,
}, async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
  try {
    if (!q) return reply("🔗 *PIKO SPOTIFY DOWNLOADER* 🎵\n\nUsage:\n.spotify <Spotify URL>\n\nExample:\n.spotify https://open.spotify.com/track/example\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️");

    if (!q.includes('spotify.com')) {
      return reply("❌ Please provide a valid Spotify URL");
    }

    await reply("🔄 Processing Spotify track...");

    const apiUrl = `https://api.spotifydownloader.com/download?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.success) {
      const data = response.data.data;
      
      let desc = `🎵 *PIKO SPOTIFY DOWNLOADER* 🎵
👻 Title: ${data.title}
👻 Artist: ${data.artist}
👻 Album: ${data.album}
👻 Duration: ${data.duration}
👻 Link: ${q}

𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️`;

      await robin.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: desc },
        { quoted: mek }
      );

      await robin.sendMessage(
        from,
        {
          audio: { url: data.download_url },
          mimetype: 'audio/mpeg',
          fileName: `${data.title} - ${data.artist}.mp3`
        },
        { quoted: mek }
      );

      reply("✅ *Spotify track downloaded successfully!* 🎵💚");
    } else {
      throw new Error("Failed to fetch Spotify track");
    }
  } catch (error) {
    console.error(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// Google Drive Download Command
cmd({
  pattern: "gdrive",
  react: "📁",
  desc: "Download Google Drive files",
  category: "download",
  filename: __filename,
}, async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
  try {
    if (!q) return reply("🔗 *PIKO GOOGLE DRIVE DOWNLOADER* 📁\n\nUsage:\n.gdrive <Google Drive URL>\n\nExample:\n.gdrive https://drive.google.com/file/d/example\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️");

    if (!q.includes('drive.google.com')) {
      return reply("❌ Please provide a valid Google Drive URL");
    }

    await reply("🔄 Processing Google Drive file...");

    const fileId = extractGoogleDriveId(q);
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    let desc = `📁 *PIKO GOOGLE DRIVE DOWNLOADER* 📁
👻 File ID: ${fileId}
👻 Link: ${q}
👻 Status: Ready to download

𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️`;

    await robin.sendMessage(
      from,
      {
        document: { url: directUrl },
        fileName: `GoogleDriveFile_${fileId}`,
        caption: desc
      },
      { quoted: mek }
    );

    reply("✅ *Google Drive file downloaded successfully!* 📁💙");
  } catch (error) {
    console.error(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// MediaFire Download Command
cmd({
  pattern: "mediafire",
  react: "🔥",
  desc: "Download MediaFire files",
  category: "download",
  filename: __filename,
}, async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
  try {
    if (!q) return reply("🔗 *PIKO MEDIAFIRE DOWNLOADER* 🔥\n\nUsage:\n.mediafire <MediaFire URL>\n\nExample:\n.mediafire https://mediafire.com/file/example\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️");

    if (!q.includes('mediafire.com')) {
      return reply("❌ Please provide a valid MediaFire URL");
    }

    await reply("🔄 Processing MediaFire file...");

    const apiUrl = `https://api.mediafiredownloader.com/download?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.success) {
      const data = response.data.data;
      
      let desc = `🔥 *PIKO MEDIAFIRE DOWNLOADER* 🔥
👻 Filename: ${data.filename}
👻 Size: ${data.size}
👻 Upload Date: ${data.upload_date}
👻 Link: ${q}

𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️`;

      await robin.sendMessage(
        from,
        {
          document: { url: data.download_url },
          fileName: data.filename,
          caption: desc
        },
        { quoted: mek }
      );

      reply("✅ *MediaFire file downloaded successfully!* 🔥🧡");
    } else {
      throw new Error("Failed to fetch MediaFire file");
    }
  } catch (error) {
    console.error(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// MEGA Download Command
cmd({
  pattern: "mega",
  react: "☁️",
  desc: "Download MEGA files",
  category: "download",
  filename: __filename,
}, async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
  try {
    if (!q) return reply("🔗 *PIKO MEGA DOWNLOADER* ☁️\n\nUsage:\n.mega <MEGA URL>\n\nExample:\n.mega https://mega.nz/file/example\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️");

    if (!q.includes('mega.nz') && !q.includes('mega.co.nz')) {
      return reply("❌ Please provide a valid MEGA URL");
    }

    await reply("🔄 Processing MEGA file...");

    const apiUrl = `https://api.megadownloader.com/download?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.success) {
      const data = response.data.data;
      
      let desc = `☁️ *PIKO MEGA DOWNLOADER* ☁️
👻 Filename: ${data.filename}
👻 Size: ${data.size}
👻 Link: ${q}

𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️`;

      await robin.sendMessage(
        from,
        {
          document: { url: data.download_url },
          fileName: data.filename,
          caption: desc
        },
        { quoted: mek }
      );

      reply("✅ *MEGA file downloaded successfully!* ☁️❤️");
    } else {
      throw new Error("Failed to fetch MEGA file");
    }
  } catch (error) {
    console.error(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// APK Download Command
cmd({
  pattern: "apk",
  react: "📱",
  desc: "Download APK files",
  category: "download",
  filename: __filename,
}, async (robin, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
  try {
    if (!q) return reply("📱 *PIKO APK DOWNLOADER* 📱\n\nUsage:\n.apk <app name>\n\nExample:\n.apk whatsapp\n.apk facebook lite\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️");

    await reply("🔄 Searching for APK...");

    const appName = q.toLowerCase().replace(/\s+/g, '+');
    const apiUrl = `https://api.apkdownloader.com/search?q=${appName}`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.success && response.data.data.length > 0) {
      const app = response.data.data[0];
      
      let desc = `📱 *PIKO APK DOWNLOADER* 📱
👻 App Name: ${app.name}
👻 Package: ${app.package}
👻 Version: ${app.version}
👻 Size: ${app.size}
👻 Developer: ${app.developer}

𝐌𝐚𝐝𝐞 𝐛𝐲 P_I_K_O ☯️`;

      await robin.sendMessage(
        from,
        { image: { url: app.icon }, caption: desc },
        { quoted: mek }
      );

      await robin.sendMessage(
        from,
        {
          document: { url: app.download_url },
          fileName: `${app.name}_v${app.version}.apk`,
          mimetype: 'application/vnd.android.package-archive'
        },
        { quoted: mek }
      );

      reply("✅ *APK file downloaded successfully!* 📱💚");
    } else {
      throw new Error("APK not found. Try with exact app name.");
    }
  } catch (error) {
    console.error(error);
    reply(`❌ *Error:* ${error.message}`);
  }
});

// Helper Functions
async function downloadYouTubeVideo(url, quality) {
  const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=${quality}&url=${encodeURIComponent(
    url
  )}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;
  const response = await axios.get(apiUrl);

  if (response.data && response.data.success) {
    const { id, title } = response.data;

    const progressUrl = `https://p.oceansaver.in/ajax/progress.php?id=${id}`;
    while (true) {
      const progress = await axios.get(progressUrl);
      if (progress.data.success && progress.data.progress === 1000) {
        const videoBuffer = await axios.get(progress.data.download_url, {
          responseType: "arraybuffer",
        });
        return { buffer: videoBuffer.data, title };
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  } else {
    throw new Error("Failed to fetch video details.");
  }
}

function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function extractGoogleDriveId(url) {
  const regExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}
