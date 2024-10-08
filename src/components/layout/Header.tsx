'use client'

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
  () => import('../WalletMultiButton'),
  { ssr: false }
);

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <nav>
          <Link href="/" className="text-xl font-bold text-purple-400 hover:text-purple-300">
            Compressed Token Manager
          </Link>
        </nav>
        <WalletMultiButtonDynamic />
      </div>
    </header>
  );
};

export default Header;