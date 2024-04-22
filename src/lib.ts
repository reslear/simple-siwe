import {
  recoverMessageAddress,
  isHex,
  isAddressEqual,
  isAddress,
  InvalidAddressError,
} from 'viem'
import type { Address, Hex } from 'viem'
import type { SiweMessage } from './types.js'
import { generateNonce } from './utils.js'

/**
 * Verifies the integrity of a message using a signature.
 * @param message The message to be verified.
 * @param signature The signature of the message.
 * @returns A boolean indicating whether the verification succeeded.
 */
export async function verify({
  message,
  signature,
}: {
  message: SiweMessage
  signature: string | Hex
}) {
  const preparedMessage = prepareMessage(message)

  if (!isAddress(message.address)) {
    throw new InvalidAddressError({ address: message.address })
  }

  if (!isHex(signature)) {
    throw new Error('Signature must be a hex string')
  }

  const recoveredAddress = await recoverMessageAddress({
    message: preparedMessage,
    signature,
  })

  return isAddressEqual(recoveredAddress, message.address)
}

/**
 * Prepares a message for signing.
 * @param message The message to be prepared.
 * @returns The prepared message.
 */
export function prepareMessage(message: SiweMessage) {
  // Construct the header
  const header = `${message.domain} wants you to sign in with your Ethereum account:\n`

  const address = message.address + '\n\n'

  // Construct the statement (if provided)
  const statement = message.statement ? `${message.statement}\n\n` : ''

  // Construct the body
  const body = [
    `URI: ${message.uri}`,
    `Version: ${message.version}`,
    `Chain ID: ${message.chainId || '1'}`,
    `Nonce: ${message.nonce ?? generateNonce()}`,
    `Issued At: ${message.issuedAt ?? new Date().toISOString()}`,
    message.expirationTime ? `Expiration Time: ${message.expirationTime}` : '',
    message.notBefore ? `Not Before: ${message.notBefore}` : '',
    message.requestId ? `Request ID: ${message.requestId}` : '',
    message.resources?.length
      ? `Resources:\n- ${message.resources.join('\n- ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  // Combine header, statement, and body
  const result = header + address + statement + body

  return result
}
