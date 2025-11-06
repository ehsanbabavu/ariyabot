import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Copy,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAuthenticatedRequest } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TronTransaction {
  txId: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  amountTRX: string;
  from: string;
  to: string;
  timestamp: number;
  date: string;
  status: 'SUCCESS' | 'FAILED';
  explorerUrl: string;
}

export default function CryptoTransactions() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["/api/tron/wallet"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/tron/wallet");
      if (!response.ok) throw new Error("خطا در دریافت آدرس ولت");
      return response.json();
    },
  });

  const { data: transactionsData, isLoading: transactionsLoading, refetch } = useQuery({
    queryKey: ["/api/tron/transactions"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/tron/transactions?limit=50");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    enabled: !!walletData?.walletAddress,
    refetchInterval: 60000,
  });

  const formatTomanPrice = (trxAmount: string, trxPrice: number) => {
    const amount = parseFloat(trxAmount.replace(/,/g, ''));
    const tomanValue = amount * trxPrice;
    return new Intl.NumberFormat('fa-IR').format(Math.round(tomanValue));
  };

  const saveWalletMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await createAuthenticatedRequest("/api/tron/wallet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tron/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tron/transactions"] });
      toast({
        title: "✅ موفق",
        description: "آدرس ولت با موفقیت ذخیره شد",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveWallet = () => {
    if (!walletAddress.trim()) {
      toast({
        title: "⚠️ خطا",
        description: "لطفاً آدرس ولت را وارد کنید",
        variant: "destructive",
      });
      return;
    }
    saveWalletMutation.mutate(walletAddress);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "کپی شد",
      description: "آدرس در کلیپبورد کپی شد",
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "در حال بروزرسانی",
      description: "تراکنش‌ها در حال بروزرسانی هستند...",
    });
  };

  useState(() => {
    if (walletData?.walletAddress) {
      setWalletAddress(walletData.walletAddress);
    }
  });

  if (walletLoading) {
    return (
      <DashboardLayout title="تراکنش ارز دیجیتال">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const transactions: TronTransaction[] = transactionsData?.transactions || [];
  const hasWallet = walletData?.walletAddress;
  const trxPriceInToman = transactionsData?.trxPriceInToman || 0;

  return (
    <DashboardLayout title="تراکنش ارز دیجیتال">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              آدرس ولت TRON
            </CardTitle>
            <CardDescription>
              آدرس ولت ترون خود را برای مشاهده تراکنش‌ها وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasWallet || isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet">آدرس ولت ترون</Label>
                  <div className="flex gap-2">
                    <Input
                      id="wallet"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="مثال: TLCuBEirVzB6V4menLZKw1jfBTFMZbuKq"
                      className="font-mono"
                    />
                    <Button
                      onClick={handleSaveWallet}
                      disabled={saveWalletMutation.isPending}
                    >
                      {saveWalletMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
                    </Button>
                    {hasWallet && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setWalletAddress(walletData.walletAddress);
                          setIsEditing(false);
                        }}
                      >
                        انصراف
                      </Button>
                    )}
                  </div>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    آدرس ولت باید با حرف T شروع شده و ۳۴ کاراکتر داشته باشد.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1 font-mono text-sm break-all">
                    {walletData.walletAddress}
                  </div>
                  <div className="flex gap-2 mr-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(walletData.walletAddress)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      ویرایش
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {hasWallet && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>تراکنش‌های اخیر</CardTitle>
                  <CardDescription>
                    لیست تراکنش‌های ورودی و خروجی ولت شما
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={transactionsLoading}
                >
                  <RefreshCw className={`w-4 h-4 ml-2 ${transactionsLoading ? 'animate-spin' : ''}`} />
                  بروزرسانی
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : transactions.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    هیچ تراکنشی برای این ولت یافت نشد.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>نوع</TableHead>
                        <TableHead>مبلغ (TRX)</TableHead>
                        <TableHead>مبلغ (تومان)</TableHead>
                        <TableHead>تاریخ</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>جزئیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.txId}>
                          <TableCell>
                            {tx.type === 'incoming' ? (
                              <Badge className="bg-green-500">
                                <ArrowDownLeft className="w-3 h-3 ml-1" />
                                دریافتی
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500">
                                <ArrowUpRight className="w-3 h-3 ml-1" />
                                ارسالی
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-mono font-semibold">
                            {tx.amountTRX}
                          </TableCell>
                          <TableCell className="font-semibold text-blue-600">
                            {trxPriceInToman > 0 ? formatTomanPrice(tx.amountTRX, trxPriceInToman) : '---'} تومان
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground" dir="ltr">
                            {tx.date}
                          </TableCell>
                          <TableCell>
                            {tx.status === 'SUCCESS' ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle2 className="w-3 h-3 ml-1" />
                                موفق
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                <AlertCircle className="w-3 h-3 ml-1" />
                                ناموفق
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(tx.explorerUrl, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
