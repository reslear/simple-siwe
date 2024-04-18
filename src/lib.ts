import { recoverMessageAddress, getAddress, isHex, toHex } from 'viem'
import type { Hex } from 'viem'
import type { SiweMessage } from './types.js'

export function parseMessage(message: string): SiweMessage {
  const lines = message.split('\n')
  const domain = lines[0]
  const address = getAddress(lines[1].trim())
  const uri = lines[2]

  const versionRegex = /Version:\s*(\S+)/
  const versionMatch = message.match(versionRegex)
  const version = versionMatch ? versionMatch[1] : ''

  const chainIdRegex = /Chain\s*ID:\s*(\d+)/
  const chainIdMatch = message.match(chainIdRegex)
  const chainId = chainIdMatch ? parseInt(chainIdMatch[1]) : 1

  const nonceRegex = /Nonce:\s*(\S+)/
  const nonceMatch = message.match(nonceRegex)
  const nonce = nonceMatch ? nonceMatch[1] : ''

  const issuedAtRegex = /Issued\s*At:\s*(\S+)/
  const issuedAtMatch = message.match(issuedAtRegex)
  const issuedAt = issuedAtMatch ? issuedAtMatch[1] : ''

  const statementRegex = /(?:\n{2})([\s\S]+)/
  const statementMatch = message.match(statementRegex)
  const statement = statementMatch ? statementMatch[1] : ''

  return {
    domain,
    address,
    statement,
    uri,
    version,
    chainId,
    nonce,
    issuedAt,
  }
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
  message: string
  signature: string | Hex
}) {
  const { address } = parseMessage(message)

  const recoveredAddress = await recoverMessageAddress({
    message,
    signature: isHex(signature) ? signature : toHex(signature),
  })

  return recoveredAddress === address
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
