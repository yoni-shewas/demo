import crypto from 'crypto';

/**
 * Base64URL encode (RFC 4648)
 * @param {string} str - String to encode
 * @returns {string} - Base64URL encoded string
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64URL decode
 * @param {string} str - Base64URL encoded string
 * @returns {string} - Decoded string
 */
function base64UrlDecode(str) {
  // Add padding if needed
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Create HMAC SHA256 signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} - Base64URL encoded signature
 */
function createSignature(data, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  return base64UrlEncode(hmac.digest());
}

/**
 * Parse expiration time string (e.g., '1d', '7d', '1h', '30m')
 * @param {string} expiresIn - Expiration time string
 * @returns {number} - Expiration timestamp in seconds
 */
function parseExpiresIn(expiresIn) {
  const units = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid expiresIn format. Use format like: 1d, 7d, 1h, 30m');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  return value * units[unit];
}

/**
 * Create a JWT token manually using crypto
 * @param {Object} payload - JWT payload (user data)
 * @param {string} secret - Secret key for signing
 * @param {string} expiresIn - Expiration time (e.g., '1d', '7d', '1h')
 * @returns {string} - JWT token
 */
export function createJWT(payload, secret, expiresIn = '1d') {
  // JWT Header
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  // Calculate expiration
  const expirationSeconds = parseExpiresIn(expiresIn);
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expirationSeconds;

  // JWT Payload with standard claims
  const jwtPayload = {
    ...payload,
    iat: now, // Issued at
    exp: exp, // Expiration time
  };

  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));

  // Create signature
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const signature = createSignature(dataToSign, secret);

  // Return complete JWT
  return `${dataToSign}.${signature}`;
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key used for signing
 * @returns {Object} - Decoded payload if valid
 * @throws {Error} - If token is invalid or expired
 */
export function verifyJWT(token, secret) {
  try {
    // Split token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = createSignature(dataToSign, secret);

    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token has expired');
    }

    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
  }
}

/**
 * Decode JWT without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object} - Decoded header and payload
 */
export function decodeJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  return {
    header: JSON.parse(base64UrlDecode(parts[0])),
    payload: JSON.parse(base64UrlDecode(parts[1])),
  };
}
