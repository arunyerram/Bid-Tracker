import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

export const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

export const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
export const drive = google.drive({ version: 'v3', auth: oAuth2Client });
