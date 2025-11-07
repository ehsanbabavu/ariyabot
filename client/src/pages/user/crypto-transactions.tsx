import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface CryptoTransaction {
  txId: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  amountTRX?: string;
  amountXRP?: string;
  amountADA?: string;
  amountUSD?: string;
  amountIRR?: string;
  from: string;
  to: string;
  timestamp: number;
  date: string;
  status: 'SUCCESS' | 'FAILED';
  explorerUrl: string;
  tokenName?: string;
  tokenSymbol?: string;
}

export default function CryptoTransactions() {
  const [walletAddress, setWalletAddress] = useState("");
  const [usdtWalletAddress, setUsdtWalletAddress] = useState("");
  const [rippleWalletAddress, setRippleWalletAddress] = useState("");
  const [cardanoWalletAddress, setCardanoWalletAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tronPage, setTronPage] = useState(1);
  const [usdtPage, setUsdtPage] = useState(1);
  const [rippleMarker, setRippleMarker] = useState<string | undefined>(undefined);
  const [cardanoPage, setCardanoPage] = useState(1);
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

  const { data: tronData, isLoading: tronLoading, error: tronError, refetch: refetchTron } = useQuery({
    queryKey: ["/api/tron/transactions", tronPage],
    queryFn: async () => {
      const offset = (tronPage - 1) * 20;
      const response = await createAuthenticatedRequest(`/api/tron/transactions?limit=20&offset=${offset}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    enabled: !!walletData?.walletAddress,
    refetchInterval: 60000,
  });

  const { data: usdtData, isLoading: usdtLoading, error: usdtError, refetch: refetchUsdt } = useQuery({
    queryKey: ["/api/tron/transactions/trc20", usdtPage],
    queryFn: async () => {
      const offset = (usdtPage - 1) * 20;
      const response = await createAuthenticatedRequest(`/api/tron/transactions/trc20?limit=20&offset=${offset}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    enabled: !!walletData?.usdtWalletAddress,
    refetchInterval: 60000,
  });

  const { data: rippleData, isLoading: rippleLoading, error: rippleError, refetch: refetchRipple } = useQuery({
    queryKey: ["/api/ripple/transactions", rippleMarker],
    queryFn: async () => {
      let url = `/api/ripple/transactions?limit=50`;
      if (rippleMarker) {
        url += `&marker=${encodeURIComponent(rippleMarker)}`;
      }
      const response = await createAuthenticatedRequest(url);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    enabled: !!walletData?.rippleWalletAddress,
    refetchInterval: 60000,
  });

  const { data: cardanoData, isLoading: cardanoLoading, error: cardanoError, refetch: refetchCardano } = useQuery({
    queryKey: ["/api/cardano/transactions", cardanoPage],
    queryFn: async () => {
      const response = await createAuthenticatedRequest(`/api/cardano/transactions?limit=20&page=${cardanoPage}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    enabled: !!walletData?.cardanoWalletAddress,
    refetchInterval: 60000,
  });

  const saveWalletMutation = useMutation({
    mutationFn: async (addresses: { 
      walletAddress: string, 
      usdtWalletAddress: string, 
      rippleWalletAddress: string, 
      cardanoWalletAddress: string 
    }) => {
      const response = await createAuthenticatedRequest("/api/tron/wallet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addresses),
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
      queryClient.invalidateQueries({ queryKey: ["/api/tron/transactions/trc20"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ripple/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cardano/transactions"] });
      toast({
        title: "✅ موفق",
        description: "آدرس‌های ولت با موفقیت ذخیره شدند",
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
    if (!walletAddress.trim() && !usdtWalletAddress.trim() && !rippleWalletAddress.trim() && !cardanoWalletAddress.trim()) {
      toast({
        title: "⚠️ خطا",
        description: "لطفاً حداقل یک آدرس ولت را وارد کنید",
        variant: "destructive",
      });
      return;
    }
    saveWalletMutation.mutate({
      walletAddress,
      usdtWalletAddress,
      rippleWalletAddress,
      cardanoWalletAddress
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "کپی شد",
      description: "آدرس در کلیپبورد کپی شد",
    });
  };

  useEffect(() => {
    if (walletData) {
      setWalletAddress(walletData.walletAddress || "");
      setUsdtWalletAddress(walletData.usdtWalletAddress || "");
      setRippleWalletAddress(walletData.rippleWalletAddress || "");
      setCardanoWalletAddress(walletData.cardanoWalletAddress || "");
    }
  }, [walletData]);

  if (walletLoading) {
    return (
      <DashboardLayout title="تراکنش ارز دیجیتال">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const hasWallet = walletData?.walletAddress || walletData?.usdtWalletAddress || 
                    walletData?.rippleWalletAddress || walletData?.cardanoWalletAddress;

  const TransactionTable = ({ 
    transactions, 
    isLoading, 
    error,
    onRefresh, 
    currencySymbol,
    amountKey,
    showPriceColumns = false,
    centerAlign = false,
    page,
    onPageChange 
  }: { 
    transactions: CryptoTransaction[], 
    isLoading: boolean,
    error: Error | null,
    onRefresh: () => void,
    currencySymbol: string,
    amountKey: 'amountTRX' | 'amountXRP' | 'amountADA' | 'tokenSymbol',
    showPriceColumns?: boolean,
    centerAlign?: boolean,
    page: number,
    onPageChange: (newPage: number) => void
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>تراکنش‌های اخیر</CardTitle>
            <CardDescription>
              لیست تراکنش‌های ورودی و خروجی ولت {currencySymbol}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
            بروزرسانی
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
            </AlertDescription>
          </Alert>
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
                  <TableHead className={centerAlign ? "text-center" : "text-right"}>جزئیات</TableHead>
                  <TableHead className={centerAlign ? "text-center" : "text-right"}>وضعیت</TableHead>
                  <TableHead className={centerAlign ? "text-center" : "text-right"}>تاریخ</TableHead>
                  {showPriceColumns && (
                    <TableHead className={centerAlign ? "text-center" : "text-right"}>قیمت (تومان)</TableHead>
                  )}
                  <TableHead className={centerAlign ? "text-center" : "text-right"}>مبلغ ({currencySymbol})</TableHead>
                  <TableHead className={centerAlign ? "text-center" : "text-right"}>نوع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.txId}>
                    <TableCell className={centerAlign ? "text-center" : "text-right"}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(tx.explorerUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell className={centerAlign ? "text-center" : "text-right"}>
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
                    <TableCell className={centerAlign ? "text-center text-sm text-muted-foreground" : "text-sm text-muted-foreground text-right"} dir="ltr">
                      {tx.date}
                    </TableCell>
                    {showPriceColumns && (
                      <TableCell className={centerAlign ? "font-mono text-center text-green-600" : "font-mono text-right text-green-600"} dir="rtl">
                        {tx.amountIRR || '0'} ﷼
                      </TableCell>
                    )}
                    <TableCell className={centerAlign ? "font-mono font-semibold text-center" : "font-mono font-semibold text-right"}>
                      {amountKey === 'tokenSymbol' 
                        ? `${(tx.amount / 1000000).toLocaleString('en-US')} ${tx.tokenSymbol || 'USDT'}`
                        : tx[amountKey]}
                    </TableCell>
                    <TableCell className={centerAlign ? "text-center" : "text-right"}>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {transactions.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              صفحه {page} - {transactions.length} تراکنش
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1 || isLoading}
              >
                قبلی
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={transactions.length < 20 || isLoading}
              >
                بعدی
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="تراکنش ارز دیجیتال">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              آدرس‌های ولت ارز دیجیتال
            </CardTitle>
            <CardDescription>
              آدرس ولت‌های خود را برای مشاهده تراکنش‌ها و دریافت ارز وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasWallet || isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet">آدرس ولت ترون (TRX)</Label>
                  <Input
                    id="wallet"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="مثال: TLCuBEirVzB6V4menLZKw1jfBTFMZbuKq"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usdt-wallet">آدرس ولت تتر بر بستر TRC20</Label>
                  <Input
                    id="usdt-wallet"
                    value={usdtWalletAddress}
                    onChange={(e) => setUsdtWalletAddress(e.target.value)}
                    placeholder="مثال: TLCuBEirVzB6V4menLZKw1jfBTFMZbuKq"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ripple-wallet">آدرس ولت ریپل (XRP)</Label>
                  <Input
                    id="ripple-wallet"
                    value={rippleWalletAddress}
                    onChange={(e) => setRippleWalletAddress(e.target.value)}
                    placeholder="مثال: rN7n7otQDd6FczFgLdlqtyMVrn3Q7YrfH"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardano-wallet">آدرس ولت کاردانو (ADA)</Label>
                  <Input
                    id="cardano-wallet"
                    value={cardanoWalletAddress}
                    onChange={(e) => setCardanoWalletAddress(e.target.value)}
                    placeholder="مثال: addr1qxy..."
                    className="font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveWallet}
                    disabled={saveWalletMutation.isPending}
                    className="flex-1"
                  >
                    {saveWalletMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
                  </Button>
                  {hasWallet && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setWalletAddress(walletData.walletAddress || "");
                        setUsdtWalletAddress(walletData.usdtWalletAddress || "");
                        setRippleWalletAddress(walletData.rippleWalletAddress || "");
                        setCardanoWalletAddress(walletData.cardanoWalletAddress || "");
                        setIsEditing(false);
                      }}
                    >
                      انصراف
                    </Button>
                  )}
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    حداقل یک آدرس ولت را وارد کنید. آدرس‌های ولت را با دقت وارد نمایید.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-3">
                {walletData.walletAddress && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">آدرس ولت ترون (TRX)</Label>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1 font-mono text-sm break-all">
                        {walletData.walletAddress}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(walletData.walletAddress)}
                        className="mr-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {walletData.usdtWalletAddress && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">آدرس ولت تتر بر بستر TRC20</Label>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1 font-mono text-sm break-all">
                        {walletData.usdtWalletAddress}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(walletData.usdtWalletAddress)}
                        className="mr-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {walletData.rippleWalletAddress && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">آدرس ولت ریپل (XRP)</Label>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1 font-mono text-sm break-all">
                        {walletData.rippleWalletAddress}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(walletData.rippleWalletAddress)}
                        className="mr-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {walletData.cardanoWalletAddress && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">آدرس ولت کاردانو (ADA)</Label>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1 font-mono text-sm break-all">
                        {walletData.cardanoWalletAddress}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(walletData.cardanoWalletAddress)}
                        className="mr-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  ویرایش آدرس‌ها
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {hasWallet && (
          <Tabs defaultValue="tron" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tron" disabled={!walletData?.walletAddress}>
                ترون (TRX)
              </TabsTrigger>
              <TabsTrigger value="usdt" disabled={!walletData?.usdtWalletAddress}>
                تتر (USDT)
              </TabsTrigger>
              <TabsTrigger value="ripple" disabled={!walletData?.rippleWalletAddress}>
                ریپل (XRP)
              </TabsTrigger>
              <TabsTrigger value="cardano" disabled={!walletData?.cardanoWalletAddress}>
                کاردانو (ADA)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tron" className="mt-6">
              <TransactionTable
                transactions={tronData?.transactions || []}
                isLoading={tronLoading}
                error={tronError}
                onRefresh={refetchTron}
                currencySymbol="TRX"
                amountKey="amountTRX"
                page={tronPage}
                onPageChange={setTronPage}
              />
            </TabsContent>

            <TabsContent value="usdt" className="mt-6">
              <TransactionTable
                transactions={usdtData?.transactions || []}
                isLoading={usdtLoading}
                error={usdtError}
                onRefresh={refetchUsdt}
                currencySymbol="USDT"
                amountKey="tokenSymbol"
                page={usdtPage}
                onPageChange={setUsdtPage}
              />
            </TabsContent>

            <TabsContent value="ripple" className="mt-6">
              <div className="space-y-4">
                <TransactionTable
                  transactions={rippleData?.transactions || []}
                  isLoading={rippleLoading}
                  error={rippleError}
                  onRefresh={refetchRipple}
                  currencySymbol="XRP"
                  amountKey="amountXRP"
                  page={1}
                  onPageChange={() => {}}
                />
                {rippleData?.marker && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setRippleMarker(undefined)}
                      disabled={!rippleMarker}
                    >
                      صفحه اول
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setRippleMarker(rippleData.marker)}
                    >
                      صفحه بعد
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="cardano" className="mt-6">
              <TransactionTable
                transactions={cardanoData?.transactions || []}
                isLoading={cardanoLoading}
                error={cardanoError}
                onRefresh={refetchCardano}
                currencySymbol="ADA"
                amountKey="amountADA"
                showPriceColumns={true}
                centerAlign={true}
                page={cardanoPage}
                onPageChange={setCardanoPage}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
