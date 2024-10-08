'use client'

import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import TokenList from './tokens/TokenList';
import { getCompressedTokens } from '@/services/compressionService';

interface Token {
  name: string;
  symbol: string;
  balance: number;
  compressedBalance: number;
  nativeBalance: number;
}

const USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'; // Devnet USDC mint address

const MainContent: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    const fetchTokens = async () => {
      if (!publicKey) return;

      try {
        // Fetch native SOL balance
        const solBalance = await connection.getBalance(publicKey);
        const solToken: Token = {
          name: 'Solana',
          symbol: 'SOL',
          balance: solBalance / 1e9,
          compressedBalance: 0,
          nativeBalance: solBalance / 1e9,
        };

        // Fetch compressed USDC
        const compressedUSDC = await getCompressedTokens(publicKey.toBase58(), USDC_MINT);
        const compressedUSDCBalance = compressedUSDC.reduce((acc, token) => acc + token.parsed.amount.toNumber(), 0) / 1e6;

        // Fetch native USDC
        const nativeUSDCAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: new PublicKey(USDC_MINT) });
        const nativeUSDCBalance = nativeUSDCAccounts.value.reduce((acc, account) => acc + account.account.data.parsed.info.tokenAmount.uiAmount, 0);

        const usdcToken: Token = {
          name: 'USD Coin',
          symbol: 'USDC',
          balance: compressedUSDCBalance + nativeUSDCBalance,
          compressedBalance: compressedUSDCBalance,
          nativeBalance: nativeUSDCBalance,
        };

        setTokens([solToken, usdcToken]);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    fetchTokens();
  }, [publicKey, connection]);

  return (
    <div className="space-y-8">
      <TokenList tokens={tokens} />
    </div>
  );
};

export default MainContent;