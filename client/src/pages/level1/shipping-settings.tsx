import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck, Package, Gift } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ShippingSettings } from "@shared/schema";

export default function ShippingSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [postPishtazEnabled, setPostPishtazEnabled] = useState(false);
  const [postNormalEnabled, setPostNormalEnabled] = useState(false);
  const [piykEnabled, setPiykEnabled] = useState(false);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingMinAmount, setFreeShippingMinAmount] = useState("");

  const { data: settings, isLoading } = useQuery<ShippingSettings>({
    queryKey: ["/api/shipping-settings"],
    enabled: !!user,
  });

  useEffect(() => {
    if (settings) {
      setPostPishtazEnabled(settings.postPishtazEnabled);
      setPostNormalEnabled(settings.postNormalEnabled);
      setPiykEnabled(settings.piykEnabled);
      setFreeShippingEnabled(settings.freeShippingEnabled);
      setFreeShippingMinAmount(settings.freeShippingMinAmount || "");
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<ShippingSettings>) => {
      const response = await apiRequest("PUT", "/api/shipping-settings", data);
      if (!response.ok) {
        throw new Error("خطا در بروزرسانی تنظیمات");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping-settings"] });
      toast({
        title: "موفقیت",
        description: "تنظیمات ترابری با موفقیت ذخیره شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ذخیره تنظیمات",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate({
      postPishtazEnabled,
      postNormalEnabled,
      piykEnabled,
      freeShippingEnabled,
      freeShippingMinAmount: freeShippingMinAmount ? freeShippingMinAmount : null,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">تنظیمات ترابری</h1>
          <p className="text-muted-foreground mt-2">
            روش‌های ارسال کالا را برای مشتریان خود تعیین کنید
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                ارسال با پست
              </CardTitle>
              <CardDescription>
                امکان ارسال کالا از طریق پست (پیشتاز یا معمولی)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>پست پیشتاز</Label>
                <RadioGroup
                  value={postPishtazEnabled ? "enabled" : "disabled"}
                  onValueChange={(value) => setPostPishtazEnabled(value === "enabled")}
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="enabled" id="pishtaz-enabled" />
                    <Label htmlFor="pishtaz-enabled">فعال</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="disabled" id="pishtaz-disabled" />
                    <Label htmlFor="pishtaz-disabled">غیرفعال</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>پست معمولی</Label>
                <RadioGroup
                  value={postNormalEnabled ? "enabled" : "disabled"}
                  onValueChange={(value) => setPostNormalEnabled(value === "enabled")}
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="enabled" id="normal-enabled" />
                    <Label htmlFor="normal-enabled">فعال</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="disabled" id="normal-disabled" />
                    <Label htmlFor="normal-disabled">غیرفعال</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                ارسال با پیک
              </CardTitle>
              <CardDescription>
                امکان ارسال کالا از طریق پیک
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={piykEnabled ? "enabled" : "disabled"}
                onValueChange={(value) => setPiykEnabled(value === "enabled")}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="enabled" id="piyk-enabled" />
                  <Label htmlFor="piyk-enabled">فعال</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="disabled" id="piyk-disabled" />
                  <Label htmlFor="piyk-disabled">غیرفعال</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                ارسال رایگان
              </CardTitle>
              <CardDescription>
                ارسال رایگان برای خریدهای بالای مبلغ مشخص
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={freeShippingEnabled ? "enabled" : "disabled"}
                onValueChange={(value) => setFreeShippingEnabled(value === "enabled")}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="enabled" id="free-enabled" />
                  <Label htmlFor="free-enabled">فعال</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="disabled" id="free-disabled" />
                  <Label htmlFor="free-disabled">غیرفعال</Label>
                </div>
              </RadioGroup>

              {freeShippingEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="min-amount">حداقل مبلغ خرید (تومان)</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="مثال: 500000"
                    value={freeShippingMinAmount}
                    onChange={(e) => setFreeShippingMinAmount(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
