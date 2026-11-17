import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const callbackUrl = () => {
  const uri = process.env.YAHOO_REDIRECT_URI;
  if (!uri) throw new Error('YAHOO_REDIRECT_URI missing');
  return uri;
};
export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration missing');
  return createClient(url, key, { auth: { persistSession: false } });
}
function encryptionKey() {
  const key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY || '', 'hex');
  if (key.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must be 64 hex characters');
  return key;
}
export function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64');
}
export function decrypt(value: string) {
  const bytes = Buffer.from(value, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), bytes.subarray(0,12));
  decipher.setAuthTag(bytes.subarray(12,28));
  return Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8');
}
export async function yahooAccessToken(userId: string) {
  const database = db();
  const { data, error } = await database.from('yahoo_connections').select('*').eq('user_id', userId).single();
  if (error || !data) throw new Error('Yahoo not connected');
  if (new Date(data.expires_at).getTime() > Date.now()+60000) return decrypt(data.access_token_encrypted);
  const secret = process.env.YAHOO_CLIENT_SECRET;
  const clientId = process.env.YAHOO_CLIENT_ID;
  if (!secret || !clientId) throw new Error('Yahoo configuration missing');
  const response = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`, 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({grant_type:'refresh_token',refresh_token:decrypt(data.refresh_token_encrypted) }),
    cache:'no-store'
  });
  if (!response.ok) throw new Error(`Yahoo refresh failed (${response.status})`);
  const tokens = await response.json();
  const { error: updateError } = await database.from('yahoo_connections').update({
    access_token_encrypted:encrypt(tokens.access_token),
    refresh_token_encrypted:encrypt(tokens.refresh_token || decrypt(data.refresh_token_encrypted)),
    expires_at:new Date(Date.now()+tokens.expires_in*1000).toISOString(),
    updated_at:new Date().toISOString()
  }).eq('user_id',userId);
  if (updateError) throw new Error('Could not securely persist refreshed Yahoo tokens');
  return tokens.access_token as string;
}
