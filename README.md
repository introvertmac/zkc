# Universal SOL Token Compressor

## Overview

Universal SOL Token Compressor is a web application that allows users to manage and compress their Solana-based tokens using zero-knowledge (ZK) compression technology. This project leverages the Light Protocol to provide efficient token compression, reducing storage costs and improving scalability on the Solana blockchain.

## Features

- Connect Solana wallets (e.g., Phantom)
- View token balances (SOL and USDC)
- Compress SOL and SPL tokens
- View compressed and native token balances
- Transaction history
- Support for custom SPL tokens

## Technology Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Solana Web3.js
- @solana/wallet-adapter libraries
- Light Protocol (@lightprotocol/stateless.js, @lightprotocol/compressed-token)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A Solana wallet (e.g., Phantom)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/universal-sol-token-compressor.git
   cd universal-sol-token-compressor
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   ```
   NEXT_PUBLIC_SOLANA_RPC_URL=your_solana_rpc_url
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Connect your Solana wallet using the "Connect Wallet" button in the header.
2. View your token balances on the dashboard.
3. Use the compression form to compress SOL or USDC tokens.
4. Check your transaction history for recent activities.

## Key Components

- `CompressForm`: Handles token compression for SOL and SPL tokens.
- `TokenList` and `TokenCard`: Display token balances.
- `TransactionHistory`: Shows recent transactions.
- `compressionService`: Contains core logic for token compression and fetching balances.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Solana](https://solana.com/)
- [Light Protocol](https://lightprotocol.com/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Disclaimer

This project is for educational purposes only. Use at your own risk. Always ensure you understand the implications of compressing tokens on the Solana blockchain.