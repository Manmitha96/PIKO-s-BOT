const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

// Instagram Video/Post Downloader
cmd(
  {
    pattern: "ig",
    alias: ["instagram", "insta"],
    react: "📸",
    desc: "Download Instagram videos, photos, reels, and IGTV",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      if (!q) return reply("*Please provide an Instagram URL!* 📸💜\n\n*Example:* .ig https://www.instagram.com/p/ABC123/");

      // Validate Instagram URL
      const igRegex = /(https?:\/\/)?(www\.)?(instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+)/;
      if (!igRegex.test(q)) {
        return reply("*Invalid Instagram URL!* ❌\n\n*Supported formats:*\n• Posts: instagram.com/p/...\n• Reels: instagram.com/reel/...\n• IGTV: instagram.com/tv/...");
      }

      await reply("*Downloading your Instagram content...* 📸⏳");

      // Clean the URL
      const cleanUrl = q.split('?')[0]; // Remove query parameters
      
      // Method 1: Try SaveInsta API
      try {
        const apiUrl = `https://saveinsta.app/core/ajax.php`;
        const formData = new URLSearchParams();
        formData.append('url', cleanUrl);
        formData.append('lang', 'en');

        const response = await axios.post(apiUrl, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://saveinsta.app/'
          },
          timeout: 15000
        });

        if (response.data && typeof response.data === 'string') {
          const $ = cheerio.load(response.data);
          
          // Look for download links
          const videoUrl = $('a[href*=".mp4"]').first().attr('href');
          const imageUrl = $('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"]').first().attr('href');
          
          if (videoUrl || imageUrl) {
            const caption = `📸 *INSTAGRAM DOWNLOADER* 📸

🔗 *Source*: ${cleanUrl}
📱 *Type*: ${videoUrl ? 'Video/Reel' : 'Image/Photo'}
⬇️ *Status*: Successfully downloaded

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

            if (videoUrl) {
              await robin.sendMessage(
                from,
                {
                  video: { url: videoUrl },
                  caption: caption
                },
                { quoted: mek }
              );
            } else if (imageUrl) {
              await robin.sendMessage(
                from,
                {
                  image: { url: imageUrl },
                  caption: caption
                },
                { quoted: mek }
              );
            }

            return reply("*Instagram content downloaded successfully!* ✅💜");
          }
        }
      } catch (method1Error) {
        console.log("Method 1 failed:", method1Error.message);
      }

      // Method 2: Try SnapInsta API
      try {
        const snapUrl = `https://snapinsta.app/api/ajaxSearch`;
        const snapData = new URLSearchParams();
        snapData.append('q', cleanUrl);
        snapData.append('t', 'media');
        snapData.append('lang', 'en');

        const snapResponse = await axios.post(snapUrl, snapData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 15000
        });

        if (snapResponse.data && snapResponse.data.data) {
          const $ = cheerio.load(snapResponse.data.data);
          
          const downloadLink = $('.download-items__btn').first().attr('href');
          const isVideo = $('.download-items__btn').first().text().toLowerCase().includes('video');
          
          if (downloadLink) {
            const caption = `📸 *INSTAGRAM CONTENT* 📸

🔗 *Source*: Instagram ${isVideo ? 'Video' : 'Image'}
📱 *Method*: SnapInsta
⬇️ *Status*: Downloaded successfully

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

            if (isVideo) {
              await robin.sendMessage(
                from,
                {
                  video: { url: downloadLink },
                  caption: caption
                },
                { quoted: mek }
              );
            } else {
              await robin.sendMessage(
                from,
                {
                  image: { url: downloadLink },
                  caption: caption
                },
                { quoted: mek }
              );
            }

            return reply("*Content downloaded via SnapInsta!* ✅");
          }
        }
      } catch (method2Error) {
        console.log("Method 2 failed:", method2Error.message);
      }

      // Method 3: Try InstaDownloader API
      try {
        const instaUrl = `https://instadownloader.co/system/action.php`;
        const instaData = new URLSearchParams();
        instaData.append('url', cleanUrl);
        instaData.append('action', 'post');

        const instaResponse = await axios.post(instaUrl, instaData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 15000
        });

        if (instaResponse.data && instaResponse.data.success) {
          const mediaUrl = instaResponse.data.url;
          const mediaType = instaResponse.data.type || 'image';
          
          const caption = `📸 *INSTAGRAM DOWNLOAD* 📸

🔗 *Original*: ${cleanUrl}
📱 *Type*: ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
⬇️ *Method*: InstaDownloader

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

          if (mediaType.includes('video') || mediaType.includes('mp4')) {
            await robin.sendMessage(
              from,
              {
                video: { url: mediaUrl },
                caption: caption
              },
              { quoted: mek }
            );
          } else {
            await robin.sendMessage(
              from,
              {
                image: { url: mediaUrl },
                caption: caption
              },
              { quoted: mek }
            );
          }

          return reply("*Instagram content downloaded!* ✅📸");
        }
      } catch (method3Error) {
        console.log("Method 3 failed:", method3Error.message);
      }

      // Method 4: Try direct Instagram oEmbed (for basic info)
      try {
        const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(cleanUrl)}`;
        const oembedResponse = await axios.get(oembedUrl, {
          timeout: 10000
        });
        
        if (oembedResponse.data && oembedResponse.data.thumbnail_url) {
          const caption = `📸 *INSTAGRAM POST PREVIEW* 📸

👤 *Author*: ${oembedResponse.data.author_name || 'Unknown'}
📝 *Title*: ${oembedResponse.data.title || 'Instagram Post'}
🔗 *URL*: ${cleanUrl}

⚠️ *Note*: This is a preview thumbnail. The original post might be private or require special access.

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

          await robin.sendMessage(
            from,
            {
              image: { url: oembedResponse.data.thumbnail_url },
              caption: caption
            },
            { quoted: mek }
          );

          return reply("*Instagram preview downloaded!* 📸💙\n\n*Note: If you need the full quality media, the post might be private or restricted.*");
        }
      } catch (oembedError) {
        console.log("oEmbed method failed:", oembedError.message);
      }

      // If all methods fail
      throw new Error("Unable to download from this Instagram URL");

    } catch (e) {
      console.error("Instagram Download Error:", e);
      
      const errorMessage = `❌ *Instagram Download Failed* ❌

🔗 *URL*: ${q}

*Possible reasons:*
• Post is private or restricted
• Account is private
• URL is invalid or expired
• Instagram has blocked the download
• Network connectivity issues

*Tips:*
• Make sure the post is public
• Check if the URL is complete and correct
• Try again in a few minutes
• Use a different Instagram URL

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

      reply(errorMessage);
    }
  }
);

// Instagram Story Downloader
cmd(
  {
    pattern: "igstory",
    alias: ["instastory", "story"],
    react: "📱",
    desc: "Download Instagram stories (requires username)",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      if (!q) return reply("*Please provide an Instagram username!* 📱💜\n\n*Example:* .igstory username");

      const username = q.replace('@', '').trim();
      
      await reply("*Fetching Instagram stories...* 📱⏳\n*Note: Only public stories can be downloaded*");

      // Instagram stories are very restricted and require authentication
      // This is a placeholder implementation
      const storyMessage = `📱 *INSTAGRAM STORIES* 📱

👤 *Username*: @${username}

⚠️ *Story Download Limitation*

Instagram stories are heavily protected and require:
• User authentication
• Special API access
• Real-time story availability

*Alternative suggestions:*
• Use .ig for posts and reels
• Use .igdp for profile pictures
• Stories expire after 24 hours

*Available commands:*
• .ig <post_url> - Download posts/reels
• .igdp <username> - Download profile picture

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

      reply(storyMessage);

    } catch (e) {
      console.error("Instagram Story Error:", e);
      reply(`❌ *Error fetching stories:* ${e.message}`);
    }
  }
);

// Instagram Profile Picture Downloader
cmd(
  {
    pattern: "igdp",
    alias: ["instadp", "igpfp"],
    react: "👤",
    desc: "Download Instagram profile picture",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      if (!q) return reply("*Please provide an Instagram username!* 👤💜\n\n*Example:* .igdp username");

      const username = q.replace('@', '').trim();
      
      await reply("*Downloading profile picture...* 👤⏳");

      // Method 1: Try InstaDp API
      try {
        const dpApiUrl = `https://instadp.com/fullsize/${username}`;
        
        // Test if the image exists
        const testResponse = await axios.head(dpApiUrl, {
          timeout: 10000
        });

        if (testResponse.status === 200) {
          const caption = `👤 *INSTAGRAM PROFILE PICTURE* 👤

👤 *Username*: @${username}
📱 *Quality*: Full Size
⬇️ *Source*: InstaDp

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

          await robin.sendMessage(
            from,
            {
              image: { url: dpApiUrl },
              caption: caption
            },
            { quoted: mek }
          );

          return reply("*Profile picture downloaded successfully!* ✅👤");
        }
      } catch (method1Error) {
        console.log("InstaDp method failed:", method1Error.message);
      }

      // Method 2: Try alternative DP service
      try {
        const altDpUrl = `https://www.picuki.com/profile/${username}`;
        const response = await axios.get(altDpUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 15000
        });

        const $ = cheerio.load(response.data);
        const profilePicUrl = $('.profile-avatar img').attr('src');

        if (profilePicUrl && profilePicUrl.startsWith('http')) {
          const caption = `👤 *INSTAGRAM PROFILE PICTURE* 👤

👤 *Username*: @${username}
📱 *Source*: Picuki
⬇️ *Quality*: High Resolution

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

          await robin.sendMessage(
            from,
            {
              image: { url: profilePicUrl },
              caption: caption
            },
            { quoted: mek }
          );

          return reply("*Profile picture downloaded!* ✅👤");
        }
      } catch (method2Error) {
        console.log("Picuki method failed:", method2Error.message);
      }

      // Method 3: Try direct Instagram approach
      try {
        const instagramUrl = `https://www.instagram.com/${username}/`;
        const response = await axios.get(instagramUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 15000
        });

        // Look for profile picture in the HTML
        const profilePicMatch = response.data.match(/"profile_pic_url_hd":"([^"]+)"/);
        if (profilePicMatch && profilePicMatch[1]) {
          const profilePicUrl = profilePicMatch[1].replace(/\\u0026/g, '&');

          const caption = `👤 *INSTAGRAM PROFILE PICTURE* 👤

👤 *Username*: @${username}
📱 *Quality*: HD
⬇️ *Source*: Instagram Direct

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

          await robin.sendMessage(
            from,
            {
              image: { url: profilePicUrl },
              caption: caption
            },
            { quoted: mek }
          );

          return reply("*HD Profile picture downloaded!* ✅👤");
        }
      } catch (method3Error) {
        console.log("Direct Instagram method failed:", method3Error.message);
      }

      throw new Error(`Unable to fetch profile picture for @${username}`);

    } catch (e) {
      console.error("Instagram DP Error:", e);
      
      const errorMessage = `❌ *Profile Picture Download Failed* ❌

👤 *Username*: @${username}

*Possible reasons:*
• Account is private
• Username doesn't exist
• Profile picture is restricted
• Network connectivity issues

*Tips:*
• Make sure the username is correct
• Check if the account is public
• Try again in a few minutes

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

      reply(errorMessage);
    }
  }
);

// Instagram Highlights Downloader (Placeholder)
cmd(
  {
    pattern: "ighighlight",
    alias: ["instahighlight", "highlight"],
    react: "⭐",
    desc: "Download Instagram highlights",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      if (!q) return reply("*Please provide an Instagram username!* ⭐💜\n\n*Example:* .ighighlight username");

      const username = q.replace('@', '').trim();
      
      const highlightMessage = `⭐ *INSTAGRAM HIGHLIGHTS* ⭐

👤 *Username*: @${username}

🚧 *Feature Under Development* 🚧

Instagram highlights require:
• Advanced authentication
• Special API access
• Complex story parsing

*Currently Available:*
✅ .ig <url> - Download posts/reels/videos
✅ .igdp <username> - Download profile pictures
⏳ .igstory <username> - Stories (limited)
🚧 .ighighlight <username> - Coming soon

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

      reply(highlightMessage);

    } catch (e) {
      console.error("Instagram Highlights Error:", e);
      reply(`❌ *Error:* ${e.message}`);
    }
  }
);
