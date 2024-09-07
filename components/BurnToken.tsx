'use client';

import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import { loadKeypair } from '@/lib/loadkeypair';
import { createBurnCheckedInstruction, getMint, getAssociatedTokenAddress } from '@solana/spl-token';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const BurnTokenComponent = () => {
  const { publicKey: walletPublicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [signature, setSignature] = useState<string | null>(null);
  const feePayer = loadKeypair();
  const rpcUrl = connection.rpcEndpoint;

  // 新增状态
  const [tokenAccounts, setTokenAccounts] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [tokenSupply, setTokenSupply] = useState<number | null>(null);
  const [burnAmount, setBurnAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // 获取用户的所有代币账户
  const fetchTokenAccounts = async () => {
    if (!connected || !walletPublicKey) return;

    try {
      const accounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });
      setTokenAccounts(accounts.value);
    } catch (error) {
      console.error('Error fetching token accounts:', error);
    }
  };

  // 获取选定代币的余额和总供应量
  const fetchTokenInfo = async (mintAddress: string) => {
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const tokenAccountAddress = await getAssociatedTokenAddress(mintPublicKey, walletPublicKey!);
      const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccountAddress);
      setTokenBalance(Number(tokenAccountInfo.value.uiAmount));

      const mintInfo = await getMint(connection, mintPublicKey);
      setTokenSupply(Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals));
    } catch (error) {
      console.error('Error fetching token info:', error);
    }
  };

  // 处理代币选择
  const handleTokenSelect = (value: string) => {
    setSelectedToken(value);
    fetchTokenInfo(value);
  };

  // 处理 burn 数量输入
  const handleBurnAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBurnAmount(e.target.value);
  };

  // 验证输入的 burn 数量
  const validateBurnAmount = () => {
    if (!selectedToken || !tokenBalance) return false;
    const amount = Number(burnAmount);
    if (isNaN(amount) || amount <= 0 || amount > tokenBalance) {
      setError('Invalid burn amount');
      return false;
    }
    setError(null);
    return true;
  };

  // 创建并发送交易的方法
  const handleSendTransaction = async () => {
    if (!connected || !walletPublicKey || !signTransaction || !selectedToken) {
      console.log('Wallet not connected or signTransaction method not available');
      return;
    }

    if (!validateBurnAmount()) return;

    try {
      // 检查 SOL 余额
      const balance = await connection.getBalance(walletPublicKey);
      if (balance < 0.05 * LAMPORTS_PER_SOL) {
        setError('Insufficient SOL balance. Please keep at least 0.05 SOL in your wallet.');
        return;
      }

      const mintPublicKey = new PublicKey(selectedToken);
      const tokenAccountAddress = await getAssociatedTokenAddress(mintPublicKey, walletPublicKey);

      const mintInfo = await getMint(connection, mintPublicKey);
      const decimals = mintInfo.decimals;

      const burnIx = createBurnCheckedInstruction(
        tokenAccountAddress,
        mintPublicKey,
        walletPublicKey,
        Number(burnAmount) * Math.pow(10, decimals),
        decimals
      );

      const feeTransferInstruction = SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: feePayer.publicKey,
        lamports: 0.05 * LAMPORTS_PER_SOL,
      });

      const tx = new Transaction().add(burnIx, feeTransferInstruction);
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.feePayer = feePayer.publicKey;

      const signedTransaction = await signTransaction(tx);
      if (!signedTransaction) throw new Error('User rejected signing.');
      signedTransaction.partialSign(feePayer);

      const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());
      setSignature(txSignature);
      console.log('Transaction sent successfully, signature:', txSignature);

      // 更新代币余额
      fetchTokenInfo(selectedToken);
    } catch (error) {
      console.error('Error sending transaction:', error);
      setError('Transaction failed. Please try again.');
    }
  };

  useEffect(() => {
    if (connected && walletPublicKey) {
      fetchTokenAccounts();
    }
  }, [connected, walletPublicKey]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Burn Token:</h1>
      {connected ? (
        walletPublicKey ? (
          <div className="space-y-4">
            <p>Connected Wallet: {walletPublicKey.toBase58()}</p>
            <p>RPC Endpoint: {rpcUrl}</p>

            <Select onValueChange={handleTokenSelect}>
              <SelectTrigger className="w-[430px] bg-pizzapurple">
                <SelectValue placeholder="Select a token to burn" />
              </SelectTrigger>
              <SelectContent>
                {tokenAccounts.map((account) => (
                  <SelectItem key={account.account.data.parsed.info.mint} value={account.account.data.parsed.info.mint}>
                    {account.account.data.parsed.info.mint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedToken && (
              <div className="space-y-2">
                <p>Token Balance: {tokenBalance}</p>
                <p>Total Supply: {tokenSupply}</p>
                <a href={`https://solscan.io/token/${selectedToken}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  View Token Details
                </a>
                <Input
                  type="number"
                  placeholder="Enter amount to burn"
                  value={burnAmount}
                  onChange={handleBurnAmountChange}
                />
                <Button onClick={handleSendTransaction} className="bg-pizzapurple text-theme" >Burn</Button>
              </div>
            )}

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
//   const rpcUrl = connection.rpcEndpoint; // 获取连接的RPC节点URL

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
//         1, // Burn 1 个 token
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
//       <h1>Burn Token:</h1>
//       {connected ? (
//         walletPublicKey ? ( // 判断 walletPublicKey 是否存在
//           <div>
//             <p>Connected Wallet: {walletPublicKey.toBase58()}</p>
//             <p>RPC Endpoint: {rpcUrl}</p> {/* 显示连接的RPC节点URL */}
//             <button onClick={handleSendTransaction}>Burn</button>
//             {signature && (
//               <p>Transaction Signature: {signature}</p>
//             )}
//           </div>
//         ) : (
//           <p>Wallet not connected.</p> // 如果 walletPublicKey 为 null 则显示
//         )
//       ) : (
//         <p>Please connect your wallet.</p>
//       )}
//     </div>
//   );
// };

// export default BurnTokenComponent;

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
