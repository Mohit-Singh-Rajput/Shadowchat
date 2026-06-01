const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || 'shadow_chat_aes256_encryption_key_32bytes!',
  'utf8'
).slice(0, 32);

/**
 * Encrypt a message using AES-256-CBC
 * @param {string} text - Plain text message
 * @returns {{ encryptedMessage: string, iv: string }}
 */
const encryptMessage = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedMessage: encrypted,
    iv: iv.toString('hex'),
  };
};

/**
 * Decrypt a message using AES-256-CBC
 * @param {string} encryptedMessage - Encrypted hex string
 * @param {string} iv - IV hex string
 * @returns {string} - Decrypted plain text
 */
const decryptMessage = (encryptedMessage, iv) => {
  try {
    const ivBuffer = Buffer.from(iv, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, ivBuffer);
    let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return '[Encrypted Message]';
  }
};

/**
 * Generate a simulated public/private key pair
 * @returns {{ publicKey: string, privateKey: string }}
 */
const generateKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
};

/**
 * Generate a random session ID
 * @returns {string}
 */
const generateSessionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

module.exports = { encryptMessage, decryptMessage, generateKeyPair, generateSessionId };
