// scripts/getRefreshToken.js
// Cara pakai: node scripts/getRefreshToken.js KODE_DARI_GOOGLE
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000'
);

const code = process.argv[2];

if (!code) {
  console.error('Isi kode otorisasi: node scripts/getRefreshToken.js KODE');
  process.exit(1);
}

oauth2Client.getToken(code).then(({ tokens }) => {
  console.log('Refresh Token:', tokens.refresh_token);
}).catch((err) => {
  console.error('Error:', err.message);
});