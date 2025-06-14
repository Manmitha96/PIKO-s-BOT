const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

cmd(
  {
    pattern: "imagine",
    react: "🎨",
    desc: "Generate AI image using Stable Diffusion",
    category: "ai",
    filename: __filename,
  },
  async (conn, m, text, { reply }) => {
    // Extract prompt (same as original)
    let prompt = "";
    if (typeof text === "string" && text.trim()) {
      prompt = text.trim();
    } else if (m && m.body) {
      prompt = m.body.replace(/^(\.imagine|imagine)\s*/i, "").trim();
    }

    if (!prompt) {
      return reply("❌ Please provide a prompt.\n*Example:* `.imagine a dragon flying over a volcano`");
    }

    try {
      await reply("🎨 Generating image... please wait...");

      // ========================
      // REPLICATE API CALL
      // ========================
      const startResponse = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL model
          input: {
            prompt: prompt,
            width: 1024,
            height: 1024,
            num_outputs: 1
          }
        },
        { 
          headers: { 
            Authorization: `Token ${config.REPLICATE_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 30000 // 30-second timeout
        }
      );

      const predictionId = startResponse.data.id;
      let imageUrl = null;

      // Poll for result (max 30 seconds)
      for (let i = 0; i < 30; i++) {
        const statusResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          { headers: { Authorization: `Token ${config.REPLICATE_API_KEY}` } }
        );

        if (statusResponse.data.status === "succeeded") {
          imageUrl = statusResponse.data.output[0];
          break;
        } else if (statusResponse.data.status === "failed") {
          throw new Error(statusResponse.data.error || "Image generation failed");
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      }

      if (!imageUrl) throw new Error("Timeout waiting for image generation");

      // Download and send image (same as original)
      const response = await axios.get(imageUrl, { 
        responseType: "arraybuffer",
        timeout: 15000 // 15-second download timeout
      });
      
      await conn.sendMessage(
        m.chat,
        { 
          image: Buffer.from(response.data),
          caption: `🖼️ ${prompt}\n(Generated via Stable Diffusion SDXL)`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ Stable Diffusion Error:", err.response?.data || err.message);
      reply(`❌ Failed: ${err.message || "Check console for details"}`);
    }
  }
);
