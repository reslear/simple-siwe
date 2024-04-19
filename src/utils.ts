/**
 * Generate a random nonce
 * @returns A random uuid
 */
export function generateNonce() {
  return crypto.randomUUID()
}
