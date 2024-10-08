'use client'

import Link from 'next/link';
import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      router.push('/dashboard');
    }
  }, [connected, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-900 text-white px-4 sm:px-6 lg:px-8">
      <main className="flex flex-col items-center justify-center w-full max-w-4xl text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Welcome to{' '}
          <span className="text-purple-600">
            Compressed Token Manager
          </span>
        </h1>

        <p className="mt-3 text-xl sm:text-2xl mb-8 max-w-2xl">
          Manage your Solana tokens with advanced ZK compression technology
        </p>

        <div className="w-full max-w-md">
          <Link
            href="https://lightprotocol.com/"
            className="block w-full p-6 mt-6 text-left border border-purple-300 rounded-xl hover:text-purple-600 focus:text-purple-600 transition duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3 className="text-2xl font-bold">Learn &rarr;</h3>
            <p className="mt-4 text-lg">
              Discover more about ZK compression technology
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}