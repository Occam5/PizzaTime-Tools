'use client'

import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram, clusterApiUrl } from '@solana/web3.js';

const WalletSignComponent = () => {
  const { publicKey, connected, signTransaction, sendTransaction } = useWallet(); // 获取钱包连接信息和方法
//   const { connection } = useConnection(); // 获取 Solana 链的连接实例
//   const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const { connection } = useConnection();
  const [signature, setSignature] = useState(null); // 存储交易签名

  // 创建并发送交易的方法
  const handleSendTransaction = async () => {
    if (!connected || !publicKey || !signTransaction) {
      console.log('Wallet not connected or signTransaction method not available');
      return;
    }

    try {
      // 创建一个简单的转账交易（你可以替换为其他类型的交易）
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('X5ZXCEMgcvGGRwJ5hXnXbmWSACaigHTsPRjRynuzrq9'), // 替换为目标地址
          lamports: 0.05 * LAMPORTS_PER_SOL, // 转账 0.01 SOL
        })
      );

      // 设置最近区块的hash
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = publicKey; // 设置付款人

      // 请求钱包签名
      const signedTransaction = await signTransaction(transaction); // 使用 signTransaction 方法签名交易

      // 发送签名后的交易到链上
      const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      setSignature(txSignature); // 设置交易签名
      console.log('Transaction sent with signature:', txSignature);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  return (
    <div>
      <h1>Send Transaction with Wallet Signature</h1>
      {connected ? (
        <div>
          <p>Connected Wallet: {publicKey.toBase58()}</p>
          <button onClick={handleSendTransaction}>Send Transaction</button>
          {signature && (
            <p>Transaction Signature: {signature}</p>
          )}
        </div>
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
  );
};

export default WalletSignComponent;
