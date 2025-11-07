interface CardanoTransaction {
  tx_hash: string;
  block_height: number;
  block_time: number;
  inputs: Array<{
    address: string;
    amount: Array<{
      unit: string;
      quantity: string;
    }>;
  }>;
  outputs: Array<{
    address: string;
    amount: Array<{
      unit: string;
      quantity: string;
    }>;
  }>;
}

interface ProcessedCardanoTransaction {
  txId: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  amountADA: string;
  from: string;
  to: string;
  timestamp: number;
  date: string;
  status: 'SUCCESS' | 'FAILED';
  explorerUrl: string;
}

export class CardanoService {
  private readonly BLOCKFROST_API_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';
  private readonly BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || '';
  
  private formatAmount(lovelace: string): string {
    const adaAmount = parseInt(lovelace) / 1_000_000;
    return adaAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  }

  async getTransactions(
    walletAddress: string,
    limit: number = 50,
    page: number = 1
  ): Promise<ProcessedCardanoTransaction[]> {
    try {
      if (!walletAddress || walletAddress.trim() === '') {
        throw new Error('آدرس ولت معتبر نیست');
      }

      if (!this.BLOCKFROST_API_KEY) {
        console.warn('⚠️ BLOCKFROST_API_KEY تنظیم نشده است');
        throw new Error('سرویس Cardano غیرفعال است. لطفاً با مدیر تماس بگیرید تا BLOCKFROST_API_KEY را تنظیم کند.');
      }

      const count = Math.min(limit, 100);
      const url = `${this.BLOCKFROST_API_URL}/addresses/${walletAddress}/transactions?count=${count}&page=${page}&order=desc`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'project_id': this.BLOCKFROST_API_KEY
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`خطا در دریافت تراکنش‌ها: ${response.status}`);
      }

      const txHashes = await response.json();

      if (!Array.isArray(txHashes) || txHashes.length === 0) {
        return [];
      }

      const transactions: ProcessedCardanoTransaction[] = [];

      for (const txInfo of txHashes.slice(0, count)) {
        try {
          const txUrl = `${this.BLOCKFROST_API_URL}/txs/${txInfo.tx_hash}/utxos`;
          const txResponse = await fetch(txUrl, {
            headers: {
              'Accept': 'application/json',
              'project_id': this.BLOCKFROST_API_KEY
            }
          });

          if (!txResponse.ok) continue;

          const txData = await txResponse.json();

          let isIncoming = false;
          let totalAmount = 0;
          let fromAddress = '';
          let toAddress = '';

          if (txData.outputs && Array.isArray(txData.outputs)) {
            for (const output of txData.outputs) {
              if (output.address === walletAddress) {
                isIncoming = true;
                toAddress = output.address;
                const adaAmount = output.amount.find((a: any) => a.unit === 'lovelace');
                if (adaAmount) {
                  totalAmount = parseInt(adaAmount.quantity);
                }
              }
            }
          }

          if (!isIncoming && txData.inputs && Array.isArray(txData.inputs)) {
            for (const input of txData.inputs) {
              if (input.address === walletAddress) {
                fromAddress = input.address;
                const adaAmount = input.amount.find((a: any) => a.unit === 'lovelace');
                if (adaAmount) {
                  totalAmount = parseInt(adaAmount.quantity);
                }
              }
            }
          }

          if (txData.outputs && txData.outputs.length > 0) {
            if (isIncoming && txData.inputs && txData.inputs.length > 0) {
              fromAddress = txData.inputs[0].address;
            } else if (!isIncoming && txData.outputs.length > 0) {
              toAddress = txData.outputs[0].address;
            }
          }

          transactions.push({
            txId: txInfo.tx_hash,
            type: isIncoming ? 'incoming' : 'outgoing',
            amount: totalAmount,
            amountADA: this.formatAmount(totalAmount.toString()),
            from: fromAddress || 'N/A',
            to: toAddress || 'N/A',
            timestamp: txInfo.block_time * 1000,
            date: new Date(txInfo.block_time * 1000).toLocaleString('fa-IR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
            status: 'SUCCESS',
            explorerUrl: `https://cardanoscan.io/transaction/${txInfo.tx_hash}`
          });

        } catch (error) {
          console.error(`خطا در پردازش تراکنش ${txInfo.tx_hash}:`, error);
          continue;
        }
      }

      return transactions;

    } catch (error) {
      console.error('خطا در دریافت تراکنش‌های Cardano:', error);
      throw error;
    }
  }

  validateCardanoAddress(address: string): boolean {
    if (!address) return false;
    
    const cardanoRegex = /^addr1[a-z0-9]{58,}$/;
    return cardanoRegex.test(address.trim());
  }
}

export const cardanoService = new CardanoService();
