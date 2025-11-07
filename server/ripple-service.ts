interface RippleTransaction {
  hash: string;
  tx: {
    Account: string;
    Destination: string;
    Amount: string | {
      currency: string;
      value: string;
      issuer: string;
    };
    date: number;
    TransactionType: string;
  };
  meta: {
    TransactionResult: string;
  };
  validated: boolean;
}

interface ProcessedRippleTransaction {
  txId: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  amountXRP: string;
  from: string;
  to: string;
  timestamp: number;
  date: string;
  status: 'SUCCESS' | 'FAILED';
  explorerUrl: string;
}

export class RippleService {
  private readonly RIPPLE_API_URL = 'https://api.xrpscan.com/api/v1';
  
  private formatAmount(amount: string | number): string {
    const xrpAmount = typeof amount === 'string' ? parseFloat(amount) / 1_000_000 : amount;
    return xrpAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  }

  private rippleTimeToUnix(rippleTime: number): number {
    const RIPPLE_EPOCH = 946684800;
    return (rippleTime + RIPPLE_EPOCH) * 1000;
  }

  async getTransactions(
    walletAddress: string,
    limit: number = 50
  ): Promise<ProcessedRippleTransaction[]> {
    try {
      if (!walletAddress || walletAddress.trim() === '') {
        throw new Error('آدرس ولت معتبر نیست');
      }

      const url = `${this.RIPPLE_API_URL}/account/${walletAddress}/transactions?limit=${Math.min(limit, 100)}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`خطا در دریافت تراکنش‌ها: ${response.status}`);
      }

      const data = await response.json();

      if (!data.transactions || !Array.isArray(data.transactions)) {
        return [];
      }

      const transactions: ProcessedRippleTransaction[] = data.transactions
        .filter((tx: any) => {
          return tx.tx?.TransactionType === 'Payment' && 
                 typeof tx.tx?.Amount === 'string';
        })
        .map((tx: any) => {
          const fromAddress = tx.tx.Account;
          const toAddress = tx.tx.Destination;
          const amount = typeof tx.tx.Amount === 'string' ? parseInt(tx.tx.Amount) : 0;
          
          const isIncoming = toAddress.toLowerCase() === walletAddress.toLowerCase();
          const isSuccess = tx.meta?.TransactionResult === 'tesSUCCESS';
          const timestamp = this.rippleTimeToUnix(tx.tx.date);

          return {
            txId: tx.hash,
            type: isIncoming ? 'incoming' : 'outgoing',
            amount: amount,
            amountXRP: this.formatAmount(amount),
            from: fromAddress,
            to: toAddress,
            timestamp: timestamp,
            date: new Date(timestamp).toLocaleString('fa-IR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
            status: isSuccess ? 'SUCCESS' : 'FAILED',
            explorerUrl: `https://xrpscan.com/tx/${tx.hash}`
          };
        });

      return transactions;

    } catch (error) {
      console.error('خطا در دریافت تراکنش‌های Ripple:', error);
      throw error;
    }
  }

  validateRippleAddress(address: string): boolean {
    if (!address) return false;
    
    const rippleRegex = /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;
    return rippleRegex.test(address.trim());
  }
}

export const rippleService = new RippleService();
