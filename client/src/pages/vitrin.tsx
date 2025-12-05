import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  ShoppingBag, 
  MessageCircle, 
  Send, 
  Sparkles, 
  User, 
  Package,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface VitrinInfo {
  id: string;
  username: string;
  storeName: string;
  storeDescription: string;
  storeLogo: string | null;
  firstName: string;
  lastName: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  priceBeforeDiscount: string;
  priceAfterDiscount: string | null;
  quantity: number;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: "guest" | "admin";
  createdAt: string;
}

function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString('fa-IR');
}

function VitrinChatMessage({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 p-4 rounded-2xl max-w-[85%]",
        isOwn 
          ? "bg-primary/10 mr-auto flex-row" 
          : "bg-white border border-border/50 ml-auto flex-row-reverse"
      )}
    >
      <div className="shrink-0">
        <Avatar className="w-8 h-8 border border-border/30">
          <AvatarFallback className={isOwn ? "bg-muted" : "bg-primary/10"}>
            {isOwn ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-primary" />}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <p className={cn(
          "text-sm text-foreground/90 whitespace-pre-wrap",
          isOwn ? "text-right" : "text-right"
        )}>
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}

function VitrinChatInput({ onSend, isLoading }: { onSend: (message: string) => void; isLoading: boolean }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="w-full relative">
      <div className={cn(
        "relative flex items-end gap-2 p-3 rounded-2xl border transition-all duration-300",
        "bg-background/80 backdrop-blur-lg shadow-lg",
        "border-primary/20 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10"
      )}>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="پیام خود را بنویسید..."
          className="min-h-[44px] max-h-[120px] w-full resize-none border-0 bg-transparent py-2 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-sm"
          rows={1}
        />
        <Button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()}
          size="icon"
          className={cn(
            "h-9 w-9 rounded-full transition-all duration-300",
            "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:scale-105",
            (isLoading || !input.trim()) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default function VitrinPage() {
  const [, params] = useRoute("/vitrin/:username");
  const username = params?.username;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("products");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let token = localStorage.getItem(`vitrin_chat_${username}`);
    // Token format: vitrin_${username}_${timestamp}_${random}
    const expectedPrefix = `vitrin_${username}_`;
    if (!token || !token.startsWith(expectedPrefix)) {
      token = `vitrin_${username}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem(`vitrin_chat_${username}`, token);
    }
    setSessionToken(token);
  }, [username]);

  const { data: vitrinInfo, isLoading: isLoadingVitrin, error: vitrinError } = useQuery<VitrinInfo>({
    queryKey: ["/api/vitrin", username],
    queryFn: async () => {
      const res = await fetch(`/api/vitrin/${username}`);
      if (!res.ok) {
        throw new Error("فروشگاه یافت نشد");
      }
      return res.json();
    },
    enabled: !!username,
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/vitrin", username, "products"],
    queryFn: async () => {
      const res = await fetch(`/api/vitrin/${username}/products`);
      if (!res.ok) throw new Error("خطا در دریافت محصولات");
      return res.json();
    },
    enabled: !!username,
  });

  const { data: chatData, isLoading: isLoadingChat } = useQuery<{ session: any; messages: ChatMessage[] }>({
    queryKey: ["/api/vitrin", username, "chat", sessionToken],
    queryFn: async () => {
      const res = await fetch(`/api/vitrin/${username}/chat/${sessionToken}`);
      if (!res.ok) {
        return { session: null, messages: [] };
      }
      return res.json();
    },
    enabled: !!username && !!sessionToken,
    refetchInterval: 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(`/api/vitrin/${username}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken,
          message,
        }),
      });
      if (!res.ok) throw new Error("خطا در ارسال پیام");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vitrin", username, "chat", sessionToken] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.messages]);

  if (isLoadingVitrin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (vitrinError || !vitrinInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20" dir="rtl">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl font-bold mb-2">فروشگاه یافت نشد</h1>
            <p className="text-muted-foreground mb-4">
              متأسفانه فروشگاهی با این آدرس یافت نشد.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowRight className="w-4 h-4 ml-2" />
              بازگشت
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const messages = chatData?.messages || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10" dir="rtl">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-primary/20 shadow-lg">
              {vitrinInfo.storeLogo ? (
                <img src={vitrinInfo.storeLogo} alt={vitrinInfo.storeName} className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {vitrinInfo.storeName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">{vitrinInfo.storeName}</h1>
              {vitrinInfo.storeDescription && (
                <p className="text-sm text-muted-foreground line-clamp-1">{vitrinInfo.storeDescription}</p>
              )}
            </div>
            <Badge variant="secondary" className="hidden sm:flex">
              <Store className="w-3 h-3 ml-1" />
              فروشگاه آنلاین
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              محصولات
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              چت با فروشنده
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-0">
            {isLoadingProducts ? (
              <div className="text-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">در حال بارگذاری محصولات...</p>
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <AnimatePresence>
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                        <div className="aspect-square relative overflow-hidden bg-muted">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                          )}
                          {product.quantity === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge variant="destructive">ناموجود</Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h3>
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              {product.priceAfterDiscount && product.priceAfterDiscount !== product.priceBeforeDiscount ? (
                                <>
                                  <p className="text-xs text-muted-foreground line-through">
                                    {formatPrice(product.priceBeforeDiscount)}
                                  </p>
                                  <p className="text-sm font-bold text-primary">
                                    {formatPrice(product.priceAfterDiscount)} تومان
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm font-bold">
                                  {formatPrice(product.priceBeforeDiscount)} تومان
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">هنوز محصولی ثبت نشده است</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            <Card className="overflow-hidden">
              <div className="h-[400px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                  {isLoadingChat ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">در حال بارگذاری پیام‌ها...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">اولین پیام خود را بفرستید!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <VitrinChatMessage 
                        key={msg.id} 
                        message={msg} 
                        isOwn={msg.sender === "guest"} 
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-border bg-background">
                  <VitrinChatInput 
                    onSend={(message) => sendMessageMutation.mutate(message)} 
                    isLoading={sendMessageMutation.isPending} 
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border/50 p-4 sm:hidden">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Button 
            variant={activeTab === "products" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setActiveTab("products")}
          >
            <Package className="w-4 h-4 ml-2" />
            محصولات
          </Button>
          <Button 
            variant={activeTab === "chat" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setActiveTab("chat")}
          >
            <MessageCircle className="w-4 h-4 ml-2" />
            چت
          </Button>
        </div>
      </div>
    </div>
  );
}
