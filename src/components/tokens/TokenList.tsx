'use client'

import React from 'react';
import TokenCard from './TokenCard';

interface Token {
  name: string;
  symbol: string;
  balance: number;
  compressedBalance: number;
  nativeBalance: number;
}

interface TokenListProps {
  tokens: Token[];
}

const TokenList: React.FC<TokenListProps> = ({ tokens }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tokens.map((token, index) => (
        <TokenCard
          key={index}
          name={token.name}
          symbol={token.symbol}
          balance={token.balance}
          compressedBalance={token.compressedBalance}
          nativeBalance={token.nativeBalance}
        />
      ))}
    </div>
  );
};

export default TokenList;