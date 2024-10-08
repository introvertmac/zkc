'use client'

import React from 'react';

interface TokenCardProps {
  name: string;
  symbol: string;
  balance: number;
  compressedBalance: number;
  nativeBalance: number;
}

const TokenCard: React.FC<TokenCardProps> = ({ name, symbol, balance, compressedBalance, nativeBalance }) => {
  const isCompressed = compressedBalance > 0;
  
  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold text-white">{symbol}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded ${isCompressed ? '' : 'bg-blue-500 text-blue-900'}`}>
          {isCompressed ? '' : 'Native'}
        </span>
      </div>
      <p className="text-3xl font-bold text-white mb-2">{balance.toLocaleString()}</p>
      {symbol === 'USDC'  && (
        <div className="text-sm text-gray-400">
          <p>Compressed: {compressedBalance.toLocaleString()}</p>
          <p>Native: {nativeBalance.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default TokenCard;