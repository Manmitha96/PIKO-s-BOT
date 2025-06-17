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

      // Method 1: Try primary API
      try {
        const apiUrl = `https://api.saveig.app/api/v1/get-media-info`;
        const response = await axios.post(apiUrl, {
          url: q
        }, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
          const mediaData = response.data.data[0];
          
          const caption = `📸 *INSTAGRAM DOWNLOADER* 📸

👤 *Username*: @${mediaData.username || 'Unknown'}
📝 *Caption*: ${mediaData.caption ? mediaData.caption.substring(0, 100) + '...' : 'No caption'}
❤️ *Likes*: ${mediaData.like_count || 'N/A'}
💬 *Comments*: ${mediaData.comment_count || 'N/A'}
📅 *Posted*: ${mediaData.taken_at ? new Date(mediaData.taken_at * 1000).toDateString() : 'Unknown'}

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

          // Handle different media types
          if (mediaData.video_url) {
            // Video content
            await robin.sendMessage(
              from,
              {
                video: { url: mediaData.video_url },
                caption: caption
              },
              { quoted: mek }
            );
          } else if (mediaData.image_url) {
            // Image content
            await robin.sendMessage(
              from,
              {
                image: { url: mediaData.image_url },
                caption: caption
              },
              { quoted: mek }
            );
          }

          return reply("*Instagram content downloaded successfully!* ✅💜");
        }
      } catch (primaryError) {
        console.log("Primary API failed, trying alternative method...");
      }

      // Method 2: Alternative scraping method
      try {
        const scrapingUrl = `https://www.instasave.website/download-instagram-videos-photos`;
        const formData = new URLSearchParams();
        formData.append('url', q);

        const scrapeResponse = await axios.post(scrapingUrl, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const $ = cheerio.load(scrapeResponse.data);
        const downloadLinks = [];

        // Extract download links
        $('a[download]').each((i, element) => {
          const link = $(element).attr('href');
          const type = $(element).text().toLowerCase().includes('video') ? 'video' : 'image';
          if (link && link.startsWith('http')) {
            downloadLinks.push({ url: link, type: type });
          }
        });

        if (downloadLinks.length > 0) {
          const firstMedia = downloadLinks[0];
          
          const caption = `📸 *INSTAGRAM CONTENT* 📸

🔗 *Source*: Instagram
📱 *Type*: ${firstMedia.type.charAt(0).toUpperCase() + firstMedia.type.slice(1)}
⬇️ *Status*: Successfully downloaded

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

          if (firstMedia.type === 'video') {
            await robin.sendMessage(
              from,
              {
                video: { url: firstMedia.url },
                caption: caption
              },
              { quoted: mek }
            );
          } else {
            await robin.sendMessage(
              from,
              {
                image: { url: firstMedia.url },
                caption: caption
              },
              { quoted: mek }
            );
          }

          return reply("*Content downloaded via alternative method!* ✅");
        }
      } catch (alternativeError) {
        console.log("Alternative method failed, trying third method...");
      }

      // Method 3: Simple direct approach
      try {
        const directUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(q)}`;
        const oembedResponse = await axios.get(directUrl);
        
        if (oembedResponse.data && oembedResponse.data.thumbnail_url) {
          const caption = `📸 *INSTAGRAM POST* 📸

👤 *Author*: ${oembedResponse.data.author_name || 'Unknown'}
📝 *Title*: ${oembedResponse.data.title || 'Instagram Post'}
🔗 *URL*: ${q}

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

          await robin.sendMessage(
            from,
            {
              image: { url: oembedResponse.data.thumbnail_url },
              caption: caption
            },
            { quoted: mek }
          );

          return reply("*Instagram thumbnail downloaded!* 📸💙");
        }
      } catch (directError) {
        console.log("Direct method also failed");
      }

      // If all methods fail
      throw new Error("Unable to download from this Instagram URL. The post might be private or the URL is invalid.");

    } catch (e) {
      console.error("Instagram Download Error:", e);
      reply(`❌ *Error downloading Instagram content:* ${e.message}\n\n*Tips:*\n• Make sure the post is public\n• Check if the URL is correct\n• Try again in a few minutes`);
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

      try {
        // Try to get stories using a story API
        const storyUrl = `https://api.storysaver.net/api/v1/story/${username}`;
        const response = await axios.get(storyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.data && response.data.stories && response.data.stories.length > 0) {
          const stories = response.data.stories.slice(0, 5); // Limit to 5 stories

          const caption = `📱 *INSTAGRAM STORIES* 📱

👤 *Username*: @${username}
📊 *Stories Found*: ${stories.length}
⏰ *Downloaded*: ${new Date().toLocaleString()}

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

          await reply(caption);

          // Send each story
          for (let i = 0; i < stories.length; i++) {
            const story = stories[i];
            
            try {
              if (story.video_url) {
                await robin.sendMessage(
                  from,
                  {
                    video: { url: story.video_url },
                    caption: `📱 *Story ${i + 1}/${stories.length}*\n@${username}`
                  },
                  { quoted: mek }
                );
              } else if (story.image_url) {
                await robin.sendMessage(
                  from,
                  {
                    image: { url: story.image_url },
                    caption: `📱 *Story ${i + 1}/${stories.length}*\n@${username}`
                  },
                  { quoted: mek }
                );
              }
              
              // Small delay between stories
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (storyError) {
              console.log(`Failed to send story ${i + 1}:`, storyError.message);
            }
          }

          return reply("*Stories downloaded successfully!* ✅📱");
        }
      } catch (storyError) {
        console.log("Story API failed:", storyError.message);
      }

      // Fallback message
      reply(`❌ *Unable to fetch stories for @${username}*\n\n*Possible reasons:*\n• Account is private\n• No active stories\n• Username doesn't exist\n• Stories are restricted`);

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

      try {
        // Method 1: Try profile picture API
        const dpUrl = `https://api.instagram.com/${username}/?__a=1`;
        const response = await axios.get(dpUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.data && response.data.graphql && response.data.graphql.user) {
          const user = response.data.graphql.user;
          const profilePicUrl = user.profile_pic_url_hd || user.profile_pic_url;

          const caption = `👤 *INSTAGRAM PROFILE PICTURE* 👤

👤 *Username*: @${username}
📝 *Full Name*: ${user.full_name || 'Not available'}
👥 *Followers*: ${user.edge_followed_by?.count || 'Private'}
📸 *Posts*: ${user.edge_owner_to_timeline_media?.count || 'Private'}
✅ *Verified*: ${user.is_verified ? 'Yes' : 'No'}

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`;

          await robin.sendMessage(
            from,
            {
              image: { url: profilePicUrl },
              caption: caption
            },
            { quoted: mek }
          );

          return reply("*Profile picture downloaded successfully!* ✅👤");
        }
      } catch (apiError) {
        console.log("Profile API failed, trying alternative...");
      }

      // Method 2: Alternative approach
      try {
        const altUrl = `https://www.instagram.com/${username}/`;
        const response = await axios.get(altUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const $ = cheerio.load(response.data);
        const scriptTags = $('script[type="application/ld+json"]');
        
        let profilePicUrl = null;
        scriptTags.each((i, element) => {
          try {
            const jsonData = JSON.parse($(element).html());
            if (jsonData.image) {
              profilePicUrl = jsonData.image;
            }
          } catch (parseError) {
            // Continue to next script tag
          }
        });

        if (profilePicUrl) {
          const caption = `👤 *INSTAGRAM PROFILE PICTURE* 👤

👤 *Username*: @${username}
📱 *Source*: Instagram
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
      } catch (altError) {
        console.log("Alternative method failed");
      }

      throw new Error(`Unable to fetch profile picture for @${username}. The account might be private or doesn't exist.`);

    } catch (e) {
      console.error("Instagram DP Error:", e);
      reply(`❌ *Error downloading profile picture:* ${e.message}\n\n*Make sure the username is correct and the account is public.*`);
    }
  }
);

// Instagram Highlights Downloader
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
      
      await reply("*Fetching Instagram highlights...* ⭐⏳\n*Note: Only public highlights can be downloaded*");

      // This is a placeholder for highlights functionality
      // Instagram highlights require more complex authentication
      reply(`⭐ *INSTAGRAM HIGHLIGHTS* ⭐

👤 *Username*: @${username}

❌ *Feature Coming Soon!*

Instagram highlights require special authentication and are more complex to download. This feature will be available in a future update.

*Available Instagram commands:*
• .ig - Download posts/reels/videos
• .igstory - Download stories  
• .igdp - Download profile pictures

𝐌𝐚𝐝𝐞 𝐛𝐲 *P_I_K_O* ☯️`);

    } catch (e) {
      console.error("Instagram Highlights Error:", e);
      reply(`❌ *Error:* ${e.message}`);
    }
  }
);
