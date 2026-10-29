// src/lib/uploadDocument.js
import { google } from 'googleapis';
import { Readable } from 'stream';

// Inisialisasi OAuth2 client menggunakan kredensial dari environment variable
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Menyimpan refresh token untuk autentikasi Google API
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Memperbarui access token secara otomatis saat token kedaluwarsa
oauth2Client.on('tokens', (tokens) => {
  if (tokens.access_token) {
    oauth2Client.setCredentials(tokens);
  }
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

export async function uploadDocument(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const readableStream = Readable.from(buffer);

    // Mengunggah file ke Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [process.env.GOOGLE_FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: readableStream,
      },
      fields: 'id',
    });

    const fileId = response.data.id;

    // Mengatur izin akses file menjadi publik
    drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      fields: 'id',
    }).catch(err => {
      console.warn('Gagal mengatur izin akses file:', err.message);
    });

    return fileId;

  } catch (error) {
    console.error('Gagal mengupload dokumen:', error);
    throw error;
  }
}