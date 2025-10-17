import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createAuthenticatedRequest } from "@/lib/auth";
import type { VatSettings } from "@shared/schema";

export default function VatSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [vatPercentage, setVatPercentage] = useState<string>("9");
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [nationalId, setNationalId] = useState<string>("");
  const [economicCode, setEconomicCode] = useState<string>("");
  const [stampImage, setStampImage] = useState<string>("");
  const [uploadingStamp, setUploadingStamp] = useState<boolean>(false);

  const { data: vatSettings, isLoading } = useQuery<VatSettings>({
    queryKey: ["/api/vat-settings"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/vat-settings");
      if (!response.ok) throw new Error("خطا در دریافت تنظیمات ارزش افزوده");
      const data = await response.json();
      if (data) {
        setVatPercentage(data.vatPercentage);
        setIsEnabled(data.isEnabled);
        setCompanyName(data.companyName || "");
        setAddress(data.address || "");
        setPhoneNumber(data.phoneNumber || "");
        setNationalId(data.nationalId || "");
        setEconomicCode(data.economicCode || "");
        setStampImage(data.stampImage || "");
      }
      return data;
    },
  });

  const updateVatMutation = useMutation({
    mutationFn: async (data: { 
      vatPercentage: string; 
      isEnabled: boolean;
      companyName?: string;
      address?: string;
      phoneNumber?: string;
      nationalId?: string;
      economicCode?: string;
      stampImage?: string;
    }) => {
      const response = await createAuthenticatedRequest("/api/vat-settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطا در بروزرسانی تنظیمات ارزش افزوده");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vat-settings"] });
      toast({
        title: "موفقیت",
        description: "تنظیمات ارزش افزوده با موفقیت ذخیره شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message || "خطا در ذخیره تنظیمات ارزش افزوده",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const percentage = parseFloat(vatPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast({
        title: "خطا",
        description: "درصد ارزش افزوده باید بین ۰ تا ۱۰۰ باشد",
        variant: "destructive",
      });
      return;
    }

    // اگر ارزش افزوده فعال است، باید تمام فیلدها پر شوند
    if (isEnabled) {
      if (!companyName || !address || !phoneNumber || !nationalId || !economicCode) {
        toast({
          title: "خطا",
          description: "هنگام فعال‌سازی ارزش افزوده، تمام فیلدهای اطلاعات شرکت باید پر شوند",
          variant: "destructive",
        });
        return;
      }
    }

    updateVatMutation.mutate({
      vatPercentage: vatPercentage,
      isEnabled: isEnabled,
      companyName: companyName,
      address: address,
      phoneNumber: phoneNumber,
      nationalId: nationalId,
      economicCode: economicCode,
      stampImage: stampImage,
    });
  };

  const handleStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // بررسی نوع فایل
    if (!file.type.startsWith('image/png')) {
      toast({
        title: "خطا",
        description: "فقط فایل‌های PNG مجاز هستند",
        variant: "destructive",
      });
      return;
    }

    // بررسی حجم فایل (حداکثر 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "خطا",
        description: "حجم فایل نباید بیشتر از 2 مگابایت باشد",
        variant: "destructive",
      });
      return;
    }

    setUploadingStamp(true);
    
    try {
      const formData = new FormData();
      formData.append('stampImage', file);

      const response = await createAuthenticatedRequest('/api/vat-settings/upload-stamp', {
        method: 'POST',
        body: formData,
        headers: {
          // حذف Content-Type برای FormData
        },
      });

      if (!response.ok) {
        throw new Error('خطا در آپلود عکس مهر و امضا');
      }

      const data = await response.json();
      setStampImage(data.stampImagePath);
      
      toast({
        title: "موفقیت",
        description: "عکس مهر و امضا با موفقیت آپلود شد",
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در آپلود عکس مهر و امضا",
        variant: "destructive",
      });
    } finally {
      setUploadingStamp(false);
    }
  };

  return (
    <DashboardLayout title="تنظیمات ارزش افزوده">
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">در حال بارگذاری...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="vat-enabled" className="text-sm font-medium">
                    فعال/غیرفعال کردن ارزش افزوده
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isEnabled ? "ارزش افزوده فعال است" : "ارزش افزوده غیرفعال است"}
                  </p>
                </div>
                <Switch
                  id="vat-enabled"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vat-percentage" className="text-sm">درصد ارزش افزوده (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="vat-percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={vatPercentage}
                    onChange={(e) => setVatPercentage(e.target.value)}
                    className="max-w-[200px]"
                    disabled={!isEnabled}
                  />
                  <span className="text-sm text-muted-foreground">٪</span>
                </div>
              </div>

              {isEnabled && (
                <div className="space-y-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="text-xs font-medium text-amber-900 dark:text-amber-100">
                    اطلاعات شرکت (اجباری) *
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="company-name" className="text-xs">نام شرکت</Label>
                      <Input
                        id="company-name"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="نام شرکت"
                        className="bg-white dark:bg-gray-800 h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone-number" className="text-xs">شماره تلفن ثابت</Label>
                      <Input
                        id="phone-number"
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="02112345678"
                        className="bg-white dark:bg-gray-800 h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="national-id" className="text-xs">شناسه ملی</Label>
                      <Input
                        id="national-id"
                        type="text"
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                        placeholder="شناسه ملی"
                        className="bg-white dark:bg-gray-800 h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="economic-code" className="text-xs">کد اقتصادی</Label>
                      <Input
                        id="economic-code"
                        type="text"
                        value={economicCode}
                        onChange={(e) => setEconomicCode(e.target.value)}
                        placeholder="کد اقتصادی"
                        className="bg-white dark:bg-gray-800 h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="address" className="text-xs">آدرس</Label>
                      <Input
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="آدرس کامل شرکت"
                        className="bg-white dark:bg-gray-800 h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="stamp-image" className="text-xs">عکس مهر و امضا شرکت (PNG)</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="stamp-image"
                          type="file"
                          accept="image/png"
                          onChange={handleStampUpload}
                          disabled={uploadingStamp}
                          className="bg-white dark:bg-gray-800 h-9 text-sm"
                        />
                        {stampImage && (
                          <img 
                            src={stampImage} 
                            alt="مهر و امضا" 
                            className="h-16 w-auto border border-gray-300 rounded"
                          />
                        )}
                      </div>
                      {uploadingStamp && (
                        <p className="text-xs text-blue-600">در حال آپلود...</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        فقط فایل PNG با حداکثر حجم 2 مگابایت مجاز است
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={updateVatMutation.isPending}
                  size="sm"
                >
                  {updateVatMutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
