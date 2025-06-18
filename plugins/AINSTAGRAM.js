const { cmd, commands } = require("../command");
const axios = require("axios");

// Instagram video downloader function using public APIs
async function getInstagramVideo(url) {
  try {
    // Clean the URL to get the post ID
    const postId = extractPostId(url);
    if (!postId) {
      throw new Error("Invalid Instagram URL");
    }

    // Use a public Instagram API or scraping method
    // Note: This is a simplified implementation - in production you'd use a proper Instagram API
    const apiUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
    
    // Alternative approach using instagram-dl or similar library
    // For this implementation, we'll simulate the response structure
    return await scrapeInstagramVideo(url);
  } catch (error) {
    throw new Error(`Failed to fetch Instagram video: ${error.message}`);
  }
}

// Extract post ID from Instagram URL
function extractPostId(url) {
  const patterns = [
    /instagram\.com\/p\/([^\/\?]+)/,
    /instagram\.com\/reel\/([^\/\?]+)/,
    /instagram\.com\/tv\/([^\/\?]+)/,
    /instagram\.com\/stories\/[^\/]+\/([^\/\?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Scrape Instagram video data
async function scrapeInstagramVideo(url) {
  try {
    // This would typically use a library like instagram-private-api or puppeteer
    // For this example, we'll use a public API approach
    const response = await axios.get(`https://www.instagram.com/p/${extractPostId(url)}/?__a=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Parse the response to extract video data
    // This is a simplified structure - actual Instagram API responses are more complex
    const data = response.data;
    
    if (data && data.graphql && data.graphql.shortcode_media) {
      const media = data.graphql.shortcode_media;
      
      return {
        title: media.edge_media_to_caption.edges[0]?.node.text.substring(0, 100) + "..." || "Instagram Video",
        thumbnail: media.display_url,
        duration: media.video_duration || 0,
        views: media.video_view_count || 0,
        username: media.owner.username,
        videoUrl: media.video_url,
        isVideo: media.is_video,
        dimensions: {
          width: media.dimensions.width,
          height: media.dimensions.height
        }
      };
    }
    
    throw new Error("Video not found or private");
  } catch (error) {
    // Fallback method using alternative API
    return await fallbackInstagramScraper(url);
  }
}

// Fallback scraper method
async function fallbackInstagramScraper(url) {
  try {
    // Use environment variable for API key if available
    const apiKey = process.env.INSTAGRAM_API_KEY || "fallback_key";
    
    // Alternative API endpoint (you would replace this with an actual service)
    const apiUrl = `https://api.example-instagram-scraper.com/download?url=${encodeURIComponent(url)}&key=${apiKey}`;
    
    const response = await axios.get(apiUrl);
    
    if (response.data && response.data.success) {
      return {
        title: response.data.title || "Instagram Video",
        thumbnail: response.data.thumbnail,
        duration: response.data.duration || 0,
        views: response.data.view_count || 0,
        username: response.data.username || "Unknown",
        videoUrl: response.data.video_url,
        isVideo: true,
        dimensions: response.data.dimensions || { width: 1080, height: 1920 }
      };
    }
    
    throw new Error("Failed to fetch video from fallback API");
  } catch (error) {
    throw new Error("All download methods failed");
  }
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format duration
function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Validate Instagram URL
function isValidInstagramUrl(url) {
  const instagramPatterns = [
    /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/tv\/[A-Za-z0-9_-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/stories\/[A-Za-z0-9_.]+\/[0-9]+/
  ];
  
  return instagramPatterns.some(pattern => pattern.test(url));
}

cmd(
  {
    pattern: "ig",
    react: "📸",
    desc: "Download Instagram Video",
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
      if (!q) return reply("*Please Give An Instagram URL* 📸\n\nExample: .ig https://instagram.com/p/xxxxx");

      // Validate Instagram URL
      if (!isValidInstagramUrl(q)) {
        return reply("❌ *Invalid Instagram URL*\n\nPlease provide a valid Instagram post, reel, or IGTV URL");
      }

      // Send processing message
      await reply("🔄 *Processing Instagram video...*\nPlease wait while I fetch the video details.");

      // Get Instagram video data
      const videoData = await getInstagramVideo(q);

      if (!videoData.isVideo) {
        return reply("❌ *This post doesn't contain a video*\n\nPlease provide a link to an Instagram video, reel, or IGTV.");
      }

      // Check video duration (limit: 10 minutes for Instagram videos)
      if (videoData.duration > 600) {
        return reply("⏱️ *Video is too long*\n\nVideo limit is 10 minutes for WhatsApp compatibility.");
      }

      // Video metadata description
      let desc = `
*📸💜 PIKO IG VIDEO DOWNLOADER 💜*

🎬 *Title* : ${videoData.title}
👤 *Username* : @${videoData.username}
⏱️ *Duration* : ${formatDuration(videoData.duration)}
👀 *Views* : ${videoData.views.toLocaleString()}
📏 *Resolution* : ${videoData.dimensions.width}x${videoData.dimensions.height}
🔗 *URL* : ${q}

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O*
`;

      // Send metadata with thumbnail
      await robin.sendMessage(
        from,
        { image: { url: videoData.thumbnail }, caption: desc },
        { quoted: mek }
      );

      // Check if video URL is accessible
      try {
        const videoResponse = await axios.head(videoData.videoUrl);
        const fileSize = parseInt(videoResponse.headers['content-length'] || '0');
        
        // Check file size (limit: 100MB for WhatsApp)
        if (fileSize > 100 * 1024 * 1024) {
          return reply("📁 *File too large*\n\nVideo size exceeds 100MB WhatsApp limit.\nTry downloading a shorter video.");
        }

        // Send video file
        await robin.sendMessage(
          from,
          {
            video: { url: videoData.videoUrl },
            mimetype: "video/mp4",
            caption: `*${videoData.title}*\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜`,
          },
          { quoted: mek }
        );

        // Send as document (optional)
        await robin.sendMessage(
          from,
          {
            document: { url: videoData.videoUrl },
            mimetype: "video/mp4",
            fileName: `${videoData.username}_${Date.now()}.mp4`,
            caption: "𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* 💜",
          },
          { quoted: mek }
        );

        return reply("*DOWNLOAD COMPLETED* ✅");
        
      } catch (downloadError) {
        console.log("Download error:", downloadError);
        return reply("❌ *Download failed*\n\nThe video might be private or temporarily unavailable. Please try again later.");
      }

    } catch (e) {
      console.log("Instagram download error:", e);
      
      let errorMessage = "❌ *Error downloading Instagram video*\n\n";
      
      if (e.message.includes("private")) {
        errorMessage += "The account or post is private.";
      } else if (e.message.includes("not found")) {
        errorMessage += "Video not found. The post might have been deleted.";
      } else if (e.message.includes("rate limit")) {
        errorMessage += "Rate limit exceeded. Please try again later.";
      } else {
        errorMessage += `${e.message}`;
      }
      
      reply(errorMessage);
    }
  }
);

// Alternative command pattern for different Instagram content types
cmd(
  {
    pattern: "igreel",
    react: "🎥",
    desc: "Download Instagram Reel",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    if (!q) return reply("*Please provide an Instagram Reel URL* 🎥");
    
    // Redirect to main ig command
    const args = { from, quoted: mek, body: `.ig ${q}`, q, reply };
    return robin.handleCommand('ig', robin, mek, m, args);
  }
);

cmd(
  {
    pattern: "igtv",
    react: "📺",
    desc: "Download Instagram IGTV",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    if (!q) return reply("*Please provide an Instagram IGTV URL* 📺");
    
    // Redirect to main ig command
    const args = { from, quoted: mek, body: `.igtv ${q}`, q, reply };
    return robin.handleCommand('ig', robin, mek, m, args);
  }
);
