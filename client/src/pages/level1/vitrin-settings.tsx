import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, 
  Copy, 
  Check, 
  ExternalLink, 
  Upload, 
  Loader2,
  Link as LinkIcon,
  Image as ImageIcon,
  FileText,
  Eye
} from "lucide-react";

interface VitrinSettings {
  username: string;
  storeName: string;
  storeDescription: string;
  storeLogo: string | null;
  vitrinUrl: string;
}

export default function VitrinSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");

  const { data: settings, isLoading } = useQuery<VitrinSettings>({
    queryKey: ["/api/seller/vitrin"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/seller/vitrin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("خطا در دریافت تنظیمات");
      const data = await res.json();
      setStoreName(data.storeName);
      setStoreDescription(data.storeDescription);
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { storeName: string; storeDescription: string }) => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/seller/vitrin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("خطا در ذخیره تنظیمات");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/vitrin"] });
      toast({
        title: "ذخیره شد",
        description: "تنظیمات ویترین با موفقیت ذخیره شد",
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

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("logo", file);
      
      const res = await fetch("/api/seller/vitrin/logo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("خطا در آپلود لوگو");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/vitrin"] });
      toast({
        title: "آپلود شد",
        description: "لوگوی فروشگاه با موفقیت آپلود شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در آپلود لوگو",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = async () => {
    if (settings?.vitrinUrl) {
      const fullUrl = `${window.location.origin}${settings.vitrinUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({
        title: "کپی شد",
        description: "آدرس ویترین کپی شد",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "خطا",
          description: "حجم فایل نباید بیشتر از 5 مگابایت باشد",
          variant: "destructive",
        });
        return;
      }
      uploadLogoMutation.mutate(file);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({ storeName, storeDescription });
  };

  const fullVitrinUrl = settings?.vitrinUrl ? `${window.location.origin}${settings.vitrinUrl}` : "";

  if (isLoading) {
    return (
      <DashboardLayout title="ویترین فروشگاه">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="ویترین فروشگاه">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">ویترین فروشگاه</h1>
          <p className="text-muted-foreground mt-1">
            صفحه شخصی فروشگاه شما که مشتریان می‌توانند محصولات را مشاهده کنند
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              آدرس ویترین
            </CardTitle>
            <CardDescription>
              این آدرس را با مشتریان خود به اشتراک بگذارید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  value={fullVitrinUrl}
                  readOnly
                  className="pl-24 font-mono text-sm bg-muted/50"
                  dir="ltr"
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => window.open(settings?.vitrinUrl, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="gap-1">
                <Store className="w-3 h-3" />
                فعال
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Eye className="w-3 h-3" />
                قابل مشاهده برای همه
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                لوگوی فروشگاه
              </CardTitle>
              <CardDescription>
                لوگوی فروشگاه در صفحه ویترین نمایش داده می‌شود
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-primary/20">
                  {settings?.storeLogo ? (
                    <AvatarImage src={settings.storeLogo} />
                  ) : (
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {storeName?.charAt(0) || "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLogoMutation.isPending}
                  >
                    {uploadLogoMutation.isPending ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 ml-2" />
                    )}
                    آپلود لوگو
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    حداکثر 5 مگابایت - JPG, PNG
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                اطلاعات فروشگاه
              </CardTitle>
              <CardDescription>
                نام و توضیحات فروشگاه را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">نام فروشگاه</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="مثال: فروشگاه موبایل احسان"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeDescription">توضیحات</Label>
                <Textarea
                  id="storeDescription"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="توضیحات کوتاه درباره فروشگاه شما..."
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleSave} 
                disabled={updateMutation.isPending}
                className="w-full"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : null}
                ذخیره تغییرات
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">نکات مهم</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>آدرس ویترین شما همیشه فعال است و مشتریان می‌توانند محصولات را ببینند</li>
                  <li>فقط محصولات فعال در ویترین نمایش داده می‌شوند</li>
                  <li>مشتریان می‌توانند از طریق چت با شما ارتباط برقرار کنند</li>
                  <li>پیام‌های دریافتی در بخش "چت مهمانان" قابل مشاهده است</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
