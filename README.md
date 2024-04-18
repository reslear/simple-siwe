# simple-siwe 

[![Version](https://img.shields.io/npm/v/simple-siwe)](https://www.npmjs.com/simple-siwe/simple-siwe)
[![Downloads](https://img.shields.io/npm/dt/simple-siwe)](https://www.npmjs.com/simple-siwe/simple-siwe)
[publint](https://publint.dev/simple-siwe) | 
[arethetypeswrong](https://arethetypeswrong.github.io/?p=simple-siwe)


Simple implementation Sign-In with Ethereum (SIWE) library with Viem v2

- Lightweight
- Dependency-free, except for viem
- Tree-shakable
- Written in TypeScript and supports ESM
- 100% test coverage

### Installation and Usage

You can install **simple-siwe** using npm, yarn, or pnpm. Here's how you can install it using pnpm:

```bash
pnpm add simple-siwe
```

After importing `simple-siwe`, you can use its functions in your TypeScript code. Here's a basic example of how you can use the functions:

```typescript
import { parseMessage, generateNonce, verify, prepareMessage } from 'simple-siwe';

// Example usage of functions
const message = parseMessage("Your SIWE message goes here...");
const nonce = generateNonce();
const isVerified = await verify({ message, signature: "signature-hex-value" });
const preparedMessage = prepareMessage(message);
```

You can use these functions to parse SIWE messages, generate nonces, verify message integrity with signatures, and prepare SIWE messages for signing.


## Related
- https://github.com/spruceid/siwe
- https://www.npmjs.com/package/eip-login
- https://github.com/feelsgoodman-web3/siwviem
- https://github.com/Steen3S/siwe-viem

## License
This project is licensed under the terms of the [MIT license](LICENSE).
