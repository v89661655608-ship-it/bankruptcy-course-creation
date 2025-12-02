// Script to export all unused tokens from chat_tokens_pool
// Run with: node export_tokens_from_db.mjs
// IMPORTANT: You need to provide ADMIN_TOKEN environment variable

import fs from 'fs';

const ADMIN_URL = 'https://functions.poehali.dev/94be9de0-6f48-41a7-98b1-708c24fb05ad';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('Error: ADMIN_TOKEN environment variable is required');
  console.error('Usage: ADMIN_TOKEN=your_token_here node export_tokens_from_db.mjs');
  process.exit(1);
}

async function exportTokens() {
  try {
    console.log('Fetching all unused tokens from database...');
    console.log('');

    const response = await fetch(`${ADMIN_URL}?resource=export-tokens`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': ADMIN_TOKEN
      }
    });

    console.log('Status:', response.status, response.statusText);
    console.log('');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      process.exit(1);
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('Failed to export tokens:', data);
      process.exit(1);
    }

    console.log(`Successfully fetched ${data.count} tokens`);
    console.log('');

    // Записываем токены в файл (один токен на строку)
    const content = data.tokens.join('\n');
    fs.writeFileSync('chat_tokens_1000.txt', content + '\n', 'utf8');

    console.log(`Tokens saved to: chat_tokens_1000.txt`);
    console.log(`Total tokens exported: ${data.count}`);
    console.log('');
    console.log('Done!');

    return data.count;

  } catch (error) {
    console.error('Error occurred:', error.message);
    throw error;
  }
}

exportTokens().catch(console.error);
