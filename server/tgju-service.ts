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
  private xrpPriceCache: TGJUPrice | null = null;
  private adaPriceCache: TGJUPrice | null = null;
  private allPricesCache: { prices: CryptoPrices; lastUpdate: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private async fetchProfilePriceInRial(
    profilePath: string,
    cryptoName: string,
    minPrice: number,
    maxPrice: number,
    defaultPrice: number
  ): Promise<number> {
    try {
      const response = await fetch(`https://www.tgju.org${profilePath}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`خطا در دریافت قیمت ${cryptoName}: ${response.status}`);
      }

      const html = await response.text();
      
      const priceMatch = html.match(/قیمت\s*ریالی[\s\S]*?<td[^>]*>\s*([\d,]+)\s*<\/td>/i);
      
      if (priceMatch && priceMatch[1]) {
        const priceStr = priceMatch[1].replace(/,/g, '');
        const priceInRial = parseInt(priceStr, 10);
        
        if (priceInRial >= minPrice && priceInRial <= maxPrice) {
          console.log(`✅ قیمت ${cryptoName} دریافت شد: ${priceInRial.toLocaleString('fa-IR')} ریال`);
          return priceInRial;
        }
      }
      
      console.warn(`⚠️ قیمت ${cryptoName} در صفحه یافت نشد، از قیمت پیش‌فرض استفاده می‌شود`);
      return defaultPrice;
    } catch (error) {
      console.error(`❌ خطا در دریافت قیمت ${cryptoName} از tgju:`, error);
      throw error;
    }
  }

  async getTetherPriceInRial(): Promise<number> {
    if (this.usdtPriceCache && Date.now() - this.usdtPriceCache.lastUpdate < this.CACHE_DURATION) {
      return this.usdtPriceCache.price;
    }

    try {
      const price = await this.fetchProfilePriceInRial(
        '/profile/crypto-tether',
        'تتر',
        800000,
        2000000,
        1080000
      );
      
      this.usdtPriceCache = {
        price,
        lastUpdate: Date.now(),
      };
      
      return price;
    } catch (error) {
      if (this.usdtPriceCache) {
        console.log('💾 استفاده از قیمت کش شده تتر:', this.usdtPriceCache.price.toLocaleString('fa-IR'), 'ریال');
        return this.usdtPriceCache.price;
      }
      return 1080000;
    }
  }

  async getTronPriceInRial(): Promise<number> {
    if (this.trxPriceCache && Date.now() - this.trxPriceCache.lastUpdate < this.CACHE_DURATION) {
      return this.trxPriceCache.price;
    }

    try {
      const price = await this.fetchProfilePriceInRial(
        '/profile/crypto-tron',
        'ترون',
        100000,
        1000000,
        390000
      );
      
      this.trxPriceCache = {
        price,
        lastUpdate: Date.now(),
      };
      
      return price;
    } catch (error) {
      if (this.trxPriceCache) {
        console.log('💾 استفاده از قیمت کش شده ترون:', this.trxPriceCache.price.toLocaleString('fa-IR'), 'ریال');
        return this.trxPriceCache.price;
      }
      return 390000;
    }
  }

  async getRipplePriceInRial(): Promise<number> {
    if (this.xrpPriceCache && Date.now() - this.xrpPriceCache.lastUpdate < this.CACHE_DURATION) {
      return this.xrpPriceCache.price;
    }

    try {
      const price = await this.fetchProfilePriceInRial(
        '/profile/crypto-ripple',
        'ریپل',
        1000000,
        10000000,
        2750000
      );
      
      this.xrpPriceCache = {
        price,
        lastUpdate: Date.now(),
      };
      
      return price;
    } catch (error) {
      if (this.xrpPriceCache) {
        console.log('💾 استفاده از قیمت کش شده ریپل:', this.xrpPriceCache.price.toLocaleString('fa-IR'), 'ریال');
        return this.xrpPriceCache.price;
      }
      return 2750000;
    }
  }

  async getCardanoPriceInRial(): Promise<number> {
    if (this.adaPriceCache && Date.now() - this.adaPriceCache.lastUpdate < this.CACHE_DURATION) {
      return this.adaPriceCache.price;
    }

    try {
      const price = await this.fetchProfilePriceInRial(
        '/profile/crypto-cardano',
        'کاردانو',
        100000,
        2000000,
        650000
      );
      
      this.adaPriceCache = {
        price,
        lastUpdate: Date.now(),
      };
      
      return price;
    } catch (error) {
      if (this.adaPriceCache) {
        console.log('💾 استفاده از قیمت کش شده کاردانو:', this.adaPriceCache.price.toLocaleString('fa-IR'), 'ریال');
        return this.adaPriceCache.price;
      }
      return 650000;
    }
  }

  async getTetherPriceInToman(): Promise<number> {
    const priceInRial = await this.getTetherPriceInRial();
    return Math.floor(priceInRial / 10);
  }

  async getTronPriceInToman(): Promise<number> {
    const priceInRial = await this.getTronPriceInRial();
    return Math.floor(priceInRial / 10);
  }

  async getAllCryptoPrices(): Promise<CryptoPrices> {
    if (this.allPricesCache && Date.now() - this.allPricesCache.lastUpdate < this.CACHE_DURATION) {
      return this.allPricesCache.prices;
    }

    try {
      const [usdtPrice, trxPrice, xrpPrice, adaPrice] = await Promise.all([
        this.getTetherPriceInRial(),
        this.getTronPriceInRial(),
        this.getRipplePriceInRial(),
        this.getCardanoPriceInRial(),
      ]);

      const prices: CryptoPrices = {
        USDT: usdtPrice,
        TRX: trxPrice,
        XRP: xrpPrice,
        ADA: adaPrice,
      };
      
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
      return {
        USDT: 1080000,
        TRX: 390000,
        XRP: 2750000,
        ADA: 650000,
      };
    }
  }

  clearCache(): void {
    this.trxPriceCache = null;
    this.usdtPriceCache = null;
    this.xrpPriceCache = null;
    this.adaPriceCache = null;
    this.allPricesCache = null;
  }
}

export const tgjuService = new TGJUService();
