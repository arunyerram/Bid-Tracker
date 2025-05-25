// src/email/parseEmail.ts
// src/email/parseEmail.ts

import { gmail, drive } from '../config/google';
import { Readable } from 'stream';

function flatten(parts: any[] = []): any[] {
  return parts.reduce<any[]>((all, p) => {
    all.push(p);
    if (p.parts) all.push(...flatten(p.parts));
    return all;
  }, []);
}

export async function parseEmail(data: any) {
  const headers = data.payload.headers || [];
  const getHeader = (name: string) =>
    headers.find((h: any) => h.name === name)?.value || '';

  const messageId  = getHeader('Message-ID');
  console.log(`✉️  Parsing message ${messageId}`);

  // Build a list of every MIME part  
  const allParts = flatten(data.payload.parts);

  // Extract plain-text body
  let body = '';
  for (const part of allParts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      body += Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
  }

  // Find attachments
  const attachments = allParts
    .filter(p => p.filename && p.body?.attachmentId)
    .map(p => ({
      filename: p.filename as string,
      attachmentId: p.body.attachmentId as string,
      mimeType: p.mimeType as string
    }));
  console.log(`🔗 Found ${attachments.length} attachment(s) in ${messageId}`);

  // Download & upload each
  const driveLinks: string[] = [];
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (folderId) {
    for (const att of attachments) {
      try {
        // 1) fetch raw bytes from Gmail
        const attRes = await gmail.users.messages.attachments.get({
          userId: 'me',
          messageId: data.id,
          id: att.attachmentId
        });
        const raw = attRes.data.data!;
        const buf = Buffer.from(raw, 'base64');
        console.log(`   • Downloaded ${att.filename} (${buf.length} bytes)`);

        // 2) wrap in a Readable stream
        const stream = new Readable();
        stream.push(buf);
        stream.push(null);

        // 3) upload to Drive
        const uploaded = await drive.files.create({
          requestBody: {
            name: att.filename,
            parents: [folderId]
          },
          media: {
            mimeType: att.mimeType,
            body: stream
          }
        });

        const fileId = uploaded.data.id;
        if (fileId) {
          const link = `https://drive.google.com/file/d/${fileId}/view`;
          driveLinks.push(link);
          console.log(`   ✅ Uploaded to Drive: ${link}`);
        }
      } catch (err) {
        console.error(`   ❌ Failed to upload ${att.filename}:`, err);
      }
    }
  } else {
    console.warn('⚠️  GOOGLE_DRIVE_FOLDER_ID not set; skipping attachments');
  }

  return {
    messageId,
    threadId: data.threadId,
    sender: getHeader('From'),
    recipients: getHeader('To'),
    cc: getHeader('Cc') || '',
    bcc: getHeader('Bcc') || '',
    subject: getHeader('Subject'),
    body,
    date: new Date(Number(data.internalDate)),
    snippet: data.snippet || '',
    driveLinks
  };
}
