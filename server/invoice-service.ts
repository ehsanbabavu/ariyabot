import puppeteer from 'puppeteer';
import { storage } from './storage';
import * as fs from 'fs';
import * as path from 'path';

// تابع فرمت کردن قیمت به ریال
function formatPriceRial(price: string | number): string {
  const num = typeof price === 'string' ? parseInt(price) : price;
  return new Intl.NumberFormat('fa-IR').format(num);
}

// تابع تبدیل عدد به حروف فارسی (ساده شده)
function numberToPersianWords(num: number): string {
  if (num === 0) return 'صفر';
  
  const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const hundreds = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const thousands = ['', 'هزار', 'میلیون', 'میلیارد'];
  
  if (num < 10) return ones[num];
  if (num < 20) {
    const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
    return teens[num - 10];
  }
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one ? ' و ' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return hundreds[hundred] + (rest ? ' و ' + numberToPersianWords(rest) : '');
  }
  
  // برای اعداد بزرگتر
  let result = '';
  let level = 0;
  while (num > 0) {
    const part = num % 1000;
    if (part > 0) {
      const partWords = numberToPersianWords(part);
      result = partWords + (thousands[level] ? ' ' + thousands[level] : '') + (result ? ' و ' + result : '');
    }
    num = Math.floor(num / 1000);
    level++;
  }
  
  return result || 'صفر';
}

/**
 * تولید HTML فاکتور برای یک سفارش
 * شامل ستون ارزش افزوده بین قیمت واحد و قیمت کل
 */
async function generateInvoiceHTML(orderId: string): Promise<string> {
  // دریافت جزئیات کامل سفارش
  const order = await storage.getOrder(orderId);
  if (!order) {
    throw new Error('سفارش یافت نشد');
  }

  // دریافت آیتم‌های سفارش با جزئیات محصولات
  const orderItems = await storage.getOrderItems(orderId);
  const items = await Promise.all(
    orderItems.map(async (item) => {
      const product = await storage.getProduct(item.productId, order.userId, 'user_level_2');
      return {
        ...item,
        productName: product?.name || 'محصول',
        productDescription: product?.description,
        productImage: product?.image,
      };
    })
  );

  // دریافت اطلاعات آدرس
  const address = order.addressId ? await storage.getAddress(order.addressId) : null;

  // دریافت اطلاعات خریدار
  const buyer = await storage.getUser(order.userId);

  // دریافت اطلاعات فروشنده
  const seller = await storage.getUser(order.sellerId);

  // دریافت تنظیمات VAT فروشنده
  const vatSettings = await storage.getVatSettings(order.sellerId);
  const vatPercentage = vatSettings?.isEnabled ? parseFloat(vatSettings.vatPercentage) : 0;
  
  // محاسبه subtotal از مجموع قیمت آیتم‌ها (بدون VAT)
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
  const vatAmount = Math.round(subtotal * (vatPercentage / 100));
  const totalWithVat = subtotal + vatAmount;

  const isLargeOrder = items.length > 8;
  const fontSize = isLargeOrder ? '12px' : '14px';
  const padding = isLargeOrder ? '6px' : '8px';

  // ساخت HTML فاکتور
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاکتور سفارش</title>
      <style>
        @import url('https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.css');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Vazirmatn, Arial, sans-serif;
          background-color: #ffffff;
          color: #000000;
          direction: rtl;
        }
        
        .invoice-container {
          width: ${isLargeOrder ? '595px' : '842px'};
          margin: 0 auto;
          border: 2px solid #000;
          background: white;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #000;
        }
        
        .header-title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          flex: 1;
        }
        
        .header-date {
          text-align: right;
          font-size: 16px;
        }
        
        .section-header {
          background-color: #d3d3d3;
          text-align: center;
          padding: 10px;
          font-weight: bold;
          font-size: 16px;
          border-bottom: 1px solid #000;
        }
        
        .section-content {
          padding: 15px;
          border-bottom: 1px solid #000;
          text-align: right;
          font-size: 14px;
        }
        
        .customer-details {
          line-height: 1.8;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          background-color: #d3d3d3;
          border: 1px solid #000;
          padding: 10px;
          text-align: center;
          font-weight: bold;
          font-size: 14px;
        }
        
        td {
          border: 1px solid #000;
          padding: ${padding};
          font-size: ${fontSize};
          text-align: center;
        }
        
        .text-right {
          text-align: right;
        }
        
        .total-section {
          background-color: #d3d3d3;
          text-align: left;
          padding: 12px;
          font-weight: bold;
          font-size: 16px;
          border-top: 1px solid #000;
        }
        
        .total-words {
          padding: 15px;
          text-align: right;
          font-size: 14px;
          border-bottom: 1px solid #000;
        }
        
        .thank-you {
          text-align: center;
          padding: 20px;
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="header-date">
            تاریخ: ${new Date(order.createdAt!).toLocaleDateString('fa-IR')}
          </div>
          <h1 class="header-title">فاکتور فروش</h1>
          <div style="width: 100px;"></div>
        </div>
        
        <!-- Seller Section -->
        <div class="section-header" style="text-align: right;">مشخصات فروشنده</div>
        <div class="section-content">
          ${vatSettings?.isEnabled ? 
            `نام شرکت: ${vatSettings.companyName || '-'} - شناسه ملی: ${vatSettings.nationalId || '-'} - کد اقتصادی: ${vatSettings.economicCode || '-'} - تلفن: ${vatSettings.phoneNumber || '-'} - آدرس: ${vatSettings.address || '-'}`
            :
            `نام شخص / سازمان : ${seller?.firstName && seller?.lastName ? `${seller.firstName} ${seller.lastName}` : 'فروشنده'}`
          }
        </div>
        
        <!-- Customer Section -->
        <div class="section-header" style="text-align: right;">مشخصات خریدار</div>
        <div class="section-content customer-details">
          <div>نام شخص / سازمان : ${buyer?.firstName && buyer?.lastName ? `${buyer.firstName} ${buyer.lastName}` : 'مشتری گرامی'}</div>
          <div>آدرس - کد پستی - تلفن : ${[
            address?.fullAddress || '-',
            address?.postalCode || '-',
            buyer?.whatsappNumber || '-'
          ].join(' - ')}</div>
        </div>
        
        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th style="width: 8%;">ردیف</th>
              <th style="width: 36%;">شرح کالا یا خدمات</th>
              <th style="width: 10%;">تعداد</th>
              <th style="width: 15%;">قیمت واحد<br />(ریال)</th>
              <th style="width: 15%;">ارزش افزوده<br />(ریال)</th>
              <th style="width: 16%;">قیمت کل<br />(ریال)</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => {
              const itemSubtotal = parseFloat(item.totalPrice);
              const itemVat = vatPercentage > 0 ? Math.round(itemSubtotal * (vatPercentage / 100)) : 0;
              const itemTotal = itemSubtotal + itemVat;
              return `
              <tr>
                <td>${index + 1}</td>
                <td class="text-right">${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${formatPriceRial(item.unitPrice)}</td>
                <td>${vatPercentage > 0 ? formatPriceRial(itemVat) : '-'}</td>
                <td>${formatPriceRial(itemTotal)}</td>
              </tr>
            `}).join('')}
            <tr style="background-color: #d3d3d3; font-weight: bold;">
              <td colspan="4" class="text-right" style="padding: 12px;"></td>
              <td>${vatPercentage > 0 ? formatPriceRial(vatAmount).replace(' ریال', '') : '-'}</td>
              <td>${formatPriceRial(vatPercentage > 0 ? totalWithVat : subtotal).replace(' ریال', '')}</td>
            </tr>
          </tbody>
        </table>
        
        <!-- Total in Words -->
        <div class="total-words">
          ${vatPercentage > 0 ? 'مبلغ قابل پرداخت' : 'جمع کل'} به حروف: ${numberToPersianWords((vatPercentage > 0 ? totalWithVat : subtotal) * 10)} ریال
        </div>
        
        ${vatPercentage > 0 ? `
        <!-- Company Stamp/Signature -->
        <div style="position: relative; padding: 20px 0;">
          <div style="position: absolute; bottom: 0; left: 20px; width: 150px; height: 100px; border: 2px solid #666; display: flex; align-items: center; justify-content: center; text-align: center; padding: 10px;">
            <div style="font-size: 12px; color: #666;">
              مهر و امضا شرکت
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- Thank You Message -->
        <div class="thank-you">
          از خرید شما متشکریم منتظر شما هستیم
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * تولید عکس فاکتور با استفاده از Puppeteer
 */
export async function generateInvoiceImage(orderId: string): Promise<Buffer> {
  let browser;
  try {
    console.log(`📄 شروع تولید فاکتور برای سفارش ${orderId}...`);
    
    // تولید HTML فاکتور
    const html = await generateInvoiceHTML(orderId);
    
    // راه‌اندازی Puppeteer با chromium سیستمی
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    
    const page = await browser.newPage();
    
    // تنظیم محتوای HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });
    
    // گرفتن screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
    });
    
    console.log(`✅ فاکتور با موفقیت تولید شد`);
    
    return screenshot as Buffer;
  } catch (error) {
    console.error('❌ خطا در تولید فاکتور:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * تولید و ذخیره فاکتور و برگرداندن URL عمومی
 */
export async function generateAndSaveInvoice(orderId: string): Promise<string> {
  try {
    // تولید عکس فاکتور
    const imageBuffer = await generateInvoiceImage(orderId);
    
    // ایجاد پوشه invoices در صورت عدم وجود
    const invoicesDir = path.join(process.cwd(), 'public', 'invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }
    
    // نام فایل یونیک با timestamp
    const timestamp = Date.now();
    const filename = `invoice-${orderId}-${timestamp}.png`;
    const filepath = path.join(invoicesDir, filename);
    
    // ذخیره فایل
    fs.writeFileSync(filepath, imageBuffer);
    
    // ساخت URL عمومی
    let publicUrl: string;
    
    if (process.env.REPLIT_DEV_DOMAIN) {
      // اضافه کردن https:// به REPLIT_DEV_DOMAIN
      publicUrl = `https://${process.env.REPLIT_DEV_DOMAIN}/invoices/${filename}`;
    } else if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      // Manual construction for Replit
      publicUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/invoices/${filename}`;
    } else {
      // Fallback for local development
      publicUrl = `http://localhost:5000/invoices/${filename}`;
    }
    
    console.log(`✅ فاکتور ذخیره شد: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ خطا در تولید و ذخیره فاکتور:', error);
    throw error;
  }
}
