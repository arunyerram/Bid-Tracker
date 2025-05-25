// src/email/fetchEmails.ts
// src/email/fetchEmails.ts

import { gmail } from '../config/google';
import { parseEmail } from './parseEmail';
import { db } from '../db/index';

export async function fetchEmails() {
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 10,
    q: 'newer_than:1d has:attachment'
  });

  const messages = res.data.messages || [];
  console.log(`▶️  Found ${messages.length} messages with attachments`);

  for (const message of messages) {
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: message.id!,
      format: 'full'
    });
    const parsed = await parseEmail(msg.data);
    if (!parsed) continue;

    const {
      messageId, threadId, sender, recipients,
      cc, bcc, subject, body, date, snippet, driveLinks
    } = parsed;

    try {
      await db.query(
        `INSERT INTO emails
           (message_id, thread_id, sender, recipients, cc, bcc, subject, body, date, snippet, drive_links)
         VALUES
           ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (message_id) DO NOTHING`,
        [ messageId, threadId, sender, recipients, cc, bcc, subject, body, date, snippet, driveLinks ]
      );
    } catch (err) {
      console.error('DB error', err);
    }
  }
}
