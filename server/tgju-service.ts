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
  private allPricesCache: { prices: CryptoPrices; lastUpdate: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getTronPriceInToman(): Promise<number> {
    // Check cache
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
      
      // Extract table section only
      const tableMatch = html.match(/<tbody[\s\S]*?<\/tbody>/i);
      if (!tableMatch) {
        console.warn('⚠️ جدول در صفحه یافت نشد');
        return 300000;
      }
      
      const tableHtml = tableMatch[0];
      const rows = tableHtml.split(/<tr[\s\S]*?>/i);
      
      for (const row of rows) {
        if (row.includes('ترون') || row.includes('TRON') || row.includes('TRX')) {
          // Extract all table cells
          const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs);
          if (cells && cells.length >= 5) {
            // Column index 4 (5th column) contains price in Rial
            // Format: <td>3,091,000</td> (in Rial)
            for (let i = 3; i < Math.min(6, cells.length); i++) {
              const cellContent = cells[i].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
              const priceMatch = cellContent.match(/^([0-9,]+)$/);
              
              if (priceMatch) {
                const priceStr = priceMatch[1].replace(/,/g, '');
                const priceInRial = parseInt(priceStr, 10);
                
                // TRON price should be between 100,000 and 2,000,000 Rial (10,000 to 200,000 Toman)
                if (priceInRial >= 100000 && priceInRial <= 2000000) {
                  // Convert from Rial to Toman (divide by 10)
                  const priceInToman = Math.round(priceInRial / 10);
                  
                  console.log(`✅ قیمت ترون دریافت شد: ${priceInRial.toLocaleString('fa-IR')} ریال (${priceInToman.toLocaleString('fa-IR')} تومان)`);
                  
                  // Cache the price in Toman
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
      return 300000; // Default fallback price
    } catch (error) {
      console.error('❌ خطا در دریافت قیمت ترون از tgju:', error);
      // Return cached price if available, otherwise default
      if (this.trxPriceCache) {
        console.log('💾 استفاده از قیمت کش شده:', this.trxPriceCache.price.toLocaleString('fa-IR'), 'تومان');
        return this.trxPriceCache.price;
      }
      return 300000; // Default fallback price (300,000 Toman)
    }
  }

  async getAllCryptoPrices(): Promise<CryptoPrices> {
    // Check cache
    if (this.allPricesCache && Date.now() - this.allPricesCache.lastUpdate < this.CACHE_DURATION) {
      return this.allPricesCache.prices;
    }

    const defaultPrices: CryptoPrices = {
      TRX: 300000,
      USDT: 800000000,
      XRP: 50000000,
      ADA: 15000000,
    };

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
        return defaultPrices;
      }
      
      const tableHtml = tableMatch[0];
      const rows = tableHtml.split(/<tr[\s\S]*?>/i);
      
      const prices: CryptoPrices = { ...defaultPrices };
      
      for (const row of rows) {
        const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs);
        if (!cells || cells.length < 5) continue;

        for (let i = 3; i < Math.min(6, cells.length); i++) {
          const cellContent = cells[i].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
          const priceMatch = cellContent.match(/^([0-9,]+)$/);
          
          if (priceMatch) {
            const priceStr = priceMatch[1].replace(/,/g, '');
            const priceInRial = parseInt(priceStr, 10);
            
            if (priceInRial > 0) {
              const priceInToman = Math.round(priceInRial / 10);
              
              if (row.includes('ترون') || row.includes('TRON') || row.includes('TRX')) {
                if (priceInRial >= 100000 && priceInRial <= 2000000) {
                  prices.TRX = priceInToman;
                  console.log(`✅ قیمت TRX: ${priceInToman.toLocaleString('fa-IR')} تومان`);
                  break;
                }
              } else if (row.includes('تتر') || row.includes('USDT') || row.includes('Tether')) {
                if (priceInRial >= 500000000 && priceInRial <= 1000000000) {
                  prices.USDT = priceInToman;
                  console.log(`✅ قیمت USDT: ${priceInToman.toLocaleString('fa-IR')} تومان`);
                  break;
                }
              } else if (row.includes('ریپل') || row.includes('XRP') || row.includes('Ripple')) {
                if (priceInRial >= 10000000 && priceInRial <= 100000000) {
                  prices.XRP = priceInToman;
                  console.log(`✅ قیمت XRP: ${priceInToman.toLocaleString('fa-IR')} تومان`);
                  break;
                }
              } else if (row.includes('کاردانو') || row.includes('ADA') || row.includes('Cardano')) {
                if (priceInRial >= 5000000 && priceInRial <= 50000000) {
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
    this.allPricesCache = null;
  }
}

export const tgjuService = new TGJUService();
