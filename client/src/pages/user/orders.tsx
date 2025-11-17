import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Calendar, MapPin, CreditCard, Clock, CheckCircle2, Truck, Package2, ShoppingBag, Download, Eye, Wallet, Copy, Check } from "lucide-react";
import { type Order, type OrderItem } from "@shared/schema";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";

  // Helper function to escape HTML content for security
  const escapeHtml = (unsafe: string | undefined | null) => {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

const statusColors = {
  awaiting_payment: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  preparing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
};

const statusLabels = {
  awaiting_payment: "در انتظار پرداخت",
  pending: "در انتظار تایید",
  confirmed: "تایید شده", 
  preparing: "در حال آماده‌سازی",
  shipped: "ارسال شده", 
  delivered: "تحویل داده شده",
  cancelled: "لغو شده"
};

const statusIcons = {
  awaiting_payment: CreditCard,
  pending: Clock,
  confirmed: CheckCircle2,
  preparing: Package2,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: Clock
};

export default function OrdersPage() {
  const { toast } = useToast();
  
  // Fetch orders
  const { data: orders = [], isLoading } = useQuery<(Order & { addressTitle?: string; fullAddress?: string; postalCode?: string })[]>({
    queryKey: ['/api/orders']
  });

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('fa-IR').format(Number(price)) + ' تومان';
  };

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPaymentOrderId, setSelectedPaymentOrderId] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Fetch crypto prices
  const { data: cryptoPrices } = useQuery<{
    usdtTron: number;
    usdtCardano: number;
    xrp: number;
  }>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch seller's bank card info
  const { data: sellerBankCard } = useQuery<{
    bankCardNumber?: string;
    bankCardHolderName?: string;
  }>({
    queryKey: ['/api/parent-user-bank-card'],
    enabled: paymentDialogOpen && !!selectedPaymentOrderId,
  });

  const handlePayment = (orderId: string) => {
    setSelectedPaymentOrderId(orderId);
    setPaymentDialogOpen(true);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(label);
      toast({
        title: "کپی شد",
        description: `${label} کپی شد`,
      });
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در کپی کردن",
        variant: "destructive",
      });
    }
  };

  const selectedPaymentOrder = orders.find(o => o.id === selectedPaymentOrderId);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<(Order & { items: (OrderItem & { productName: string; productDescription?: string; productImage?: string })[]; addressTitle?: string; fullAddress?: string; postalCode?: string; buyerFirstName?: string; buyerLastName?: string; buyerPhone?: string; sellerFirstName?: string; sellerLastName?: string }) | null>(null);
  
  // Fetch detailed order with items when modal is opened OR when downloading invoice
  const { data: selectedOrderData, isLoading: isLoadingOrderData } = useQuery<Order & { items: (OrderItem & { productName: string; productDescription?: string; productImage?: string })[]; addressTitle?: string; fullAddress?: string; postalCode?: string; buyerFirstName?: string; buyerLastName?: string; buyerPhone?: string; sellerFirstName?: string; sellerLastName?: string }>({
    queryKey: ['/api/orders', selectedOrderId || downloadingOrderId],
    enabled: !!(selectedOrderId || downloadingOrderId)
  });

  const invoiceRef = useRef<HTMLDivElement>(null);

  const downloadInvoice = async (orderData: Order & { items?: (OrderItem & { productName: string; productDescription?: string; productImage?: string })[]; addressTitle?: string; fullAddress?: string; postalCode?: string; buyerFirstName?: string; buyerLastName?: string; buyerPhone?: string; sellerFirstName?: string; sellerLastName?: string }) => {
    if (!invoiceRef.current) return;
    
    const invoiceElement = invoiceRef.current;
    const originalClassName = invoiceElement.className;
    const originalStyle = invoiceElement.style.cssText;
    
    // Determine size based on number of items
    const itemCount = orderData.items?.length || 0;
    const isLargeOrder = itemCount > 8; // Use A4 if more than 8 items
    const width = isLargeOrder ? '595px' : '842px'; // A4 portrait: 595px, A5 landscape: 842px
    
    try {
      // Make element visible but off-screen for proper measurement and capture
      invoiceElement.className = '';
      invoiceElement.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        display: block;
        opacity: 1;
        pointer-events: none;
        z-index: -1;
        width: ${width};
        min-height: ${isLargeOrder ? '842px' : '595px'};
        background-color: #ffffff;
      `;
      
      // Wait for fonts to load and images to be ready
      const images = Array.from(invoiceElement.querySelectorAll('img')).filter(img => !img.complete);
      if (images.length > 0) {
        await Promise.all(images.map(img => 
          new Promise(resolve => {
            img.onload = img.onerror = resolve;
          })
        ));
      }
      
      // Additional wait for fonts and styles
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(invoiceElement, {
        backgroundColor: '#ffffff',
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        allowTaint: false
      });
      
      const imageData = canvas.toDataURL('image/png');
      
      // دانلود فاکتور برای کاربر
      const link = document.createElement('a');
      link.download = `فاکتور-سفارش-${orderData.orderNumber || orderData.id.slice(0, 8)}.png`;
      link.href = imageData;
      link.click();

      // ذخیره نسخه‌ای از فاکتور در سرور
      try {
        const response = await fetch('/api/save-invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            orderId: orderData.id,
            imageData: imageData
          })
        });

        if (response.ok) {
          console.log('✅ فاکتور با موفقیت در سرور ذخیره شد');
        } else {
          console.error('❌ خطا در ذخیره فاکتور در سرور');
        }
      } catch (saveError) {
        console.error('❌ خطا در ارسال فاکتور به سرور:', saveError);
      }
    } catch (error) {
      console.error('خطا در تولید تصویر فاکتور:', error);
    } finally {
      // Always restore original state
      invoiceElement.className = originalClassName;
      invoiceElement.style.cssText = originalStyle;
    }
  };

  // Helper function to format price as Rial
  const formatPriceRial = (price: number | string) => {
    return new Intl.NumberFormat('fa-IR').format(Number(price) * 10) + ' ریال';
  };

  // Helper function to convert number to Persian words
  const numberToPersianWords = (num: number): string => {
    const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
    const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
    const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
    const hundreds = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
    const scales = ['', 'هزار', 'میلیون', 'میلیارد'];

    if (num === 0) return 'صفر';
    
    const convertGroup = (n: number): string => {
      let result = '';
      const h = Math.floor(n / 100);
      const t = Math.floor((n % 100) / 10);
      const o = n % 10;
      
      if (h > 0) {
        result += hundreds[h];
        if (t > 0 || o > 0) result += ' و ';
      }
      
      if (t === 1) {
        result += teens[o];
      } else {
        if (t > 0) {
          result += tens[t];
          if (o > 0) result += ' و ';
        }
        if (o > 0 && t !== 1) {
          result += ones[o];
        }
      }
      
      return result.trim();
    };

    let result = '';
    let scaleIndex = 0;
    
    while (num > 0) {
      const group = num % 1000;
      if (group > 0) {
        const groupText = convertGroup(group);
        if (scaleIndex > 0) {
          result = groupText + ' ' + scales[scaleIndex] + (result ? ' و ' + result : '');
        } else {
          result = groupText + (result ? ' و ' + result : '');
        }
      }
      num = Math.floor(num / 1000);
      scaleIndex++;
    }
    
    return result.trim();
  };

  const queryClient = useQueryClient();

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      setDownloadingOrderId(orderId);
      
      // Fetch fresh order details
      const orderData = await queryClient.ensureQueryData<Order & { items: (OrderItem & { productName: string; productDescription?: string; productImage?: string })[]; addressTitle?: string; fullAddress?: string; postalCode?: string; buyerFirstName?: string; buyerLastName?: string; buyerPhone?: string; sellerFirstName?: string; sellerLastName?: string }>({
        queryKey: ['/api/orders', orderId],
        staleTime: 0 // Force fresh fetch
      });
      
      if (orderData) {
        // Set invoice data to trigger DOM render
        setInvoiceData(orderData);
        
        // Wait for DOM to mount
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // Download invoice
        await downloadInvoice(orderData);
        
        // Clean up
        setInvoiceData(null);
      } else {
        console.error('Failed to load order data for invoice generation');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setDownloadingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-3 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-3 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8">

        {/* Orders List */}
        <div className="space-y-3 sm:space-y-6">
          {orders.length === 0 ? (
            <Card className="text-center py-12 sm:py-16">
              <CardContent>
                <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  هنوز سفارشی ثبت نکرده‌اید
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6">
                  بعد از خرید محصولات، سفارشات شما اینجا نمایش داده خواهند شد
                </p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  data-testid="button-start-shopping"
                >
                  شروع خرید
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => {
              const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
              const canPay = order.status === 'awaiting_payment';
              
              return (
                <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-order-${order.id}`}>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            سفارش #{order.orderNumber || order.id.slice(0, 8)}
                            <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            {new Date(order.createdAt!).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <Badge 
                          className={`${statusColors[order.status as keyof typeof statusColors]} text-xs`}
                          data-testid={`status-${order.id}`}
                        >
                          {statusLabels[order.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                      {/* Order Info - Compact */}
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                              {new Date(order.createdAt!).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            <span className="text-sm sm:text-base font-bold text-green-600" data-testid={`amount-${order.id}`}>
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                        {(order.fullAddress || order.addressTitle) && (
                          <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-500">
                            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                            <span data-testid={`address-${order.id}`} className="line-clamp-2">
                              {order.addressTitle ? `${order.addressTitle}: ${order.fullAddress || ''}` : order.fullAddress || 'آدرس تعیین نشده'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions - Compact */}
                      <div className="flex flex-col w-full sm:w-auto gap-2">
                        <div className="flex gap-2">
                          {canPay && (
                            <Button
                              size="sm"
                              onClick={() => handlePayment(order.id)}
                              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none h-9"
                              data-testid={`button-pay-${order.id}`}
                            >
                              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                              <span className="text-xs sm:text-sm">پرداخت</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadInvoice(order.id)}
                            disabled={downloadingOrderId === order.id}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 disabled:opacity-50 flex-1 sm:flex-none h-9"
                            data-testid={`button-download-${order.id}`}
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                            <span className="text-xs sm:text-sm hidden sm:inline">{downloadingOrderId === order.id ? 'در حال آماده‌سازی...' : 'دانلود فاکتور'}</span>
                            <span className="text-xs sm:hidden">فاکتور</span>
                          </Button>
                        </div>
                        <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedOrderId(null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrderId(order.id)}
                              data-testid={`button-details-${order.id}`}
                              className="w-full h-9"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                              <span className="text-xs sm:text-sm">جزئیات</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-right">
                                فاکتور سفارش #{selectedOrderData?.orderNumber || order.id.slice(0, 8)}
                              </DialogTitle>
                            </DialogHeader>
                            {isLoadingOrderData ? (
                              <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                  <p className="text-gray-600 dark:text-gray-400">در حال بارگیری...</p>
                                </div>
                              </div>
                            ) : selectedOrderData ? (
                              <div className="mt-6 space-y-6" dir="rtl">
                                {/* Invoice Header */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">شماره سفارش</p>
                                      <p className="font-bold text-lg">{selectedOrderData.orderNumber || selectedOrderData.id.slice(0, 8)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">تاریخ سفارش</p>
                                      <p className="font-medium">{new Date(selectedOrderData.createdAt!).toLocaleDateString('fa-IR')}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">وضعیت</p>
                                      <Badge className={statusColors[selectedOrderData.status as keyof typeof statusColors]}>
                                        {statusLabels[selectedOrderData.status as keyof typeof statusLabels]}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">آدرس تحویل</p>
                                      <p className="font-medium">
                                        {selectedOrderData.fullAddress ? (
                                          <>
                                            {selectedOrderData.addressTitle && (
                                              <span className="text-blue-600 font-semibold ml-2">{selectedOrderData.addressTitle}:</span>
                                            )}
                                            {selectedOrderData.fullAddress}
                                          </>
                                        ) : (
                                          'آدرس تعیین نشده'
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
  
                                {/* Order Items */}
                                <div className="border rounded-lg p-6">
                                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    آیتم‌های سفارش
                                  </h3>
                                  <div className="space-y-3">
                                    {selectedOrderData.items && selectedOrderData.items.length > 0 ? (
                                      selectedOrderData.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                          {item.productImage && (
                                            <img
                                              src={item.productImage}
                                              alt={item.productName}
                                              className="w-16 h-16 object-cover rounded-lg"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                              {item.productName}
                                            </h4>
                                            {item.productDescription && (
                                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {item.productDescription}
                                              </p>
                                            )}
                                            <div className="flex justify-between items-center mt-2">
                                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                                تعداد: {item.quantity} عدد
                                              </div>
                                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                                قیمت واحد: {formatPrice(item.unitPrice)}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-left">
                                            <div className="font-bold text-green-600">
                                              {formatPrice(item.totalPrice)}
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                        هیچ آیتمی یافت نشد
                                      </div>
                                    )}
                                    
                                    {/* Total */}
                                    <div className="flex justify-between py-4 bg-green-50 dark:bg-green-950/20 px-4 rounded-lg border-t-2 border-green-200 dark:border-green-800">
                                      <span className="font-bold text-lg">مجموع کل:</span>
                                      <span className="font-bold text-xl text-green-600">
                                        {formatPrice(selectedOrderData.totalAmount)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
  
                                {/* Notes */}
                                {selectedOrderData.notes && (
                                  <div className="border rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-3">توضیحات سفارش</h3>
                                    <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                                      {selectedOrderData.notes}
                                    </p>
                                  </div>
                                )}

                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <p className="text-gray-600 dark:text-gray-400">خطا در بارگیری جزئیات سفارش</p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            توضیحات سفارش
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg" data-testid={`notes-${order.id}`}>
                            {order.notes}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Invoice for Capture - Persian Style - Moved outside Dialog */}
        {invoiceData && (
          <div 
            ref={invoiceRef} 
            className="hidden"
            style={{
              direction: 'rtl',
              fontFamily: 'Vazirmatn, Arial, sans-serif',
              backgroundColor: '#ffffff',
              width: invoiceData.items && invoiceData.items.length > 8 ? '595px' : '842px',
              margin: '0 auto',
              color: '#000000',
              fontSize: invoiceData.items && invoiceData.items.length > 8 ? '13px' : '14px',
              lineHeight: '1.4',
              padding: '0'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #000'
            }}>
              <div style={{ width: '100px' }}></div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', flex: 1 }}>
                فاکتور فروش
              </h1>
              <div style={{ textAlign: 'left', fontSize: '16px' }}>
                تاریخ: {new Date(invoiceData.createdAt!).toLocaleDateString('fa-IR')}
              </div>
            </div>
            
            {/* Seller Section Header */}
            <div style={{
              backgroundColor: '#d3d3d3',
              textAlign: 'right',
              padding: '10px',
              fontWeight: 'bold',
              fontSize: '16px',
              borderBottom: '1px solid #000'
            }}>
              مشخصات فروشنده
            </div>
            
            {/* Seller Details */}
            <div style={{
              padding: '15px',
              borderBottom: '1px solid #000',
              textAlign: 'right',
              fontSize: '14px'
            }}>
              {(invoiceData as any).vatSettings?.isEnabled ? (
                `نام شرکت: ${(invoiceData as any).vatSettings?.companyName || '-'} - شناسه ملی: ${(invoiceData as any).vatSettings?.nationalId || '-'} - کد اقتصادی: ${(invoiceData as any).vatSettings?.economicCode || '-'} - تلفن: ${(invoiceData as any).vatSettings?.phoneNumber || '-'} - آدرس: ${(invoiceData as any).vatSettings?.address || '-'}`
              ) : (
                `نام شخص / سازمان : ${invoiceData.sellerFirstName && invoiceData.sellerLastName 
                  ? `${invoiceData.sellerFirstName} ${invoiceData.sellerLastName}` 
                  : 'فروشنده'}`
              )}
            </div>
            
            {/* Customer Section Header */}
            <div style={{
              backgroundColor: '#d3d3d3',
              textAlign: 'right',
              padding: '10px',
              fontWeight: 'bold',
              fontSize: '16px',
              borderBottom: '1px solid #000'
            }}>
              مشخصات خریدار
            </div>
            
            {/* Customer Details */}
            <div style={{
              padding: '15px',
              borderBottom: '1px solid #000',
              textAlign: 'right',
              fontSize: '14px',
              lineHeight: '1.8'
            }}>
              نام شخص / سازمان : {invoiceData.buyerFirstName && invoiceData.buyerLastName 
                ? `${invoiceData.buyerFirstName} ${invoiceData.buyerLastName}` 
                : 'مشتری گرامی'} - آدرس : {invoiceData.fullAddress || '-'} - کد پستی : {invoiceData.postalCode || '-'} - تلفن : {invoiceData.buyerPhone || '-'}
            </div>
            
            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
              <thead>
                <tr>
                  <th style={{ width: '8%', backgroundColor: '#d3d3d3', border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', verticalAlign: 'middle' }}>
                    ردیف
                  </th>
                  <th style={{ width: '36%', backgroundColor: '#d3d3d3', border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', verticalAlign: 'middle' }}>
                    شرح کالا یا خدمات
                  </th>
                  <th style={{ width: '10%', backgroundColor: '#d3d3d3', border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', verticalAlign: 'middle' }}>
                    تعداد
                  </th>
                  <th style={{ width: '15%', backgroundColor: '#d3d3d3', border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', verticalAlign: 'middle' }}>
                    قیمت واحد<br />(ریال)
                  </th>
                  <th style={{ width: '15%', backgroundColor: '#d3d3d3', border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', verticalAlign: 'middle' }}>
                    ارزش افزوده<br />(ریال)
                  </th>
                  <th style={{ width: '16%', backgroundColor: '#d3d3d3', border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', verticalAlign: 'middle' }}>
                    قیمت کل<br />(ریال)
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Actual Items - Dynamic based on actual count */}
                {invoiceData.items && invoiceData.items.length > 0 && invoiceData.items.map((item, index) => {
                  const isLargeOrder = invoiceData.items!.length > 8;
                  const fontSize = isLargeOrder ? '12px' : '14px';
                  const padding = isLargeOrder ? '6px' : '8px';
                  
                  const vatPercentage = (invoiceData as any).vatSettings?.isEnabled 
                    ? parseFloat((invoiceData as any).vatSettings.vatPercentage) 
                    : 0;
                  const itemSubtotal = parseFloat(item.totalPrice);
                  const itemVat = vatPercentage > 0 ? Math.round(itemSubtotal * (vatPercentage / 100)) : 0;
                  const itemTotal = itemSubtotal + itemVat;
                  
                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', border: '1px solid #000', padding, fontSize, verticalAlign: 'middle' }}>
                        {index + 1}
                      </td>
                      <td style={{ textAlign: 'right', border: '1px solid #000', padding, fontSize, verticalAlign: 'middle' }}>
                        {item.productName}
                      </td>
                      <td style={{ textAlign: 'center', border: '1px solid #000', padding, fontSize, verticalAlign: 'middle' }}>
                        {item.quantity}
                      </td>
                      <td style={{ textAlign: 'center', border: '1px solid #000', padding, fontSize, verticalAlign: 'middle' }}>
                        {formatPriceRial(item.unitPrice)}
                      </td>
                      <td style={{ textAlign: 'center', border: '1px solid #000', padding, fontSize, verticalAlign: 'middle' }}>
                        {vatPercentage > 0 ? formatPriceRial(itemVat) : '-'}
                      </td>
                      <td style={{ textAlign: 'center', border: '1px solid #000', padding, fontSize, verticalAlign: 'middle' }}>
                        {formatPriceRial(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                {(() => {
                  const vatPercentage = (invoiceData as any).vatSettings?.isEnabled 
                    ? parseFloat((invoiceData as any).vatSettings.vatPercentage) 
                    : 0;
                  const subtotal = invoiceData.items?.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0) || 0;
                  const vatAmount = Math.round(subtotal * (vatPercentage / 100));
                  const totalWithVat = subtotal + vatAmount;
                  
                  return (
                    <tr style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>
                      <td colSpan={4} style={{ textAlign: 'right', border: '1px solid #000', padding: '12px', verticalAlign: 'middle' }}></td>
                      <td style={{ textAlign: 'center', border: '1px solid #000', padding: '12px', verticalAlign: 'middle' }}>
                        {vatPercentage > 0 ? formatPriceRial(vatAmount).replace(' ریال', '') : '-'}
                      </td>
                      <td style={{ textAlign: 'center', border: '1px solid #000', padding: '12px', verticalAlign: 'middle' }}>
                        {formatPriceRial(vatPercentage > 0 ? totalWithVat : subtotal).replace(' ریال', '')}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
            
            {/* Total in Words */}
            {(() => {
              const vatPercentage = (invoiceData as any).vatSettings?.isEnabled 
                ? parseFloat((invoiceData as any).vatSettings.vatPercentage) 
                : 0;
              const subtotal = invoiceData.items?.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0) || 0;
              const vatAmount = Math.round(subtotal * (vatPercentage / 100));
              const totalWithVat = subtotal + vatAmount;
              
              return (
                <div style={{
                  padding: '15px',
                  textAlign: 'right',
                  fontSize: '14px',
                  borderBottom: '1px solid #000'
                }}>
                  {vatPercentage > 0 ? 'مبلغ قابل پرداخت' : 'جمع کل'} به حروف: {numberToPersianWords((vatPercentage > 0 ? totalWithVat : subtotal) * 10)} ریال
                </div>
              );
            })()}
            
            {/* Thank You Message */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              minHeight: '60px'
            }}>
              <div style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                از خرید شما متشکریم
              </div>
              {(invoiceData as any).vatSettings?.isEnabled && (
                <div style={{
                  position: 'absolute',
                  left: '40px',
                  top: '-80px',
                  width: '150px',
                  height: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}>
                  {(invoiceData as any).vatSettings?.stampImage ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img 
                        src={(invoiceData as any).vatSettings.stampImage} 
                        alt="مهر و امضا" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain',
                          opacity: 0.5,
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                      />
                      <div style={{ 
                        position: 'absolute',
                        top: '60%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '12px', 
                        color: '#333',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                      }}>
                        مهر و امضا شرکت
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '14px', color: '#999', opacity: 0.3 }}>
                      مهر و امضا شرکت
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right text-xl">
              انتخاب روش پرداخت
            </DialogTitle>
          </DialogHeader>
          
          {selectedPaymentOrder && (
            <div className="space-y-4" dir="rtl">
              {/* Order Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">اطلاعات سفارش</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">شماره سفارش: </span>
                    <span className="font-bold">#{selectedPaymentOrder.orderNumber || selectedPaymentOrder.id.slice(0, 8)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">مبلغ قابل پرداخت: </span>
                    <span className="font-bold text-green-600">{formatPrice(selectedPaymentOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Crypto Payment Card */}
                <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-6 h-6 text-blue-600" />
                      <CardTitle className="text-lg">پرداخت با ارز دیجیتال</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {cryptoPrices ? (
                      <>
                        <div className="space-y-3">
                          {/* USDT Tron */}
                          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <img 
                                src="/images/usdt-logo.jpg" 
                                alt="USDT" 
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="font-semibold">USDT (Tron)</span>
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">قیمت: </span>
                                <span className="font-bold">{new Intl.NumberFormat('fa-IR').format(cryptoPrices.usdtTron)} تومان</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">مقدار مورد نیاز: </span>
                                <span className="font-bold text-green-600">
                                  {(Number(selectedPaymentOrder.totalAmount) / cryptoPrices.usdtTron).toFixed(2)} USDT
                                </span>
                              </div>
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400 text-xs">آدرس کیف پول:</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded flex-1 break-all">
                                    TRX... (در انتظار دریافت از فروشنده)
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard("TRX...", "آدرس USDT Tron")}
                                    className="shrink-0"
                                  >
                                    {copiedAddress === "آدرس USDT Tron" ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* USDT Cardano */}
                          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <img 
                                src="/images/ada-logo.png" 
                                alt="Cardano" 
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="font-semibold">USDT (Cardano)</span>
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">قیمت: </span>
                                <span className="font-bold">{new Intl.NumberFormat('fa-IR').format(cryptoPrices.usdtCardano)} تومان</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">مقدار مورد نیاز: </span>
                                <span className="font-bold text-green-600">
                                  {(Number(selectedPaymentOrder.totalAmount) / cryptoPrices.usdtCardano).toFixed(2)} USDT
                                </span>
                              </div>
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400 text-xs">آدرس کیف پول:</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded flex-1 break-all">
                                    addr1... (در انتظار دریافت از فروشنده)
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard("addr1...", "آدرس USDT Cardano")}
                                    className="shrink-0"
                                  >
                                    {copiedAddress === "آدرس USDT Cardano" ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* XRP */}
                          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <img 
                                src="/images/xrp-logo.jpg" 
                                alt="XRP" 
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="font-semibold">XRP (Ripple)</span>
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">قیمت: </span>
                                <span className="font-bold">{new Intl.NumberFormat('fa-IR').format(cryptoPrices.xrp)} تومان</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">مقدار مورد نیاز: </span>
                                <span className="font-bold text-green-600">
                                  {(Number(selectedPaymentOrder.totalAmount) / cryptoPrices.xrp).toFixed(2)} XRP
                                </span>
                              </div>
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400 text-xs">آدرس کیف پول:</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded flex-1 break-all">
                                    rXXX... (در انتظار دریافت از فروشنده)
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard("rXXX...", "آدرس XRP")}
                                    className="shrink-0"
                                  >
                                    {copiedAddress === "آدرس XRP" ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                          <p className="font-semibold mb-1">⚠️ توجه:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>پس از واریز، اسکرین‌شات تراکنش را ارسال کنید</li>
                            <li>قیمت‌ها به‌صورت لحظه‌ای به‌روزرسانی می‌شوند</li>
                            <li>از شبکه صحیح استفاده کنید</li>
                          </ul>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                        <p className="text-gray-600 dark:text-gray-400">در حال دریافت قیمت‌ها...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Bank Card Payment */}
                <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-green-600" />
                      <CardTitle className="text-lg">پرداخت با کارت بانکی</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {sellerBankCard && sellerBankCard.bankCardNumber ? (
                      <>
                        <div className="space-y-3">
                          <div className="bg-gradient-to-br from-gray-700 to-gray-900 p-6 rounded-xl text-white shadow-lg">
                            <div className="mb-4">
                              <div className="text-xs text-gray-300 mb-1">شماره کارت</div>
                              <div className="flex items-center justify-between">
                                <div className="font-mono text-lg tracking-wider" dir="ltr">
                                  {sellerBankCard.bankCardNumber.match(/.{1,4}/g)?.join(' ')}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(sellerBankCard.bankCardNumber || "", "شماره کارت")}
                                  className="text-white hover:text-white hover:bg-white/20"
                                >
                                  {copiedAddress === "شماره کارت" ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-300 mb-1">نام صاحب کارت</div>
                              <div className="font-semibold">{sellerBankCard.bankCardHolderName}</div>
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <div className="text-center">
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">مبلغ قابل پرداخت</div>
                              <div className="text-2xl font-bold text-green-600">
                                {formatPrice(selectedPaymentOrder.totalAmount)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                          <p className="font-semibold mb-1">📌 راهنما:</p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>مبلغ را به شماره کارت بالا واریز کنید</li>
                            <li>اسکرین‌شات رسید پرداخت را ذخیره کنید</li>
                            <li>از بخش "امور مالی" تراکنش را ثبت کنید</li>
                            <li>سفارش پس از تایید پرداخت پردازش می‌شود</li>
                          </ol>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        {sellerBankCard === undefined ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                            <p className="text-gray-600 dark:text-gray-400">در حال دریافت اطلاعات...</p>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400">
                              اطلاعات کارت بانکی فروشنده در دسترس نیست
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                              لطفاً از روش پرداخت دیگری استفاده کنید
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setPaymentDialogOpen(false)}
                >
                  بستن
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}