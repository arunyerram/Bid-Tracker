
// src/server.ts

import express, { Request, Response } from 'express';
import cron from 'node-cron';
import { fetchEmails } from './email/fetchEmails';

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/trigger', async (_req: Request, res: Response) => {
  try {
    await fetchEmails();
    res.send('✅ Emails fetched and archived.');
  } catch (err) {
    console.error('❌ Failed to fetch emails', err);
    res.status(500).send('❌ Failed to fetch emails');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ---- Add this block to schedule every 5 minutes ----
cron.schedule('*/5 * * * *', async () => {
  console.log('⏰ Scheduled fetchEmails running...');
  try {
    await fetchEmails();
    console.log('✅ Scheduled fetchEmails completed.');
  } catch (err) {
    console.error('❌ Scheduled fetchEmails error', err);
  }
});
