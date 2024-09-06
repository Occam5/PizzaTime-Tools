import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export function loadKeypair(): Keypair {
  try {
    // 从环境变量中获取密钥对的Base58字符串
    const base58String = process.env.NEXT_PUBLIC_PAYER_KEYPAIR;  // 修改此行
    
    if (!base58String) {
      throw new Error('NEXT_PUBLIC_PAYER_KEYPAIR environment variable is not set.');
    }
    
    // 解码Base58并解析为Uint8Array
    const secretKey = bs58.decode(base58String);
    
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('Error loading keypair:', error);
    throw error;
  }
}
