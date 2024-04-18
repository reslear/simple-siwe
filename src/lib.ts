import { recoverMessageAddress, getAddress } from 'viem'
import type { Hex } from 'viem'
import type { SiweMessage } from './types.js'

export function parseMessage(message: string) {
  const lines = message.split('\n')
  const address = getAddress(lines[1].trim())

  return {
    address,
  } as SiweMessage
}

export function generateNonce() {
  return crypto.randomUUID()
}

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
  signature: Hex
}) {
  const preparedMessage = prepareMessage(message)

  const recoveredAddress = await recoverMessageAddress({
    message: preparedMessage,
    signature,
  })

  return recoveredAddress === message.address
}

export function prepareMessage(message: SiweMessage) {
  const header = `${message.domain} wants you to sign in with your Ethereum account:`
  const uriField = `URI: ${message.uri}`
  let prefix = [header, message.address].join('\n')
  const versionField = `Version: ${message.version}`

  const chainField = `Chain ID: ` + (message.chainId || '1')

  let nonceField

  if (message.nonce) {
    nonceField = `Nonce: ${message.nonce}`
  } else {
    nonceField = `Nonce: ${generateNonce()}`
  }

  let issuedAt
  if (message.issuedAt) {
    issuedAt = message.issuedAt
  } else {
    issuedAt = new Date().toISOString()
  }

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
