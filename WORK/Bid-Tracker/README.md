# Bid Management System

## User Stories for Email-Based Bid Management System

### Assessment 1: Email Archiving with OAuth Integration

**As a business user, I want all incoming emails from our G-Suite inbox to be automatically stored in our database, so that I can maintain a complete record of all communications for compliance and reference.**

## Scope

* Integration with single G-Suite inbox using Gmail API and OAuth 2.0
* Complete email archiving including subject, body (text/HTML), metadata
* Attachment handling with Google Drive storage and linking
* No modification of existing email workflows

## Acceptance Criteria

1. System authenticates with Gmail API using OAuth without requiring password storage
2. All incoming emails are captured and stored in PostgreSQL within 5 minutes of receipt
3. Email attachments are uploaded to Google Drive with links stored in the database
4. Email metadata (sender, recipients, timestamps, headers) is properly captured
5. Email threading information is preserved
6. System handles emails with multiple recipients and CC/BCC fields correctly
7. Duplicate emails are identified and not stored multiple times

## Implementation Plan

1. **OAuth Setup & Configuration**

   * Create OAuth credentials in Google Cloud Console
   * Configure Authorized redirect URI (`https://developers.google.com/oauthplayground`)
   * Publish Consent Screen and add test user
   * Manage tokens (client ID/secret, refresh token) via `.env`
2. **Email Fetching Service**

   * Implement Gmail API integration with OAuth2 client
   * Poll every 5 minutes via `node-cron` or use push notifications
   * Handle pagination and history tracking
3. **Email Processing Service**

   * Parse email payload: headers, subject, body, snippet, thread ID
   * Extract and normalize data for storage
4. **Attachment Handling**

   * Download attachments via Gmail API
   * Upload to Google Drive under configured folder
   * Collect and store shareable file links
5. **Database Integration**

   * Define `emails` table schema in PostgreSQL
   * Store all relevant fields and enforce unique constraint on `message_id`
   * Create indexes on date, thread\_id for performance
6. **Testing & Deployment**

   * End-to-end manual and integration testing
   * Validate token refresh logic
   * Load/performance testing on sample volumes

---

# Getting Started

Follow these steps to set up and run the Email Archiver locally:

## 1. Clone the repository

```bash
git clone https://github.com/arunyerram/Bid-Tracker.git
cd Bid-Tracker/email-archiver
```

## 2. Install dependencies

```bash
npm install
```

## 3. Prepare environment variables

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```
2. Open `.env` and populate:

   ```dotenv
   PORT=5000
   GMAIL_CLIENT_ID=<your-client-id>
   GMAIL_CLIENT_SECRET=<your-client-secret>
   GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground
   GMAIL_REFRESH_TOKEN=<your-refresh-token>
   DATABASE_URL=postgresql://postgres:<your-db-password>@localhost:5432/email_archiver
   GOOGLE_DRIVE_FOLDER_ID=<your-drive-folder-id>
   ```

## 4. Initialize your database

Ensure PostgreSQL is running, then create the database and tables:

```bash
psql -U postgres -h localhost -p 5432 -f src/db/schema.sql
db_name=email_archiver
```

## 5. Obtain OAuth Refresh Token

1. Open OAuth 2.0 Playground: [https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
2. Click ⚙️ and enable “Use your own OAuth credentials”
3. Paste your Client ID & Secret
4. In Step 1, enter scopes:

   ```
   https://www.googleapis.com/auth/gmail.readonly
   https://www.googleapis.com/auth/gmail.modify
   https://www.googleapis.com/auth/gmail.metadata
   https://www.googleapis.com/auth/drive.file
   ```
5. Authorize APIs, consent, then Exchange authorization code for tokens
6. Copy the **Refresh token** into `.env`

## 6. Run the application

```bash
npm run dev
```

* The server will start on `http://localhost:5000`
* Every 5 minutes it fetches new emails and processes attachments
* You can also manually trigger via:

  ```bash
  curl http://localhost:5000/trigger
  ```

## 7. Verify

* Check your Google Drive folder for uploaded attachments
* Query the `emails` table in PostgreSQL to see stored records

```sql
SELECT id, message_id, thread_id, sender, recipients, cc, bcc, subject, date, snippet, drive_links
FROM emails
ORDER BY date DESC LIMIT 10;
```

---

You’re all set! If you encounter issues, please review your OAuth settings, database connection, and logs for errors.
