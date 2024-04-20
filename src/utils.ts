/**
 * Generate a random nonce
 * @returns A random uuid v4 as string
 */
export function generateNonce() {
  return crypto.randomUUID() + ''
}
