# Ticket Box dApp (IOTA + Move)

Next.js + IOTA dApp Kit + Move smart contract sample for selling/using tickets.

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build & deploy Move package (update lib/config.ts with the returned packageId)
npm run ticket:deploy

# Start development server
npm run dev

# Start verifier UI on a separate port/tab(write on terminal: if (Test-Path .next\dev\lock) { Remove-Item .next\dev\lock -Force }; npm run dev:verifier )

npm run dev:verifier
```

Open http://localhost:3001/verifier in a separate tab to validate buy-ticket digests while the main dApp (create/buy/use) can stay on http://localhost:3000.

## 📚 Documentation

For detailed instructions, see **[INSTRUCTION_GUIDE.md](./INSTRUCTION_GUIDE.md)**

## 🎯 Features

- ✅ Wallet connection with IOTA dApp Kit
- ✅ Move smart contract (ticket_box) integration
- ✅ TypeScript + Next.js App Router
- ✅ Basic UI for create box / buy ticket / mark used
- ✅ Transaction verifier page (`/verifier`) to check buy-ticket digests on a dedicated port
- ✅ Script alias `npm run ticket:deploy` (wrapper over create-iota-dapp)

## 📁 Project Structure

```
├── app/              # Next.js app directory
├── components/       # React components
├── hooks/            # Custom hooks
├── lib/              # Configuration
└── contract/         # Move contracts
```

## 📚 Learn More

- [IOTA Documentation](https://wiki.iota.org/)
- [IOTA dApp Kit](https://github.com/iotaledger/dapp-kit)
- [Next.js Documentation](https://nextjs.org/docs)

## Contract Addresses

- Devnet: `0xdaed73e0337b1e040c4a0c6e10b13f517e0d910b15a75d3202645ceaaf4e6adf`
- Testnet: `0x7b876fea5417cb4b08b485a7f21e8bd984b746da04dfb93c72eefc3d5ab5e50e`
- Wallet: `0x6dcbbc31d4db7a3169714d55a917a7e5e429c81016987e7fd12b6c34a2416fda`

## 📄 License MIT

Link Status LinkedIn: https://www.linkedin.com/posts/pham-dinh-hung-5253a53a0_productive-morning-at-the-build-on-iota-workshop-activity-7403309657013878784-VJdk?utm_source=share&utm_medium=member_desktop&rcm=ACoAAGJNMq0BmnBdxHDEtKVWDX8b3nU5EiUO4Qw
