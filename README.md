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
```

## 📚 Documentation

For detailed instructions, see **[INSTRUCTION_GUIDE.md](./INSTRUCTION_GUIDE.md)**

## 🎯 Features

- ✅ Wallet connection with IOTA dApp Kit
- ✅ Move smart contract (ticket_box) integration
- ✅ TypeScript + Next.js App Router
- ✅ Basic UI for create box / buy ticket / mark used
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

## 📄 License

MIT
