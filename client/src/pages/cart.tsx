import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ShoppingCart, Plus, Minus, Trash2, Package, MapPin, Star, CreditCard, Truck, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CartItem, Product, Address, ShippingSettings } from "@shared/schema";

// Extended cart item with product details
interface CartItemWithProduct extends CartItem {
  productName: string;
  productDescription?: string;
  productImage?: string;
}

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("");
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: "",
    fullAddress: "",
    postalCode: "",
    isDefault: false
  });

  // Get user's cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  // Get user's addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
    enabled: !!user,
  });

  // Get seller ID from user (parent user for level 2)
  const sellerId = user?.parentUserId;

  // Get seller's shipping settings
  const { data: shippingSettings, isLoading: shippingLoading } = useQuery<ShippingSettings>({
    queryKey: [`/api/shipping-settings/${sellerId}`],
    enabled: !!user && user.role === "user_level_2" && !!sellerId,
  });

  // Calculate total
  const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Auto-select default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  // Add new address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (addressData: typeof newAddress) => {
      const response = await apiRequest("POST", "/api/addresses", addressData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "خطا در ثبت آدرس");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setSelectedAddressId(data.id);
      setIsAddressDialogOpen(false);
      setNewAddress({
        title: "",
        fullAddress: "",
        postalCode: "",
        isDefault: false
      });
      toast({
        title: "موفقیت",
        description: "آدرس جدید با موفقیت اضافه شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update cart item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity < 1) {
        throw new Error("تعداد باید بیشتر از صفر باشد");
      }
      const response = await apiRequest("PATCH", `/api/cart/items/${itemId}`, { quantity });
      if (!response.ok) {
        throw new Error("خطا در بروزرسانی تعداد");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "موفقیت",
        description: "تعداد محصول بروزرسانی شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove item from cart
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("DELETE", `/api/cart/items/${itemId}`);
      if (!response.ok) {
        throw new Error("خطا در حذف محصول از سبد");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "موفقیت",
        description: "محصول از سبد خرید حذف شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear entire cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/cart/clear");
      if (!response.ok) {
        throw new Error("خطا در پاک کردن سبد");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "موفقیت", 
        description: "سبد خرید پاک شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleClearCart = () => {
    if (cartItems.length > 0) {
      clearCartMutation.mutate();
    }
  };

  // Proceed to checkout mutation
  const proceedToCheckoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAddressId) {
        throw new Error("لطفاً آدرس تحویل را انتخاب کنید");
      }
      if (!selectedShippingMethod) {
        throw new Error("لطفاً روش ارسال را انتخاب کنید");
      }
      const response = await apiRequest("POST", "/api/orders", {
        addressId: selectedAddressId,
        shippingMethod: selectedShippingMethod
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "خطا در ثبت سفارش");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "موفقیت",
        description: "سفارش شما با موفقیت ثبت شد و در لیست سفارشات شما قرار گرفت",
      });
      // Redirect to orders page
      setLocation('/orders');
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProceedToCheckout = () => {
    if (cartItems.length > 0) {
      proceedToCheckoutMutation.mutate();
    }
  };

  const handleAddNewAddress = () => {
    if (newAddress.title && newAddress.fullAddress) {
      addAddressMutation.mutate(newAddress);
    } else {
      toast({
        title: "خطا",
        description: "لطفاً عنوان و آدرس کامل را وارد کنید",
        variant: "destructive",
      });
    }
  };

  if (cartLoading) {
    return (
      <DashboardLayout title="سبد خرید">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">در حال بارگذاری...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="سبد خرید">
      <div className="space-y-6" data-testid="cart-content">
        {/* Modern Cart Header */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">سبد خرید شما</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-sm">
                      {totalItems} محصول
                    </Badge>
                    {shippingSettings?.freeShippingEnabled && 
                     shippingSettings?.freeShippingMinAmount && 
                     totalAmount >= parseFloat(shippingSettings.freeShippingMinAmount) && (
                      <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                        ارسال رایگان
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {cartItems.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  disabled={clearCartMutation.isPending}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                  data-testid="button-clear-cart"
                >
                  {clearCartMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 ml-2" />
                  )}
                  پاک کردن سبد
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">سبد خرید شما خالی است</h3>
              <p className="text-muted-foreground mb-4">
                هنوز محصولی به سبد خرید خود اضافه نکرده‌اید
              </p>
              <Link href="/products">
                <Button variant="default" data-testid="button-start-shopping">
                  شروع خرید
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1" data-testid={`text-product-name-${item.id}`}>
                          {item.productName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            قیمت واحد: {parseFloat(item.unitPrice).toLocaleString()} تومان
                          </Badge>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                          data-testid={`button-decrease-${item.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          key={`${item.id}-${item.quantity}`}
                          defaultValue={item.quantity}
                          onBlur={(e) => {
                            const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                            if (newQuantity !== item.quantity) {
                              handleQuantityChange(item.id, newQuantity);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const newQuantity = Math.max(1, parseInt(e.currentTarget.value) || 1);
                              if (newQuantity !== item.quantity) {
                                handleQuantityChange(item.id, newQuantity);
                              }
                            }
                          }}
                          className="w-12 text-center text-sm h-8"
                          min="1"
                          data-testid={`input-quantity-${item.id}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={updateQuantityMutation.isPending}
                          data-testid={`button-increase-${item.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price and Remove */}
                      <div className="text-left flex flex-col gap-1">
                        <p className="font-bold text-base" data-testid={`text-total-price-${item.id}`}>
                          {parseFloat(item.totalPrice).toLocaleString()} تومان
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeItemMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 text-xs"
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="h-3 w-3 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Checkout Summary and Address - Full Width */}
            <div className="space-y-4">
              {/* Address and Shipping Method - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Address Selection */}
                <Card className="h-full">
                  <CardHeader className="pb-2 pt-3">
                    <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                      <MapPin className="h-3.5 w-3.5" />
                      آدرس تحویل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0 pb-3">
                  {addressesLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      <span className="text-xs text-muted-foreground">در حال بارگذاری...</span>
                    </div>
                  ) : addresses.length > 0 ? (
                    <>
                      <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                        <SelectTrigger data-testid="select-address" className="text-xs h-8">
                          <SelectValue placeholder="آدرس تحویل را انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent>
                          {addresses.map((address) => (
                            <SelectItem key={address.id} value={address.id} className="text-xs">
                              {address.title} - {address.fullAddress.substring(0, 25)}...
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      هیچ آدرسی ثبت نشده است
                    </p>
                  )}
                  
                  <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full text-xs h-7" data-testid="button-add-address">
                        <Plus className="h-3 w-3 ml-1" />
                        افزودن آدرس
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          اضافه کردن آدرس جدید
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="title" className="text-sm font-medium">عنوان آدرس *</Label>
                            <Input
                              id="title"
                              placeholder="مثال: منزل، محل کار، آدرس والدین"
                              value={newAddress.title}
                              onChange={(e) => setNewAddress({...newAddress, title: e.target.value})}
                              className="mt-1"
                              data-testid="input-address-title"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="fullAddress" className="text-sm font-medium">آدرس کامل *</Label>
                            <Textarea
                              id="fullAddress"
                              placeholder="لطفاً آدرس کامل شامل استان، شهر، خیابان، کوچه، پلاک و واحد را وارد کنید..."
                              value={newAddress.fullAddress}
                              onChange={(e) => setNewAddress({...newAddress, fullAddress: e.target.value})}
                              className="mt-1 min-h-[80px]"
                              data-testid="textarea-full-address"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="postalCode" className="text-sm font-medium">کد پستی</Label>
                            <Input
                              id="postalCode"
                              placeholder="1234567890"
                              value={newAddress.postalCode || ""}
                              onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                              className="mt-1"
                              maxLength={10}
                              data-testid="input-postal-code"
                            />
                            <p className="text-xs text-muted-foreground mt-1">کد پستی 10 رقمی (اختیاری)</p>
                          </div>
                          
                          <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                            <Label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">
                              تنظیم به عنوان آدرس پیش‌فرض
                            </Label>
                            <div className="flex items-center gap-2" dir="ltr">
                              <Switch
                                id="isDefault"
                                checked={newAddress.isDefault}
                                onCheckedChange={(checked) => setNewAddress({...newAddress, isDefault: checked})}
                                data-testid="switch-default-address"
                                className="data-[state=checked]:bg-primary [&>span]:data-[state=checked]:translate-x-5 [&>span]:data-[state=unchecked]:translate-x-0"
                              />
                              <span className="text-sm text-muted-foreground" dir="rtl">
                                {newAddress.isDefault ? "فعال" : "غیرفعال"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => setIsAddressDialogOpen(false)}
                            className="flex-1"
                          >
                            انصراف
                          </Button>
                          <Button 
                            onClick={handleAddNewAddress} 
                            disabled={addAddressMutation.isPending}
                            className="flex-1"
                            data-testid="button-save-address"
                          >
                            {addAddressMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white ml-1"></div>
                                در حال ذخیره...
                              </>
                            ) : (
                              <>
                                <MapPin className="h-3 w-3 ml-1" />
                                ذخیره آدرس
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
                </Card>

                {/* Shipping Method Selection */}
                <Card className="h-full">
                  <CardHeader className="pb-2 pt-3">
                    <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                      <Truck className="h-3.5 w-3.5" />
                      روش ارسال
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0 pb-3">
                  {shippingLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      <span className="text-xs text-muted-foreground">در حال بارگذاری...</span>
                    </div>
                  ) : shippingSettings ? (
                    <>
                      {(shippingSettings.postPishtazEnabled || shippingSettings.postNormalEnabled || shippingSettings.piykEnabled || shippingSettings.freeShippingEnabled) ? (
                        <div className="space-y-1.5">
                          {shippingSettings.postPishtazEnabled && (
                            <button
                              onClick={() => setSelectedShippingMethod('post_pishtaz')}
                              className={`w-full p-2 rounded-md border transition-all text-right ${
                                selectedShippingMethod === 'post_pishtaz' 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-gray-200 hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Package className="h-3.5 w-3.5 text-primary" />
                                <span className="font-medium text-xs">پست پیشتاز</span>
                              </div>
                            </button>
                          )}
                          {shippingSettings.postNormalEnabled && (
                            <button
                              onClick={() => setSelectedShippingMethod('post_normal')}
                              className={`w-full p-2 rounded-md border transition-all text-right ${
                                selectedShippingMethod === 'post_normal' 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-gray-200 hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Package className="h-3.5 w-3.5 text-primary" />
                                <span className="font-medium text-xs">پست معمولی</span>
                              </div>
                            </button>
                          )}
                          {shippingSettings.piykEnabled && (
                            <button
                              onClick={() => setSelectedShippingMethod('piyk')}
                              className={`w-full p-2 rounded-md border transition-all text-right ${
                                selectedShippingMethod === 'piyk' 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-gray-200 hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Truck className="h-3.5 w-3.5 text-primary" />
                                <span className="font-medium text-xs">ارسال با پیک</span>
                              </div>
                            </button>
                          )}
                          {shippingSettings.freeShippingEnabled && totalAmount >= parseFloat(shippingSettings.freeShippingMinAmount || '0') && (
                            <button
                              onClick={() => setSelectedShippingMethod('free')}
                              className={`w-full p-2 rounded-md border transition-all text-right ${
                                selectedShippingMethod === 'free' 
                                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                                  : 'border-green-200 hover:border-green-500/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Truck className="h-3.5 w-3.5 text-green-600" />
                                  <span className="font-medium text-xs text-green-600">ارسال رایگان</span>
                                </div>
                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-green-50 dark:bg-green-950/30 text-green-700">
                                  رایگان
                                </Badge>
                              </div>
                            </button>
                          )}
                          {shippingSettings.freeShippingEnabled && totalAmount < parseFloat(shippingSettings.freeShippingMinAmount || '0') && (
                            <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                              <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-tight">
                                حداقل {parseFloat(shippingSettings.freeShippingMinAmount || '0').toLocaleString()} تومان برای ارسال رایگان
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          روش ارسالی فعال نیست
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      تنظیمات ارسال در دسترس نیست
                    </p>
                  )}
                </CardContent>
              </Card>
              </div>

              {/* Order Summary */}
              <Card className="h-fit">
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    خلاصه سفارش
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 pb-3">
                  <div className="flex items-center justify-between py-1 px-2 bg-muted/30 rounded">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-primary" />
                      <span className="font-medium text-xs">تعداد محصولات</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5" data-testid="text-total-items">
                      {totalItems} عدد
                    </Badge>
                  </div>
                  
                  <Separator className="my-1" />
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-medium">جمع کل:</span>
                    <div className="text-left">
                      <span className="text-sm font-bold text-primary" data-testid="text-total-amount">
                        {totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground mr-1">تومان</span>
                    </div>
                  </div>

                  {totalAmount > 500000 && (
                    <div className="bg-green-50 dark:bg-green-950/20 p-1.5 rounded text-center">
                      <div className="flex items-center justify-center gap-1 text-green-700 dark:text-green-400">
                        <Truck className="h-3 w-3" />
                        <span className="text-[10px] font-medium">ارسال رایگان</span>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full h-8 text-xs mt-2" 
                    onClick={handleProceedToCheckout}
                    disabled={proceedToCheckoutMutation.isPending || !selectedAddressId || !selectedShippingMethod}
                    data-testid="button-proceed-checkout"
                  >
                    {proceedToCheckoutMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white ml-1"></div>
                        در حال پردازش...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-3 w-3 ml-1" />
                        تکمیل خرید
                      </>
                    )}
                  </Button>
                  
                  {!selectedAddressId && cartItems.length > 0 && (
                    <p className="text-[10px] text-orange-600 text-center bg-orange-50 dark:bg-orange-950/20 p-1.5 rounded leading-tight">
                      لطفاً آدرس تحویل را انتخاب کنید
                    </p>
                  )}
                  {!selectedShippingMethod && cartItems.length > 0 && (
                    <p className="text-[10px] text-orange-600 text-center bg-orange-50 dark:bg-orange-950/20 p-1.5 rounded leading-tight">
                      لطفاً روش ارسال را انتخاب کنید
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}