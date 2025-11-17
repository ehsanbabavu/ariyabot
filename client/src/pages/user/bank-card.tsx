import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAuthenticatedRequest } from "@/lib/auth";

interface User {
  bankCardNumber?: string;
  bankCardHolderName?: string;
}

export default function BankCardPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  useEffect(() => {
    if (user) {
      setCardNumber(user.bankCardNumber || "");
      setHolderName(user.bankCardHolderName || "");
    }
  }, [user]);

  const updateBankCard = useMutation({
    mutationFn: async (data: { bankCardNumber: string; bankCardHolderName: string }) => {
      const response = await createAuthenticatedRequest("/api/users/bank-card", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "موفق",
        description: "اطلاعات کارت بانکی با موفقیت ذخیره شد",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "خطا در ذخیره اطلاعات کارت بانکی",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanCardNumber.length !== 16) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "شماره کارت باید 16 رقم باشد",
      });
      return;
    }

    if (!holderName.trim()) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "نام صاحب کارت الزامی است",
      });
      return;
    }

    updateBankCard.mutate({
      bankCardNumber: cleanCardNumber,
      bankCardHolderName: holderName.trim(),
    });
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (/^\d*$/.test(value) && value.length <= 16) {
      setCardNumber(formatCardNumber(value));
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="کارت بانکی">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="کارت بانکی">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>اطلاعات کارت بانکی</CardTitle>
                <CardDescription>
                  شماره کارت بانکی خود را برای دریافت پرداخت از مشتریان ثبت کنید
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">شماره کارت</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="text-left ltr"
                  dir="ltr"
                  maxLength={19}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holderName">نام و نام خانوادگی صاحب کارت</Label>
                <Input
                  id="holderName"
                  type="text"
                  placeholder="علی احمدی"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={updateBankCard.isPending}
              >
                {updateBankCard.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>در حال ذخیره...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>ذخیره اطلاعات</span>
                  </div>
                )}
              </Button>
            </form>

            {user?.bankCardNumber && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✓ اطلاعات کارت بانکی شما ثبت شده است
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
