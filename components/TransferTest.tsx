'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { loadKeypair } from '@/lib/loadkeypair';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const TransferComponent = () => {
  const { publicKey: walletPublicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [signature, setSignature] = useState<string | null>(null);
  const feePayer = loadKeypair();
  const rpcUrl = connection.rpcEndpoint;

  // 新增状态
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // 获取钱包余额
  const fetchWalletBalance = async () => {
    if (!connected || !walletPublicKey) return;
    try {
      const balance = await connection.getBalance(walletPublicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  // 验证地址是否存在
  const validateAddress = async (address: string) => {
    try {
      const pubkey = new PublicKey(address);
      const accountInfo = await connection.getAccountInfo(pubkey);
      return accountInfo !== null;
    } catch (error) {
      return false;
    }
  };

  // 处理地址输入
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value);
    setError(null);
  };

  // 处理转账金额输入
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransferAmount(e.target.value);
    setError(null);
  };

  // 验证输入
  const validateInput = async () => {
    if (!recipientAddress || !transferAmount) {
      setError('Please fill in all fields');
      return false;
    }

    const isValidAddress = await validateAddress(recipientAddress);
    if (!isValidAddress) {
      setError('Invalid recipient address');
      return false;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Invalid transfer amount');
      return false;
    }

    if (walletBalance === null || amount + 0.05 > walletBalance) {
      setError('Insufficient balance for transfer and fee');
      return false;
    }

    return true;
  };

  // 创建并发送交易的方法
  const handleSendTransaction = async () => {
    if (!connected || !walletPublicKey || !signTransaction) {
      console.log('Wallet not connected or signTransaction method not available');
      return;
    }

    const isValid = await validateInput();
    if (!isValid) return;

    try {
      const recipientPubkey = new PublicKey(recipientAddress);
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: recipientPubkey,
        lamports: parseFloat(transferAmount) * LAMPORTS_PER_SOL,
      });

      const feeTransferInstruction = SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: feePayer.publicKey,
        lamports: 0.05 * LAMPORTS_PER_SOL,
      });

      const tx = new Transaction().add(transferInstruction, feeTransferInstruction);
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.feePayer = feePayer.publicKey;

      const signedTransaction = await signTransaction(tx);
      if (!signedTransaction) throw new Error('User rejected signing.');
      signedTransaction.partialSign(feePayer);

      const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());
      setSignature(txSignature);
      console.log('Transaction sent successfully, signature:', txSignature);

      // 更新钱包余额
      fetchWalletBalance();
    } catch (error) {
      console.error('Error sending transaction:', error);
      setError('Transaction failed. Please try again.');
    }
  };

  useEffect(() => {
    if (connected && walletPublicKey) {
      fetchWalletBalance();
    }
  }, [connected, walletPublicKey]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Transfer SOL:</h1>
      {connected ? (
        walletPublicKey ? (
          <div className="space-y-4">
            <p>Connected Wallet: {walletPublicKey.toBase58()}</p>
            <p>RPC Endpoint: {rpcUrl}</p>
            <p>Wallet Balance: {walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : 'Loading...'}</p>

            <Input
              type="text"
              placeholder="Recipient Address"
              value={recipientAddress}
              onChange={handleAddressChange}
            />
            <Input
              type="number"
              placeholder="Amount to Transfer (SOL)"
              value={transferAmount}
              onChange={handleAmountChange}
            />
            <Button onClick={handleSendTransaction}>Transfer</Button>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {signature && (
              <Alert>
                <AlertTitle>Transaction Successful</AlertTitle>
                <AlertDescription>
                  Transaction Signature: {signature}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <p>Wallet not connected.</p>
        )
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
  );
};

export default TransferComponent;

// 'use client'

// import React, { useEffect, useState } from 'react';
// import { useWallet, useConnection } from '@solana/wallet-adapter-react';
// import { Connection, Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram, clusterApiUrl } from '@solana/web3.js';

// const WalletSignComponent = () => {
//   const { publicKey, connected, signTransaction, sendTransaction } = useWallet(); // 获取钱包连接信息和方法
// //   const { connection } = useConnection(); // 获取 Solana 链的连接实例
// //   const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
//   const { connection } = useConnection();
//   const [signature, setSignature] = useState(null); // 存储交易签名

//   // 创建并发送交易的方法
//   const handleSendTransaction = async () => {
//     if (!connected || !publicKey || !signTransaction) {
//       console.log('Wallet not connected or signTransaction method not available');
//       return;
//     }

//     try {
//       // 创建一个简单的转账交易（你可以替换为其他类型的交易）
//       const transaction = new Transaction().add(
//         SystemProgram.transfer({
//           fromPubkey: publicKey,
//           toPubkey: new PublicKey('X5ZXCEMgcvGGRwJ5hXnXbmWSACaigHTsPRjRynuzrq9'), // 替换为目标地址
//           lamports: 0.05 * LAMPORTS_PER_SOL, // 转账 0.01 SOL
//         })
//       );

//       // 设置最近区块的hash
//       transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
//       transaction.feePayer = publicKey; // 设置付款人

//       // 请求钱包签名
//       const signedTransaction = await signTransaction(transaction); // 使用 signTransaction 方法签名交易

//       // 发送签名后的交易到链上
//       const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());
      
//       setSignature(txSignature); // 设置交易签名
//       console.log('Transaction sent with signature:', txSignature);
//     } catch (error) {
//       console.error('Error sending transaction:', error);
//     }
//   };

//   return (
//     <div>
//       <h1>Send Transaction with Wallet Signature</h1>
//       {connected ? (
//         <div>
//           <p>Connected Wallet: {publicKey.toBase58()}</p>
//           <button onClick={handleSendTransaction}>Send Transaction</button>
//           {signature && (
//             <p>Transaction Signature: {signature}</p>
//           )}
//         </div>
//       ) : (
//         <p>Please connect your wallet.</p>
//       )}
//     </div>
//   );
// };

// export default WalletSignComponent;


