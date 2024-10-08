'use client'

import TokenList from '@/components/tokens/TokenList';
import CompressForm from '@/components/forms/CompressForm';
import TransactionHistory from '@/components/TransactionHistory';
import { useWallet } from '@solana/wallet-adapter-react';
import MainContent from '@/components/MainContent';

export default function Dashboard() {
  const { connected } = useWallet();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-white">Your Token Portfolio</h1>
      {connected ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <MainContent />
            <TransactionHistory />
          </div>
          <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-white">Compress USDC</h2>
              <CompressForm />
            </div>
           
          </div>
        </div>
      ) : (
        <p className="text-xl text-white">Please connect your wallet to view your portfolio and manage your tokens.</p>
      )}
    </div>
  );
}