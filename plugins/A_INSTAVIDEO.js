const { cmd } = require('../command');  
const { igdl } = require('ruhend-scraper');  
  
cmd(  
  {  
    pattern: 'igvideo',  
    desc: 'Download Instagram videos',  
    category: 'download',  
    filename: __filename,  
  },  
  async (  
    client,  
    m,  
    mek,  
    { q, reply }  
  ) => {  
    try {  
      if (!q || !q.includes("instagram.com")) {  
        return reply('*🚫 Please provide a valid Instagram URL.*');  
      }

      // Reject post links (usually images)
      if (q.includes('/p/')) {
        return reply('*📷 This command only supports video content (Reels or Video posts). Not regular image posts.*');
      }
  
      await m.react('⏳');  
      let result;  
      try {  
        result = await igdl(q);  
      } catch (err) {  
        console.error("Scraper error:", err);  
        return reply('*❌ Failed to fetch data. Instagram may have changed or the link is private.*');  
      }  
  
      if (!result?.data || result.data.length === 0) {  
        return reply('*🔍 No media found for this link.*');  
      }  
  
      // Try to find the best available resolution  
      const video = result.data.find(v => v.url?.includes("http") && v.type === 'video');  
      if (!video) {  
        return reply('*⚠️ No downloadable video found.*');  
      }  
  
      await m.react('✅');  
      await client.sendMessage(m.chat, {  
        video: { url: video.url },  
        caption: '📥 *Downloaded via IG Downloader*\n_CUDU NONA Bot 🤖_',  
        fileName: 'instagram_video.mp4',  
        mimetype: 'video/mp4'  
      }, { quoted: m });  
    } catch (e) {  
      console.error("IG command error:", e);  
      await m.react('❌');  
      reply('*🚫 Unexpected error occurred while downloading.*');  
    }  
  }  
);
