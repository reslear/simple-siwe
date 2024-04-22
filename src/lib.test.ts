import { assert, describe, expect, it, test, vi } from 'vitest'
import type { SiweMessage } from './types.js'
import { InvalidAddressError, zeroAddress } from 'viem'
import { prepareMessage, verify } from './lib.js'
import { privateKeyToAccount } from 'viem/accounts'
import { generateNonce } from './utils.js'

vi.mock('./utils.js', () => ({
  generateNonce: vi.fn(),
}))

describe('verify message', () => {
  const message = {
    domain: 'example.com',
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    uri: 'https://example.com',
    version: '1',
    chainId: 1,
    nonce: '123',
    issuedAt: '2024-04-19T00:46:43Z',
    expirationTime: '2024-04-20T00:46:43Z',
    notBefore: '2024-04-18T00:46:43Z',
    requestId: '123',
    resources: ['https://example.com/resource'],
  }

  const account = privateKeyToAccount(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  )

  test('verify message with signature', async () => {
    const preparedMessage = prepareMessage(message)

    const signature = await account.signMessage({
      message: preparedMessage,
    })

    const result = await verify({ message, signature })

    expect(result).toBeTruthy()
  })

  test('verify message with invalid address', async () => {
    const messageWithInvalidAddress = {
      ...message,
      address: '10x',
    }
    const preparedMessage = prepareMessage(messageWithInvalidAddress)

    const signature = await account.signMessage({
      message: preparedMessage,
    })

    await expect(
      verify({ message: messageWithInvalidAddress, signature })
    ).rejects.toThrow(InvalidAddressError)
  })

  test('verify message with invalid signature', async () => {
    const preparedMessage = prepareMessage(message)

    const signature = await account.signMessage({
      message: preparedMessage,
    })

    await expect(
      verify({ message, signature: signature.slice(1) })
    ).rejects.toThrow(/Signature must be a hex string/)
  })
})

describe('prepare message', () => {
  it('should prepare a message with a statement', () => {
    const data = {
      domain: 'example.com',
      address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      uri: 'https://example.com',
      version: '1',
      nonce: 'a6041978-a319-4c2f-8096-abfb99635740',
      issuedAt: '2024-04-19T00:46:43Z',
      statement: 'I accept the Terms of Service: https://example.com/tos ',
      resources: ['https://example.com/resource'],
      requestId: '123',
      chainId: 1,
      expirationTime: '2024-04-20T00:46:43Z',
      notBefore: '2024-04-18T00:46:43Z',
    } as SiweMessage

    const message = prepareMessage(data)

    expect(message).toMatchInlineSnapshot(
      `"example.com wants you to sign in with your Ethereum account:
0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

I accept the Terms of Service: https://example.com/tos 

URI: https://example.com
Version: 1
Chain ID: 1
Nonce: a6041978-a319-4c2f-8096-abfb99635740
Issued At: 2024-04-19T00:46:43Z
Expiration Time: 2024-04-20T00:46:43Z
Not Before: 2024-04-18T00:46:43Z
Request ID: 123
Resources:
- https://example.com/resource"`
    )
  })

  it('should prepare a message without a statement', () => {
    const nonce = 'e4fc0ce5-aa83-4623-b193-98f6d30c9bb1'
    vi.mocked(generateNonce).mockReturnValue(nonce)

    const date = new Date(2000, 1, 1, 13)
    vi.setSystemTime(date)

    const data2 = {
      domain: 'example.com',
      address: zeroAddress,
      uri: 'https://example.com',
      version: '1',
    } as SiweMessage

    const message2 = prepareMessage(data2)

    expect(message2).toMatchInlineSnapshot(
      `"${data2.domain} wants you to sign in with your Ethereum account:
${data2.address}

URI: ${data2.uri}
Version: ${data2.version}
Chain ID: 1
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}"`
    )
  })
})
