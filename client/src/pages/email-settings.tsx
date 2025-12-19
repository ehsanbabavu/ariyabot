import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Mail, Check, AlertCircle } from "lucide-react";
import { createAuthenticatedRequest } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface EmailSettings {
  emailAddress: string;
  isVerified: boolean;
}

export default function EmailSettings() {
  const { toast } = useToast();
  const [emailAddress, setEmailAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // دریافت تنظیمات ایمیل
  const { data: settings, isLoading, refetch } = useQuery<EmailSettings>({
    queryKey: ["/api/email-settings"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/email-settings");
      if (!response.ok) return { emailAddress: "", isVerified: false };
      return response.json();
    },
    onSuccess: (data) => {
      setEmailAddress(data.emailAddress || "");
    },
  });

  // ذخیره تنظیمات
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!emailAddress.trim()) {
        toast({ title: "خطا", description: "آدرس ایمیل نمی‌تواند خالی باشد", variant: "destructive" });
        return;
      }

      const response = await createAuthenticatedRequest("/api/email-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress: emailAddress.trim() }),
      });

      if (!response.ok) throw new Error("خطا در ذخیره");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "موفق", description: "آدرس ایمیل با موفقیت ذخیره شد" });
      refetch();
    },
    onError: () => {
      toast({ title: "خطا", description: "خطا در ذخیره آدرس ایمیل", variant: "destructive" });
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync();
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Mail className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">تنظیمات ایمیل</h1>
        </div>
        <p className="text-muted-foreground">آدرس ایمیل خود را برای دریافت ایمیل‌ها تنظیم کنید</p>
      </div>

      {/* Email Address Settings */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-base mb-3 block">
              آدرس ایمیل دریافت کننده
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              ایمیل‌های ارسال شده به این آدرس در صندوق دریافت شما نمایش خواهند یافت
            </p>
            <Input
              id="email"
              type="email"
              placeholder="example@domain.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="text-right"
              disabled={isSaving}
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            {settings?.isVerified ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">تأیید شده</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-600">در انتظار تأیید</span>
              </>
            )}
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving || emailAddress === settings?.emailAddress}
            className="w-full"
          >
            {isSaving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </Button>
        </div>
      </Card>

      {/* Information */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="space-y-2">
          <p className="font-semibold text-sm">ℹ️ معلومات مفید</p>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• ایمیل‌های دریافت شده در جدول "صندوق دریافت" ذخیره می‌شوند</li>
            <li>• سرور SMTP بر روی پورت 2525 درحال اجرا است</li>
            <li>• شما می‌توانید ایمیل‌های خود را مدیریت کنید و حذف کنید</li>
            <li>• برای ارسال ایمیل تست، از SMTP client استفاده کنید</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
