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

  const { data: vatSettings, isLoading } = useQuery<VatSettings>({
    queryKey: ["/api/vat-settings"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/vat-settings");
      if (!response.ok) throw new Error("خطا در دریافت تنظیمات ارزش افزوده");
      const data = await response.json();
      if (data) {
        setVatPercentage(data.vatPercentage);
        setIsEnabled(data.isEnabled);
      }
      return data;
    },
  });

  const updateVatMutation = useMutation({
    mutationFn: async (data: { vatPercentage: string; isEnabled: boolean }) => {
      const response = await createAuthenticatedRequest("/api/vat-settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("خطا در بروزرسانی تنظیمات ارزش افزوده");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vat-settings"] });
      toast({
        title: "موفقیت",
        description: "تنظیمات ارزش افزوده با موفقیت ذخیره شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ذخیره تنظیمات ارزش افزوده",
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

    updateVatMutation.mutate({
      vatPercentage: vatPercentage,
      isEnabled: isEnabled,
    });
  };

  return (
    <DashboardLayout title="تنظیمات ارزش افزوده">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">تنظیمات ارزش افزوده (VAT)</h2>
          <p className="text-muted-foreground">درصد ارزش افزوده را برای فاکتورها و گزارشات خود تنظیم کنید</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تنظیمات ارزش افزوده</CardTitle>
            <CardDescription>
              با فعال کردن این گزینه، ارزش افزوده به همه فاکتورها و گزارشات شما اضافه خواهد شد
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="vat-enabled" className="text-base font-semibold">
                      فعال/غیرفعال کردن ارزش افزوده
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isEnabled ? "ارزش افزوده فعال است و به فاکتورها اضافه می‌شود" : "ارزش افزوده غیرفعال است"}
                    </p>
                  </div>
                  <Switch
                    id="vat-enabled"
                    checked={isEnabled}
                    onCheckedChange={setIsEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vat-percentage">درصد ارزش افزوده (%)</Label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Input
                      id="vat-percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={vatPercentage}
                      onChange={(e) => setVatPercentage(e.target.value)}
                      className="max-w-xs"
                      disabled={!isEnabled}
                    />
                    <span className="text-muted-foreground">٪</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    درصد پیش‌فرض ارزش افزوده در ایران ۹٪ است
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateVatMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {updateVatMutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              نحوه محاسبه ارزش افزوده
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <p>
              <strong>ارزش افزوده (VAT)</strong> بر اساس درصد تنظیم شده به مبلغ نهایی سفارشات اضافه می‌شود.
            </p>
            <div className="bg-white dark:bg-blue-900 p-4 rounded-lg space-y-2">
              <p><strong>مثال:</strong></p>
              <p>مبلغ کالاها: ۱,۰۰۰,۰۰۰ تومان</p>
              <p>ارزش افزوده ({vatPercentage}٪): {(parseFloat(vatPercentage || "0") * 10000).toLocaleString("fa-IR")} تومان</p>
              <p className="font-bold border-t pt-2">
                جمع کل: {(1000000 + parseFloat(vatPercentage || "0") * 10000).toLocaleString("fa-IR")} تومان
              </p>
            </div>
            <p className="text-xs">
              توجه: این مبلغ در تمام فاکتورها، گزارشات مالی و لیست سفارشات نمایش داده خواهد شد.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
