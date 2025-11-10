interface TGJUPrice {
  price: number;
  lastUpdate: number;
}

interface CryptoPrices {
  TRX: number;
  USDT: number;
  XRP: number;
  ADA: number;
}

export class TGJUService {
  private trxPriceCache: TGJUPrice | null = null;
  private usdtPriceCache: TGJUPrice | null = null;
  private allPricesCache: { prices: CryptoPrices; lastUpdate: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getTetherPriceInToman(): Promise<number> {
    if (this.usdtPriceCache && Date.now() - this.usdtPriceCache.lastUpdate < this.CACHE_DURATION) {
      return this.usdtPriceCache.price;
    }

    try {
      const response = await fetch('https://www.tgju.org/profile/crypto-tether', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`خطا در دریافت قیمت تتر: ${response.status}`);
      }

      const html = await response.text();
      
      const priceMatch = html.match(/قیمت ریالی[\s\S]*?<td[^>]*>\s*([0-9,]+)\s*<\/td>/i);
      
      if (priceMatch && priceMatch[1]) {
        const priceStr = priceMatch[1].replace(/,/g, '');
        const priceInRial = parseInt(priceStr, 10);
        
        if (priceInRial >= 800000 && priceInRial <= 2000000) {
          const priceInToman = Math.floor(priceInRial / 10);
          console.log(`✅ قیمت تتر دریافت شد: ${priceInToman.toLocaleString('fa-IR')} تومان (از ${priceInRial.toLocaleString('fa-IR')} ریال)`);
          
          this.usdtPriceCache = {
            price: priceInToman,
            lastUpdate: Date.now(),
          };
          
          return priceInToman;
        }
      }
      
      console.warn('⚠️ قیمت تتر در صفحه یافت نشد، از قیمت پیش‌فرض استفاده می‌شود');
      return 108000;
    } catch (error) {
      console.error('❌ خطا در دریافت قیمت تتر از tgju:', error);
      if (this.usdtPriceCache) {
        console.log('💾 استفاده از قیمت کش شده:', this.usdtPriceCache.price.toLocaleString('fa-IR'), 'تومان');
        return this.usdtPriceCache.price;
      }
      return 108000;
    }
  }

  async getTronPriceInToman(): Promise<number> {
    if (this.trxPriceCache && Date.now() - this.trxPriceCache.lastUpdate < this.CACHE_DURATION) {
      return this.trxPriceCache.price;
    }

    try {
      const response = await fetch('https://www.tgju.org/crypto', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`خطا در دریافت قیمت: ${response.status}`);
      }

      const html = await response.text();
      
      const tableMatch = html.match(/<tbody[\s\S]*?<\/tbody>/i);
      if (!tableMatch) {
        console.warn('⚠️ جدول در صفحه یافت نشد');
        return 390000;
      }
      
      const tableHtml = tableMatch[0];
      const rows = tableHtml.split(/<tr[\s\S]*?>/i);
      
      for (const row of rows) {
        if (row.includes('ترون') || row.includes('TRON') || row.includes('TRX')) {
          const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs);
          if (cells && cells.length >= 5) {
            for (let i = 3; i < Math.min(6, cells.length); i++) {
              const cellContent = cells[i].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
              const priceMatch = cellContent.match(/^([0-9,]+)$/);
              
              if (priceMatch) {
                const priceStr = priceMatch[1].replace(/,/g, '');
                const priceInToman = parseInt(priceStr, 10);
                
                if (priceInToman >= 100000 && priceInToman <= 1000000) {
                  console.log(`✅ قیمت ترون دریافت شد: ${priceInToman.toLocaleString('fa-IR')} تومان`);
                  
                  this.trxPriceCache = {
                    price: priceInToman,
                    lastUpdate: Date.now(),
                  };
                  
                  return priceInToman;
                }
              }
            }
          }
        }
      }
      
      console.warn('⚠️ قیمت ترون در صفحه یافت نشد، از قیمت پیش‌فرض استفاده می‌شود');
      return 390000;
    } catch (error) {
      console.error('❌ خطا در دریافت قیمت ترون از tgju:', error);
      if (this.trxPriceCache) {
        console.log('💾 استفاده از قیمت کش شده:', this.trxPriceCache.price.toLocaleString('fa-IR'), 'تومان');
        return this.trxPriceCache.price;
      }
      return 390000;
    }
  }

  async getAllCryptoPrices(): Promise<CryptoPrices> {
    if (this.allPricesCache && Date.now() - this.allPricesCache.lastUpdate < this.CACHE_DURATION) {
      return this.allPricesCache.prices;
    }

    const defaultPrices: CryptoPrices = {
      TRX: 390000,
      USDT: 108000,
      XRP: 2750000,
      ADA: 650000,
    };

    try {
      const usdtPrice = await this.getTetherPriceInToman();
      
      const response = await fetch('https://www.tgju.org/crypto', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`خطا در دریافت قیمت: ${response.status}`);
      }

      const html = await response.text();
      const tableMatch = html.match(/<tbody[\s\S]*?<\/tbody>/i);
      
      if (!tableMatch) {
        console.warn('⚠️ جدول در صفحه یافت نشد');
        return { ...defaultPrices, USDT: usdtPrice };
      }
      
      const tableHtml = tableMatch[0];
      const rows = tableHtml.split(/<tr[\s\S]*?>/i);
      
      const prices: CryptoPrices = { ...defaultPrices, USDT: usdtPrice };
      
      for (const row of rows) {
        const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs);
        if (!cells || cells.length < 5) continue;

        for (let i = 3; i < Math.min(6, cells.length); i++) {
          const cellContent = cells[i].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
          const priceMatch = cellContent.match(/^([0-9,]+)$/);
          
          if (priceMatch) {
            const priceStr = priceMatch[1].replace(/,/g, '');
            const priceInToman = parseInt(priceStr, 10);
            
            if (priceInToman > 0) {
              if (row.includes('ترون') || row.includes('TRON') || row.includes('TRX')) {
                if (priceInToman >= 100000 && priceInToman <= 1000000) {
                  prices.TRX = priceInToman;
                  console.log(`✅ قیمت TRX: ${priceInToman.toLocaleString('fa-IR')} تومان`);
                  break;
                }
              } else if (row.includes('ریپل') || row.includes('XRP') || row.includes('Ripple')) {
                if (priceInToman >= 1000000 && priceInToman <= 10000000) {
                  prices.XRP = priceInToman;
                  console.log(`✅ قیمت XRP: ${priceInToman.toLocaleString('fa-IR')} تومان`);
                  break;
                }
              } else if (row.includes('کاردانو') || row.includes('ADA') || row.includes('Cardano')) {
                if (priceInToman >= 100000 && priceInToman <= 2000000) {
                  prices.ADA = priceInToman;
                  console.log(`✅ قیمت ADA: ${priceInToman.toLocaleString('fa-IR')} تومان`);
                  break;
                }
              }
            }
          }
        }
      }
      
      this.allPricesCache = {
        prices,
        lastUpdate: Date.now(),
      };
      
      return prices;
    } catch (error) {
      console.error('❌ خطا در دریافت قیمت‌ها از tgju:', error);
      if (this.allPricesCache) {
        console.log('💾 استفاده از قیمت‌های کش شده');
        return this.allPricesCache.prices;
      }
      return defaultPrices;
    }
  }

  clearCache(): void {
    this.trxPriceCache = null;
    this.usdtPriceCache = null;
    this.allPricesCache = null;
  }
}

export const tgjuService = new TGJUService();
