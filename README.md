# simple-siwe 

[![Version](https://img.shields.io/npm/v/simple-siwe)](https://www.npmjs.com/simple-siwe)
[![Downloads](https://img.shields.io/npm/dt/simple-siwe)](https://www.npmjs.com/simple-siwe)
[![install size](https://packagephobia.com/badge?p=simple-siwe)](https://packagephobia.com/result?p=simple-siwe)
![npm bundle size](https://img.shields.io/bundlephobia/min/simple-siwe)


[publint](https://publint.dev/simple-siwe) | 
[arethetypeswrong](https://arethetypeswrong.github.io/?p=simple-siwe)


Simple implementation Sign-In with Ethereum (SIWE) [eip-4361](https://eips.ethereum.org/EIPS/eip-4361) library with [Viem v2](https://viem.sh/)

- 🌱 Lightweight, minified ~1kb
- 🚫 Dependency-free
- 🌳 Tree-shakable
- ✍️ Written in TypeScript
- ✅ 100% test coverage

### Installation and Usage

You can install **simple-siwe** and **viem** using npm, yarn, or pnpm. Here's how you can install it using pnpm:

```bash
pnpm add simple-siwe viem
```

After importing `simple-siwe`, you can use its functions in your TypeScript code. Here's a basic example of how you can use the functions:

```typescript
import { parseMessage, generateNonce, verify, prepareMessage } from 'simple-siwe'
import type { SiweMessage } from 'simple-siwe'

// Prepare a message for signing
const message = prepareMessage({
  nonce: "0x...",
  redirect: "https://example.com",
  timestamp: Date.now(),
})

// Verify a message with a signature
const isVerified = await verify({ message, signature: "0x..." })

// Generate a nonce
const nonce = generateNonce()
```

### Generating a nonce

The nonce is generated using the [Crypto: randomUUID() method](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID), which may not be supported in all browsers or Node.js versions. Consider using polyfills to ensure compatibility.


### Backend & Frontend Implementation

Express.js example:

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
    await verify({ message, signature })

    // save session logic here
    res.send({ message: 'Signature verified' })
  } catch (error) {
    res.status(400).send({ error: error.message })
  }

})

app.listen(3000)
```

Frontend example:

```ts
import { generateNonce, prepareMessage, verify } from 'simple-siwe'

const nonce = await fetch('http://localhost:3000/nonce').then(res => res.json())
const message = prepareMessage({ nonce, redirect: 'https://example.com', timestamp: Date.now() })
```

### Frontend Implementation

```ts
import { generateNonce, prepareMessage, verify } from 'simple-siwe'
```

## Related
- https://github.com/spruceid/siwe
- https://www.npmjs.com/package/eip-login
- https://github.com/feelsgoodman-web3/siwviem
- https://github.com/Steen3S/siwe-viem

## License
This project is licensed under the terms of the [MIT license](LICENSE).
