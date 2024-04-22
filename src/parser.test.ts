import { describe, expect, it } from 'vitest'
import { HEADER_RE, parseMessage, parseLine } from './parser.js'
import { prepareMessage } from './lib.js'

import parsingPositive from '../test/parsing_positive.json'
import parsingNegative from '../test/parsing_negative.json'
import { SiweMessage } from './types.js'

describe('parser', () => {
  it('domain scheme', () => {
    const match =
      'https://service.org wants you to sign in with your Ethereum account:'.match(
        HEADER_RE
      )

    expect([match?.[1], match?.[2]]).toEqual(['https', 'service.org'])
  })

  it('split', () => {
    const result = parseLine('URI: https://service.org/login')
    expect(result).toEqual({
      line: 'URI: https://service.org/login',
      key: 'uri',
      value: 'https://service.org/login',
    })
  })

  it('should parse message using each', () => {
    const message = {
      domain: 'service.org',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      statement:
        'I accept the ServiceOrg Terms of Service: https://service.org/tos',
      uri: 'https://service.org/login',
      version: '1',
      chainId: 1,
      nonce: '32891757',
      issuedAt: '2021-09-30T16:25:24.000Z',
    }

    const prepared = prepareMessage(message)
    const result = parseMessage(prepared)

    expect(result).toEqual(message)
  })
})

describe('Successfully parses with ABNF Client', () => {
  it.concurrent.each(Object.entries(parsingPositive))('%s', (_, test) => {
    const parsedMessage = parseMessage(test.message)

    for (const [field, value] of Object.entries(test.fields)) {
      const parsedValue = parsedMessage[field as keyof SiweMessage]

      if (value === null) {
        expect(parsedValue).toBeUndefined()
      } else if (typeof value === 'object') {
        expect(parsedValue).toStrictEqual(value)
      } else {
        expect(parsedValue).toBe(value)
      }
    }
  })
})

// describe('Successfully fails with ABNF Client', () => {
//   it.concurrent.each(Object.entries(parsingNegative))('%s', (_, test) => {
//     expect(() => parseMessage(test)).toThrow()
//   })
// })
