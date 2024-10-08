'use client'

import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { buildCompressSplTokenTx, buildCompressSolTx, getTokenBalance as getTokenBalanceService, SOLANA_DEVNET_USDC_PUBKEY } from '@/services/compressionService';
import Toast from '../ui/Toast';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

type TokenType = 'SOL' | 'USDC' | 'CUSTOM';

const CompressForm: React.FC = () => {
  const [tokenType, setTokenType] = useState<TokenType>('SOL');
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  useEffect(() => {
    fetchBalance();
  }, [publicKey, tokenType, customTokenAddress, connection]);

  const fetchBalance = async () => {
    if (!publicKey) return;

    try {
      let fetchedBalance: number;
      switch (tokenType) {
        case 'SOL':
          fetchedBalance = await connection.getBalance(publicKey) / LAMPORTS_PER_SOL;
          break;
        case 'USDC':
          fetchedBalance = await getTokenBalanceService(publicKey, SOLANA_DEVNET_USDC_PUBKEY);
          break;
        case 'CUSTOM':
          if (!isValidPublicKey(customTokenAddress)) {
            setBalance(null);
            return;
          }
          fetchedBalance = await getTokenBalanceService(publicKey, customTokenAddress);
          break;
      }
      setBalance(fetchedBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
    }
  };

  const isValidPublicKey = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const handleCompress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      setToast({ message: 'Please connect your wallet', type: 'error' });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setToast({ message: 'Invalid amount', type: 'error' });
      return;
    }

    if (balance !== null && parsedAmount > balance) {
      setToast({ message: 'Insufficient balance', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      let transaction;
      console.log("Token type:", tokenType);
      console.log("Amount to compress:", parsedAmount);
      console.log("Public Key:", publicKey.toBase58());

      switch (tokenType) {
        case 'SOL':
          console.log("Compressing SOL");
          transaction = await buildCompressSolTx(publicKey.toBase58(), parsedAmount);
          break;
        case 'USDC':
          console.log("Compressing USDC");
          console.log("USDC mint address:", SOLANA_DEVNET_USDC_PUBKEY);
          transaction = await buildCompressSplTokenTx(publicKey.toBase58(), parsedAmount, SOLANA_DEVNET_USDC_PUBKEY);
          break;
        case 'CUSTOM':
          if (!isValidPublicKey(customTokenAddress)) {
            throw new Error('Invalid custom token address');
          }
          console.log("Compressing custom token:", customTokenAddress);
          console.log("Amount to compress:", parsedAmount);
          console.log("Public Key:", publicKey.toBase58());
          transaction = await buildCompressSplTokenTx(publicKey.toBase58(), parsedAmount, customTokenAddress);
          break;
      }

      console.log("Transaction before sending:", transaction);
      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent. Signature:", signature);
      await connection.confirmTransaction(signature, 'confirmed');
      console.log("Transaction confirmed");
      setToast({ message: `Compressed ${amount} ${tokenType} successfully!`, type: 'success' });
      setAmount('');
      fetchBalance();
    } catch (error) {
      console.error('Error compressing tokens:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to compress tokens. See console for details.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleCompress} className="space-y-4">
        <div>
          <label htmlFor="tokenType" className="block text-sm font-medium text-gray-300">
            Token Type
          </label>
          <select
            id="tokenType"
            value={tokenType}
            onChange={(e) => setTokenType(e.target.value as TokenType)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="SOL">SOL</option>
            <option value="USDC">USDC</option>
            <option value="CUSTOM">Custom Token</option>
          </select>
        </div>
        
        {tokenType === 'CUSTOM' && (
          <div>
            <label htmlFor="customTokenAddress" className="block text-sm font-medium text-gray-300">
              Custom Token Address
            </label>
            <input
              type="text"
              id="customTokenAddress"
              value={customTokenAddress}
              onChange={(e) => setCustomTokenAddress(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter token mint address"
            />
          </div>
        )}
        
        <div>
          <label htmlFor="balance" className="block text-sm font-medium text-gray-300">
            Balance
          </label>
          <input
            type="text"
            id="balance"
            value={balance !== null ? balance.toFixed(6) : 'N/A'}
            readOnly
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
            Amount to Compress
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter amount"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading || !publicKey || (tokenType === 'CUSTOM' && !isValidPublicKey(customTokenAddress))}
        >
          {loading ? 'Compressing...' : 'Compress'}
        </button>
      </form>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default CompressForm;