const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

const API_URL = "https://api.skymansion.site/movies-dl/search";
const DOWNLOAD_URL = "https://api.skymansion.site/movies-dl/download";
const API_KEY = config.MOVIE_API_KEY;

cmd({
    pattern: "movie",
    alias: ["moviedl", "films"],
    react: '🎬',
    category: "download",
    desc: "Search and download movies from PixelDrain",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q || q.trim() === '') {
            return await reply('❌ Please provide a movie name! (e.g., Deadpool 720p)');
        }

        // Extract desired quality from user input (default is 480p)
        const qualityRegex = /(480p|720p|1080p)/i;
        const qualityMatch = q.match(qualityRegex);
        const desiredQuality = qualityMatch ? qualityMatch[1].toUpperCase() : "480P";

        // Remove quality from query to get clean movie name
        const searchQuery = q.replace(qualityRegex, '').trim();

        if (!searchQuery) {
            return await reply('❌ Please provide a valid movie name!');
        }

        // Fetch movie search results
        const searchUrl = `${API_URL}?q=${encodeURIComponent(searchQuery)}&api_key=${API_KEY}`;
        const response = await fetchJson(searchUrl);

        if (!response || !response.SearchResult || !response.SearchResult.result.length) {
            return await reply(`❌ No results found for: *${searchQuery}*`);
        }

        const selectedMovie = response.SearchResult.result[0]; // Select first result
        const detailsUrl = `${DOWNLOAD_URL}/?id=${selectedMovie.id}&api_key=${API_KEY}`;
        const detailsResponse = await fetchJson(detailsUrl);

        if (!detailsResponse || !detailsResponse.downloadLinks || !detailsResponse.downloadLinks.result.links.driveLinks.length) {
            return await reply('❌ No PixelDrain download links found.');
        }

        // Search for user-desired quality first
        const pixelDrainLinks = detailsResponse.downloadLinks.result.links.driveLinks;
        let selectedDownload = pixelDrainLinks.find(link => link.quality.toUpperCase().includes(desiredQuality));

        // Fallback to 480p if user’s preferred quality is not available
        if (!selectedDownload && desiredQuality !== "480P") {
            selectedDownload = pixelDrainLinks.find(link => link.quality.toUpperCase().includes("480P"));
            if (selectedDownload) {
                await reply(`⚠️ ${desiredQuality} not available. Falling back to 480p.`);
            }
        }

        if (!selectedDownload || !selectedDownload.link.startsWith('http')) {
            const available = pixelDrainLinks.map(link => link.quality).join(', ');
            return await reply(`❌ No valid link available.\nAvailable qualities: ${available}`);
        }

        // Convert to direct download link
        const fileId = selectedDownload.link.split('/').pop();
        const directDownloadLink = `https://pixeldrain.com/api/file/${fileId}?download`;

        // Sanitize filename
        const safeTitle = selectedMovie.title.replace(/[<>:"/\\|?*]+/g, '_');
        const filePath = path.join(__dirname, `${safeTitle}-${desiredQuality}.mp4`);

        // Start downloading
        const writer = fs.createWriteStream(filePath);
        const { data } = await axios({
            url: directDownloadLink,
            method: 'GET',
            responseType: 'stream',
            timeout: 5 * 60 * 1000 // 5 minutes timeout
        });

        data.pipe(writer);

        writer.on('finish', async () => {
            await robin.sendMessage(from, {
                document: fs.readFileSync(filePath),
                mimetype: 'video/mp4',
                fileName: `${safeTitle}-${desiredQuality}.mp4`,
                caption: `🎬 *${selectedMovie.title}*\n📌 Quality: ${desiredQuality}\n✅ *Download Complete!*`,
                quoted: mek
            });
            await fs.promises.unlink(filePath);
        });

        writer.on('error', async (err) => {
            console.error('Download Error:', err);
            await reply('❌ Failed to download movie. Please try again.');
        });

    } catch (error) {
        console.error('Error in movie command:', error);
        await reply('❌ Sorry, something went wrong. Please try again later.');
    }
});
