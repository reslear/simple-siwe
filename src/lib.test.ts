import { describe, expect, it, test } from 'vitest'
import { zeroAddress } from 'viem'
import { generateNonce, parseMessage, prepareMessage, verify } from './lib.js'
import type { SiweMessage } from './types.js'
import { privateKeyToAccount } from 'viem/accounts'

test('parse message', () => {
  const data = {
    domain: 'example.com',
    address: zeroAddress,
    uri: 'https://example.com',
    version: '1',
    chainId: 1,
    nonce: '123',
    issuedAt: new Date().toISOString(),
  } as SiweMessage

  const message = prepareMessage(data)
  const parsedMessage = parseMessage(message)

  expect(parsedMessage.address).toBe(data.address)
})

test('should generate a nonce of at least 8 characters', () => {
  const nonce = generateNonce()
  expect(nonce.length).toBeGreaterThanOrEqual(8)
})

test('verify message', async () => {
  const message = prepareMessage({
    domain: 'example.com',
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    uri: 'https://example.com',
    version: '1',
    chainId: 1,
    nonce: '123',
    issuedAt: new Date().toISOString(),
  })

  const account = privateKeyToAccount(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  )
  const signature = await account.signMessage({
    message: message,
  })

  expect(
    await verify({
      message,
      signature: signature,
    })
  ).toBeTruthy()
})

describe('prepare message', () => {
  it('should prepare a message with a statement', () => {
    const data = {
      domain: 'example.com',
      address: zeroAddress,
      uri: 'https://example.com',
      version: '1',
      nonce: '123',
      issuedAt: new Date().toISOString(),
      statement: 'I accept the Terms of Service: https://example.com/tos ',
    } as SiweMessage

    const message = prepareMessage(data)

    expect(message).toMatchInlineSnapshot(
      `"${data.domain} wants you to sign in with your Ethereum account:
${data.address}

${data.statement}

URI: ${data.uri}
Version: ${data.version}
Chain ID: 1
Nonce: ${data.nonce}
Issued At: ${data.issuedAt}"`
    )
  })

  it('should prepare a message without a statement', () => {
    const data2 = {
      domain: 'example.com',
      address: zeroAddress,
      uri: 'https://example.com',
      version: '1',
      issuedAt: new Date().toISOString(),
    } as SiweMessage

    const message2 = prepareMessage(data2)

    expect(message2).toMatchInlineSnapshot(
      `"${data2.domain} wants you to sign in with your Ethereum account:
${data2.address}

Login to ${data2.domain}

URI: ${data2.uri}
Version: ${data2.version}
Chain ID: 1
Nonce: ${data2.nonce}
Issued At: ${data2.issuedAt}"`
    )
  })
})
