interface TGJUPrice {
  price: number;
  lastUpdate: number;
}

export class TGJUService {
  private trxPriceCache: TGJUPrice | null = null;
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
            // Format: <td>309,100</td>
            for (let i = 3; i < Math.min(6, cells.length); i++) {
              const cellContent = cells[i].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
              const priceMatch = cellContent.match(/^([0-9,]+)$/);
              
              if (priceMatch) {
                const priceStr = priceMatch[1].replace(/,/g, '');
                const price = parseInt(priceStr, 10);
                
                // TRON price should be between 100,000 and 1,000,000 Toman
                if (price >= 100000 && price <= 1000000) {
                  console.log(`✅ قیمت ترون دریافت شد: ${price.toLocaleString('fa-IR')} تومان`);
                  
                  // Cache the price
                  this.trxPriceCache = {
                    price,
                    lastUpdate: Date.now(),
                  };
                  
                  return price;
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

  clearCache(): void {
    this.trxPriceCache = null;
  }
}

export const tgjuService = new TGJUService();
