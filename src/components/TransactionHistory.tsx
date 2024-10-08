'use client'

import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ConfirmedSignatureInfo } from '@solana/web3.js';
import Link from 'next/link';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<ConfirmedSignatureInfo[]>([]);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey) return;

      try {
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 5 });
        setTransactions(signatures);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [publicKey, connection]);

  const shortenSignature = (signature: string) => {
    return `${signature.slice(0, 4)}...${signature.slice(-4)}`;
  };

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white">Recent Transactions</h2>
      <ul className="space-y-2">
        {transactions.map((tx) => (
          <li key={tx.signature} className="bg-gray-700 shadow rounded-lg p-4 text-white">
            <Link href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
              <p className="text-sm">Signature: {shortenSignature(tx.signature)}</p>
            </Link>
            <p className="text-sm text-gray-400">Slot: {tx.slot}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistory;