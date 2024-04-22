import { getAddress } from 'viem'
import type { SiweMessage } from './types.js'

// https://regex101.com/r/tEUS3J/1
export const HEADER_RE =
  /^(?:(?<scheme>.*?):\/\/)?(?<domain>.*?) wants you to sign in with your Ethereum account:/

const DOMAIN_RE = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/i

const FIELDS = {
  URI: 'uri',
  Version: 'version',
  'Chain ID': 'chainId',
  Nonce: 'nonce',
  'Issued At': 'issuedAt',
  'Expiration Time': 'expirationTime',
  'Not Before': 'notBefore',
  'Request ID': 'requestId',
  Resources: 'resources',
} as const

export function parseLine(str: string) {
  const index = str.indexOf(':')
  const [prefix, value] = [str.slice(0, index), str.slice(index + 1).trim()]

  return {
    line: str.trim(),
    key: FIELDS[prefix as keyof typeof FIELDS],
    value: value,
  }
}

export function* parseMessageLines(lines: string[]) {
  for (let i = 0; i < lines.length; i++) {
    yield { ...parseLine(lines[i]), i }
  }
}

/**
 *
 * @param message
 * @returns
 */
export function parseMessage(message: string): SiweMessage {
  const result = {} as Record<keyof SiweMessage, SiweMessage[keyof SiweMessage]>

  const lines = message.split('\n').filter(Boolean)
  const gen = parseMessageLines(lines)

  const match = gen.next().value?.line?.match(HEADER_RE)!

  if (match[1]) result.scheme = match[1]
  result.domain = match[2]

  result.address = getAddress(gen.next().value?.line || '')

  let curr
  while (((curr = gen.next()), !curr.done)) {
    if (!curr) continue

    const { key, value, line, i } = curr.value

    // push resources
    if (Array.isArray(result.resources) && line.startsWith('- ')) {
      result.resources.push(line.slice(2).trim())
      continue
    }

    if (!key) continue

    if (key === 'uri') {
      const statement = lines[i - 1]
      if (result.address !== statement) {
        if (statement.includes('/n')) {
          throw new Error('statement must not contain new line')
        }
        result.statement = statement
      }
    }

    if (key === 'resources') {
      result.resources = []
      continue
    }

    if (
      ['issuedAt', 'expirationTime', 'notBefore'].includes(key) &&
      value !== new Date(value).toISOString()
    ) {
      throw new Error('invalid date')
    }

    if (key === 'nonce' && value.length < 8) {
      throw new Error('nonce must be at least 8 characters')
    }

    if (key === 'version' && parseInt(value) !== 1) {
      throw new Error('version must be at least 1')
    }

    result[key] = key === 'chainId' ? parseInt(value) : value
  }

  if (!DOMAIN_RE.test(result.domain)) {
    throw new Error('domain not RFC4501 authority')
  }

  if (!result.uri) {
    throw new Error('URI is required')
  }

  if (
    (['domain', 'address', 'uri', 'version', 'chainId', 'nonce'] as const).some(
      (key) => !result[key]
    )
  ) {
    throw new Error('missing required fields')
  }

  return result as SiweMessage
}
