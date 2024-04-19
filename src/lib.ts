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
  const header = `${message.domain} wants you to sign in with your Ethereum account:`
  const uriField = `URI: ${message.uri}`
  let prefix = [header, message.address].join('\n')
  const versionField = `Version: ${message.version}`

  const chainField = `Chain ID: ` + (message.chainId || '1')

  const nonceField = message.nonce
    ? `Nonce: ${message.nonce}`
    : `Nonce: ${generateNonce()}`
  const issuedAt = message.issuedAt ?? new Date().toISOString()

  const suffixArray = [uriField, versionField, chainField, nonceField]

  suffixArray.push(`Issued At: ${issuedAt}`)

  let statement
  if (message.statement) {
    statement = message.statement
  } else {
    statement = `Login to ${message.domain}`
  }

  const suffix = suffixArray.join('\n')
  prefix = [prefix, statement].join('\n\n')
  if (statement) {
    prefix += '\n'
  }
  return [prefix, suffix].join('\n')
}
