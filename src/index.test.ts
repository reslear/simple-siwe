import { expect, test } from 'vitest'

import * as exports from './index.js'

test('exports', () => {
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "parseMessage",
      "generateNonce",
      "verify",
      "prepareMessage",
    ]
  `)
})
