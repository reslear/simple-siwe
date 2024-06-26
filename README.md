> Archived because https://github.com/wevm/viem/pull/2280

# simple-siwe

[![Version](https://img.shields.io/npm/v/simple-siwe)](https://www.npmjs.com/simple-siwe)
[![Downloads](https://img.shields.io/npm/dt/simple-siwe)](https://www.npmjs.com/simple-siwe)
[![install size](https://packagephobia.com/badge?p=simple-siwe)](https://packagephobia.com/result?p=simple-siwe)
![npm bundle size](https://img.shields.io/bundlephobia/min/simple-siwe)

[publint](https://publint.dev/simple-siwe) |
[arethetypeswrong](https://arethetypeswrong.github.io/?p=simple-siwe)

Simple implementation Sign-In with Ethereum (SIWE) [eip-4361](https://eips.ethereum.org/EIPS/eip-4361) library with [Viem v2](https://viem.sh/)

- 🌱 Lightweight, minified ~1kb
- 🚫 No Dependency (only `viem` as peer)
- 🌳 Tree-shakable
- ✍️ TypeScript/Esm
- ✅ 100% test coverage

### Comparison

| Package                                                   | Size ▼                                                                                                                                            | Engine | Verify  | Parser      | Downloads                                                                                   |
|-----------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|--------|---------|-------------|---------------------------------------------------------------------------------------------|
| **[simple-siwe](https://github.com/reslear/simple-siwe)** | [![install size](https://badgen.net/packagephobia/install/simple-siwe?label)](https://packagephobia.com/result?p=simple-siwe)                     | Viem 2 | average | own (beta)  | ![Download month](https://badgen.net/npm/dm/simple-siwe?label&color=blue)                   |
| [eip-login](https://github.com/softwarecurator/eip-login) | [![install size](https://badgen.net/packagephobia/install/eip-login?label)](https://packagephobia.com/result?p=eip-login)                         | Viem 2 | low     | -           | ![Download month](https://badgen.net/npm/dm/eip-login?label&color=blue)                     |
| [siwviem](https://github.com/feelsgoodman-web3/siwviem)   | [![install size](https://badgen.net/packagephobia/install/@feelsgoodman/siwviem?label)](https://packagephobia.com/result?p=@feelsgoodman/siwviem) | Viem 1 | high    | siwe-parser | ![Download month](https://badgen.net/npm/dm/@feelsgoodman/siwviem/siwviem?label&color=blue) |
| **[siwe](https://github.com/spruceid/siwe)**              | [![install size](https://badgen.net/packagephobia/install/siwe?label)](https://packagephobia.com/result?p=siwe)                                   | ethers | high    | siwe-parser | ![Download month](https://badgen.net/npm/dm/siwe?label&color=blue)                          |
| [siwe-viem](https://github.com/Steen3S/siwe-viem)         | [![install size](https://badgen.net/packagephobia/install/siwe-viem?label)](https://packagephobia.com/result?p=siwe-viem)                         | Viem 2 | high    | siwe-parser | ![Download month](https://badgen.net/npm/dm/siwe-viem?label&color=blue)                     |
### Installation and Usage

You can install **simple-siwe** and **viem** using npm, yarn, or pnpm. Here's how you can install it using pnpm:

```bash
pnpm add simple-siwe viem
```

After importing `simple-siwe`, you can use its functions in your TypeScript code. Here's a basic example of how you can use the functions:

```typescript
import {
  parseMessage,
  generateNonce,
  verify,
  prepareMessage,
} from 'simple-siwe'

// Generate a nonce
const nonce = generateNonce()

// Prepare a message for signing
const message = prepareMessage({
  domain: 'example.com', // RFC 4501 dns authority that is requesting the signing
  address: '0x1234567890123456789012345678901234567890', // Ethereum address performing the signing
  statement: 'This is a sample statement for signing.', // Human-readable ASCII assertion
  uri: 'https://example.com/resource', // RFC 3986 URI referring to the resource
  version: '1.0', // Current version of the message
  chainId: 1, // EIP-155 Chain ID
  nonce, // Randomized token used to prevent replay attacks
  issuedAt: new Date().toISOString(), // ISO 8601 datetime string of the current time
})

// Verify a message with a signature
const isVerified = await verify({ message, signature: '0x...' })
```

### Backend & Frontend Implementation

Express.js example with a simple frontend implementation.

#### Backend side with

```ts
import express from 'express'
import { generateNonce, prepareMessage, verify } from 'simple-siwe'

const app = express()

app.get('/nonce', (req, res) => {
  const nonce = generateNonce()
  res.json({ nonce })
})

app.post('/verify', async (req, res) => {
  const { message, signature } = req.body

  try {
    const isValid = await verify({ message, signature })

    // save session logic here
    res.send({ isValid })
  } catch (error) {
    res.status(400).send({ isValid: false, error: error.message })
  }
})

app.listen(3000)
```

#### Frontend side:

```ts
import { generateNonce, prepareMessage, verify } from 'simple-siwe'
import type { SiweMessage } from 'simple-siwe'

// 1. Fetch nonce from the backend and prepare a message
const { nonce } = await fetch('http://localhost:3000/nonce').then((res) =>
  res.json()
)

// 2. Prepare a message with the nonce
const message: SiweMessage = {
  // ... message properties
  nonce,
}

const preparedMessage = prepareMessage(message)

// 3. Sign the message using wagmi or other signing methods
const signature = await signMessage({ message: preparedMessage })

// 4. Verify the signature on the backend
try {
  const { isValid } = await fetch('http://localhost:3000/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, signature }),
  }).then((res) => res.json())

  // 5. Done. Use the isValid boolean to determine if the signature is valid

  if (isValid) {
    // redirect to the dashboard
  } else {
    // show an error message
  }
} catch (error) {
  console.error(error)
}
```

## Troubleshooting

### `TypeError: Crypto.randomUUID is not a function`

The nonce is generated using the [Crypto: randomUUID() method](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID), which may not be supported in all browsers or Node.js versions. Consider using polyfills to ensure compatibility.

## Related

- https://github.com/spruceid/siwe
- https://www.npmjs.com/package/eip-login
- https://github.com/feelsgoodman-web3/siwviem
- https://github.com/Steen3S/siwe-viem

## License

This project is licensed under the terms of the [MIT license](LICENSE).
