'use client';

import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import { loadKeypair } from '@/lib/loadkeypair';
import { createBurnCheckedInstruction, getMint } from '@solana/spl-token';

const BurnTokenComponent = () => {
  const { publicKey: walletPublicKey, connected, signTransaction } = useWallet(); // 获取钱包连接信息和方法
  const { connection } = useConnection();
  const [signature, setSignature] = useState<string | null>(null); // 存储交易签名
  const feePayer = loadKeypair();  // 确保加载密钥对
  const rpcUrl = connection.rpcEndpoint; // 获取连接的RPC节点URL

  // 创建并发送交易的方法
  const handleSendTransaction = async () => {
    if (!connected || !walletPublicKey || !signTransaction) {
      console.log('Wallet not connected or signTransaction method not available');
      return;
    }

    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      const tokenAccountPubkey = new PublicKey(tokenAccounts.value[0].pubkey); // 转换为 PublicKey 类型
      const mintAccountAddress = new PublicKey(tokenAccounts.value[0].account.data.parsed.info.mint); // 转换为 PublicKey 类型

      console.log("tokenAccount: ", tokenAccountPubkey.toBase58());

      // 获取 mint 账户信息以获取其小数位数
      const mintAccountInfo = await getMint(connection, mintAccountAddress);
      const decimals = mintAccountInfo.decimals; // 获取 mint 账户的 decimals

      const burnIx = createBurnCheckedInstruction(
        tokenAccountPubkey,
        mintAccountAddress,
        walletPublicKey,
        1, // Burn 1 个 token
        decimals // 使用正确的代币小数位数
      );

      const feeTransferInstruction = SystemProgram.transfer({
        fromPubkey: walletPublicKey, // 用户钱包地址
        toPubkey: feePayer.publicKey, // 本地钱包地址
        lamports: 0.05 * LAMPORTS_PER_SOL, // 手续费金额
      });

      const tx = new Transaction().add(burnIx, feeTransferInstruction);
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.feePayer = feePayer.publicKey;

      const signedTransaction = await signTransaction(tx);
      if (!signedTransaction) throw new Error('用户拒绝签名。');
      signedTransaction.partialSign(feePayer);

      const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());
      setSignature(txSignature); // 将事务签名结果保存到状态
      console.log('交易发送成功，签名：', txSignature.toString());
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  return (
    <div>
      <h1>Burn Token:</h1>
      {connected ? (
        walletPublicKey ? ( // 判断 walletPublicKey 是否存在
          <div>
            <p>Connected Wallet: {walletPublicKey.toBase58()}</p>
            <p>RPC Endpoint: {rpcUrl}</p> {/* 显示连接的RPC节点URL */}
            <button onClick={handleSendTransaction}>Burn</button>
            {signature && (
              <p>Transaction Signature: {signature}</p>
            )}
          </div>
        ) : (
          <p>Wallet not connected.</p> // 如果 walletPublicKey 为 null 则显示
        )
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
  );
};

export default BurnTokenComponent;

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useWallet, useConnection } from '@solana/wallet-adapter-react';
// import { Connection, Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram, clusterApiUrl } from '@solana/web3.js';
// import { loadKeypair } from '@/lib/loadkeypair';
// import { createBurnCheckedInstruction, getMint } from '@solana/spl-token';

// const BurnTokenComponent = () => {
//   const { publicKey: walletPublicKey, connected, signTransaction } = useWallet(); // 获取钱包连接信息和方法
//   const { connection } = useConnection();
//   const [signature, setSignature] = useState<string | null>(null); // 存储交易签名
//   const feePayer = loadKeypair();  // 确保加载密钥对

//   // 创建并发送交易的方法
//   const handleSendTransaction = async () => {
//     if (!connected || !walletPublicKey || !signTransaction) {
//       console.log('Wallet not connected or signTransaction method not available');
//       return;
//     }

//     try {
//       const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
//         programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
//       });

//       const tokenAccountPubkey = new PublicKey(tokenAccounts.value[0].pubkey); // 转换为 PublicKey 类型
//       const mintAccountAddress = new PublicKey(tokenAccounts.value[0].account.data.parsed.info.mint); // 转换为 PublicKey 类型

//       console.log("tokenAccount: ", tokenAccountPubkey.toBase58());

//       // 获取 mint 账户信息以获取其小数位数
//       const mintAccountInfo = await getMint(connection, mintAccountAddress);
//       const decimals = mintAccountInfo.decimals; // 获取 mint 账户的 decimals

//       const burnIx = createBurnCheckedInstruction(
//         tokenAccountPubkey,
//         mintAccountAddress,
//         walletPublicKey,
//         1*10**decimals, // Burn 1 个 token
//         // 1,
//         decimals // 使用正确的代币小数位数
//       );

//       const feeTransferInstruction = SystemProgram.transfer({
//         fromPubkey: walletPublicKey, // 用户钱包地址
//         toPubkey: feePayer.publicKey, // 本地钱包地址
//         lamports: 0.05 * LAMPORTS_PER_SOL, // 手续费金额
//       });

//       const tx = new Transaction().add(burnIx, feeTransferInstruction);
//       tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
//       tx.feePayer = feePayer.publicKey;

//       const signedTransaction = await signTransaction(tx);
//       if (!signedTransaction) throw new Error('用户拒绝签名。');
//       signedTransaction.partialSign(feePayer);

//       const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());
//       setSignature(txSignature); // 将事务签名结果保存到状态
//       console.log('交易发送成功，签名：', txSignature.toString());
//     } catch (error) {
//       console.error('Error sending transaction:', error);
//     }
//   };

//   return (
//     <div>
//       <h1>Send Transaction with Wallet Signature</h1>
//       {connected ? (
//         <div>
//           <p>Connected Wallet: {walletPublicKey.toBase58()}</p>
          
//           <button onClick={handleSendTransaction}>burn token</button>

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

// export default BurnTokenComponent;
