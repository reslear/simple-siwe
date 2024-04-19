import { expect, test, vi } from 'vitest'
import { generateNonce } from './utils.js'

const nonce = 'e4fc0ce5-aa83-4623-b193-98f6d30c9bb1'

vi.mock('crypto', () => ({
  randomUUID: vi.fn().mockReturnValue(nonce),
}))

test('should generate a nonce of at least 8 characters', () => {
  const nonce = generateNonce()
  expect(nonce).toBe(nonce)
})
