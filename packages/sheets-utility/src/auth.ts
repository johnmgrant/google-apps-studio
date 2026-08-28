#!/usr/bin/env node

/**
 * Authentication setup for Google Sheets API.
 * This script helps you authenticate and generate the token.json file.
 */

import fs from 'fs';
import type {OAuth2Client} from 'google-auth-library';
import {google} from 'googleapis';
import http from 'http';
import open from 'open';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the OAuth scopes we need
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Paths to credential files
const TOKEN_PATH = path.join(__dirname, '../token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

interface Credentials {
  type: string;
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

interface CredentialsFile {
  installed?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
  web?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
}

/**
 * Load saved credentials if they exist.
 */
function loadSavedCredentials(): OAuth2Client | null {
  try {
    const content = fs.readFileSync(TOKEN_PATH, 'utf-8');
    const credentials = JSON.parse(content) as Credentials;
    return google.auth.fromJSON(credentials) as OAuth2Client;
  } catch {
    return null;
  }
}

/**
 * Save credentials to disk.
 */
function saveCredentials(client: OAuth2Client): void {
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  const keys = JSON.parse(content) as CredentialsFile;
  const key = keys.installed || keys.web;

  if (!key) {
    throw new Error('Invalid credentials file format');
  }

  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });

  fs.writeFileSync(TOKEN_PATH, payload);
  console.log('✓ Token saved to:', TOKEN_PATH);
}

/**
 * Create a new OAuth2 client and get authorization.
 */
async function getNewToken(): Promise<OAuth2Client> {
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  const keys = JSON.parse(content) as CredentialsFile;
  const key = keys.installed || keys.web;

  if (!key) {
    throw new Error('Invalid credentials file format');
  }

  const oauth2Client = new google.auth.OAuth2(
    key.client_id,
    key.client_secret,
    'http://localhost:3000/oauth2callback'
  );

  return new Promise((resolve, reject) => {
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('Please visit this URL to authorize the application:');
    console.log('\n', authorizeUrl, '\n');

    // Start a local server to receive the OAuth callback
    const server = http.createServer(async (req, res) => {
      try {
        if (req.url && req.url.indexOf('/oauth2callback') > -1) {
          const qs = new URL(req.url, 'http://localhost:3000').searchParams;
          const code = qs.get('code');

          res.end('Authentication successful! You can close this window.');
          server.close();

          if (!code) {
            reject(new Error('No authorization code received'));
            return;
          }

          const {tokens} = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);
          resolve(oauth2Client);
        }
      } catch (e) {
        reject(e);
      }
    });

    server.listen(3000, () => {
      console.log('Waiting for authentication...');
      // Try to open the browser automatically
      open(authorizeUrl).catch(() => {
        console.log(
          'Could not open browser automatically. Please copy the URL above.'
        );
      });
    });
  });
}

/**
 * Authenticate and authorize the client.
 */
export async function authorize(): Promise<OAuth2Client> {
  // Check if we have saved credentials
  const client = loadSavedCredentials();
  if (client) {
    console.log('✓ Using saved credentials from token.json');
    return client;
  }

  // Check if credentials.json exists
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('\n❌ Error: credentials.json not found!');
    console.error('\nPlease follow these steps:');
    console.error('1. Go to https://console.cloud.google.com/');
    console.error('2. Create a new project or select an existing one');
    console.error('3. Enable the Google Sheets API');
    console.error('4. Create OAuth 2.0 credentials (Desktop app)');
    console.error('5. Download the credentials JSON file');
    console.error('6. Save it as tools/sheets-utility/credentials.json');
    console.error('\nSee README.md for detailed instructions.\n');
    process.exit(1);
  }

  // Authenticate with OAuth2
  console.log('\n🔐 Starting OAuth2 authentication...');
  console.log('A browser window will open for you to sign in.\n');

  const newClient = await getNewToken();

  if (newClient.credentials) {
    saveCredentials(newClient);
  }

  return newClient;
}

/**
 * Verify that authentication works.
 */
async function verifyAuth(client: OAuth2Client): Promise<boolean> {
  const sheets = google.sheets({version: 'v4', auth: client});

  try {
    // Try a simple API call to verify authentication
    const response = await sheets.spreadsheets.get({
      spreadsheetId: '1f9v_yD2QR6l0I1nbDc0ysIYuHpvq_-iLyF-NZjCy0-w',
      fields: 'properties.title',
    });

    console.log('\n✅ Authentication successful!');
    console.log(
      '✓ Successfully accessed spreadsheet:',
      response.data.properties?.title
    );
    console.log('\nYou can now run the example scripts:');
    console.log('  npm run example:read');
    console.log('  npm run example:transpose\n');
    return true;
  } catch (error) {
    console.error(
      '\n❌ Authentication verification failed:',
      (error as Error).message
    );
    console.error('\nPossible issues:');
    console.error('1. You need to grant access to the spreadsheet');
    console.error('2. The spreadsheet ID might be incorrect');
    console.error('3. Your OAuth consent screen might need approval\n');
    return false;
  }
}

// Run authentication if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('='.repeat(60));
  console.log('Google Sheets API Authentication Setup');
  console.log('='.repeat(60));

  try {
    const client = await authorize();
    await verifyAuth(client);
  } catch (error) {
    console.error('\n❌ Authentication failed:', (error as Error).message);
    console.error('\nPlease check the error above and try again.\n');
    process.exit(1);
  }
}
