const { SinhalaSub } = require('@sl-code-lords/movie-api');
const { readEnv } = require('../lib/database');
const { cmd } = require('../command');
const axios = require('axios');
const { PixaldrainDL } = require('pixaldrain-sinhalasub');
const { getMovies, getMovieDL } = require('dark-yasiya-sinhalasub.lk');
const { fetchJson } = require('../lib/functions');

// 🧠 Function to fetch premium users
async function getPremiumUsers() {
  const usersData = await fetchJson('https://raw.githubusercontent.com/Manmitha96/PIKO-s-BOT/main/premium.json');
  const premiumUsers = usersData.split(',');
  return premiumUsers.map(user => user.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
}

// 🎬 Search & Select Movie Command
cmd({
  pattern: 'moviedown',
  alias: ['ms'],
  desc: 'Search Sinhala Subbed Movies',
  react: '🎬',
  category: 'extra',
  filename: __filename
}, async (robin, m, chat, { from, sender, q, reply }) => {
  try {
    const premiumUsers = await getPremiumUsers();
    if (!premiumUsers.includes(sender)) {
      return reply('🚩 This command is for *Premium Users* only.\nBuy Premium: 0743381623');
    }

    const env = await readEnv();
    const result = await getMovies(q);
    if (!result.result.length) return reply('🚫 No results found.');

    const movieButtons = [{
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '🎬 Select a Movie',
        sections: [{
          title: 'Search Results',
          rows: result.result.map(movie => ({
            title: movie.title,
            id: env.PREFIX + 'mds ' + movie.link
          }))
        }]
      })
    }];

    await robin.sendButtonMessage(from, movieButtons, chat, {
      header: '🍿 Sinhala Sub Movies',
      body: '📌 Choose a movie to download',
      footer: 'Made by P_I_K_O ☯️'
    });
  } catch (e) {
    console.error(e);
    reply('❌ Error: ' + e.message);
  }
});

// 🎬 Download Movie by Link Command
cmd({
  pattern: 'mds',
  desc: 'Download Sinhala Sub Movie',
  react: '🎥',
  category: 'movie',
  filename: __filename
}, async (client, m, chat, { from, sender, q, reply }) => {
  try {
    const premiumUsers = await getPremiumUsers();
    if (!premiumUsers.includes(sender)) {
      return reply('🚩 Premium access only. Call 0743381623 to buy.');
    }

    const movieInfo = await SinhalaSub.movie(q);
    const downloadInfo = await getMovieDL(q);

    const title = downloadInfo?.result?.title ?? 'Not found';
    const movieCaption = `
🎬 *Title:* ${title}
📅 *Date:* ${downloadInfo?.result?.date ?? 'N/A'}
🌍 *Country:* ${downloadInfo?.result?.country ?? 'N/A'}
⏳ *Duration:* ${movieInfo?.result?.duration ?? 'N/A'}
🎭 *Genres:* ${movieInfo?.result?.categories?.join(', ') || 'N/A'}
✍️ *Subber:* ${movieInfo?.result?.subtitle_author ?? 'N/A'}
🎬 *Director:* ${movieInfo?.result?.director?.name ?? 'N/A'}
👥 *Cast:* ${movieInfo?.result?.cast?.map(c => c.name).join(', ') || 'N/A'}
🔗 *URL:* ${q}
> POWERED by *P_I_K_O* ☯️
`;

    const sd = await PixaldrainDL(q, 'SD 480p', 'direct');
    const hd = await PixaldrainDL(q, 'HD 720p', 'direct');
    const fhd = await PixaldrainDL(q, 'FHD 1080p', 'direct');

    const qualityMsg = `
🔢 *Reply with the number to download*
🎥 *1 | 480p:* ${sd || 'N/A'}
🎥 *2 | 720p:* ${hd || 'N/A'}
🎥 *3 | 1080p:* ${fhd || 'N/A'}
> Made by *P_I_K_O* ☯️
`;

    await client.sendMessage(from, {
      image: { url: movieInfo?.result?.images?.[0] || 'https://i.ibb.co/FmLSHkS/not-found.jpg' },
      caption: movieCaption,
    }, { quoted: m });

    const sent = await client.sendMessage(from, { text: qualityMsg }, { quoted: m });
    const replyId = sent.key.id;

    client.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message) return;

      const txt = msg.message.conversation || msg.message.extendedTextMessage?.text;
      const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === replyId;
      const rjid = msg.key.remoteJid;

      if (isReply && ['1', '2', '3'].includes(txt)) {
        const link = txt === '1' ? sd : txt === '2' ? hd : fhd;
        const doc = {
          document: { url: link },
          mimetype: 'video/mp4',
          fileName: `${title}.mkv`,
          caption: `🎬 *${title}*\n📽️ Quality: ${txt === '1' ? '480p' : txt === '2' ? '720p' : '1080p'}\n> Made by *P_I_K_O* ☯️`
        };
        await client.sendMessage(rjid, doc, { quoted: msg });
      }
    });
  } catch (e) {
    console.error(e);
    reply('❌ Error: ' + e.message);
  }
});
