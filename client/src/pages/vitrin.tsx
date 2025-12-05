import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  ShoppingBag, 
  ShoppingCart,
  Home,
  Send, 
  Sparkles, 
  User, 
  Package,
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

import productImg1 from "@assets/stock_images/product_package_box__aff87e0a.jpg";
import productImg2 from "@assets/stock_images/product_package_box__3e574040.jpg";
import productImg3 from "@assets/stock_images/product_package_box__01733114.jpg";
import productImg4 from "@assets/stock_images/product_package_box__95a8ec97.jpg";
import productImg5 from "@assets/stock_images/product_package_box__cde3f106.jpg";
import productImg6 from "@assets/stock_images/product_package_box__6fb8a26d.jpg";

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

interface Message {
  role: "user" | "assistant";
  content: string;
}

function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString('fa-IR');
}

function VitrinChatMessage({ role, content, isTyping }: { role: "user" | "assistant"; content: string; isTyping?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex gap-4 p-6 w-full max-w-4xl mx-auto rounded-2xl transition-colors pt-[12px] pb-[12px]",
        role === "assistant" 
          ? "dark:bg-secondary/10 bg-[#8888f74d] flex-row-reverse" 
          : "bg-white/50 border border-border/50"
      )}
    >
      <div className="shrink-0 mt-1">
        <Avatar className={cn(
          "w-10 h-10 border border-border/50 shadow-sm",
          role === "assistant" ? "bg-primary/10" : "bg-muted"
        )}>
          {role === "assistant" ? (
            <div className="w-full h-full flex items-center justify-center text-[#6c5ce0]">
              <Sparkles className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <User className="w-5 h-5" />
            </div>
          )}
        </Avatar>
      </div>
      <div className="flex-1 space-y-2 text-right">
        <div className="flex items-center justify-end">
          <span className="font-bold text-[#040f87cc] text-[12px]">
            {role === "assistant" ? "هوش مصنوعی" : "شما"}
          </span>
        </div>
        
        <div className="text-foreground/90 whitespace-pre-wrap text-[12px]">
          {isTyping ? (
            <span className="flex gap-1 items-center h-6">
              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
            </span>
          ) : (
            content
          )}
        </div>
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
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <div className={cn(
        "relative flex items-end gap-2 p-3 rounded-3xl border transition-all duration-300",
        "bg-background/60 backdrop-blur-xl shadow-2xl",
        "border-primary/20 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10"
      )}>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="پیامی بنویسید..."
          className="min-h-[60px] max-h-[200px] w-full resize-none border-0 bg-transparent py-4 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-base"
          rows={1}
        />

        <div className="pb-2 pr-2">
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full transition-all duration-300",
              "bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 hover:scale-105",
              (isLoading || !input.trim()) && "opacity-50 cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface VitrinBottomNavProps {
  onShowcase?: () => void;
  onCart?: () => void;
  onProfile?: () => void;
  activeTab?: string;
  storeLogo?: string | null;
  storeName?: string;
}

function VitrinBottomNav({ onShowcase, onCart, onProfile, activeTab, storeLogo, storeName }: VitrinBottomNavProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 border-b border-border/40 bg-white backdrop-blur-xl flex items-center justify-between px-6 z-20">
      <button
        onClick={onCart}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors",
          activeTab === "cart" 
            ? "text-blue-600" 
            : "text-muted-foreground hover:text-primary"
        )}
      >
        <ShoppingCart className="w-6 h-6" />
        <span className={cn("font-normal text-[15px]", activeTab === "cart" ? "text-blue-600" : "text-[#000000]")}>سبد خرید</span>
      </button>
      
      <button
        onClick={onProfile}
        className={cn(
          "rounded-full h-24 w-24 overflow-hidden border-4 border-white hover:border-white/90",
          "transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20",
          "absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
      >
        <Avatar className="h-full w-full border-0">
          {storeLogo ? (
            <AvatarImage src={storeLogo} alt={storeName || "فروشگاه"} />
          ) : null}
          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
            {storeName?.charAt(0) || "F"}
          </AvatarFallback>
        </Avatar>
      </button>
      
      <button
        onClick={onShowcase}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors",
          activeTab === "showcase" 
            ? "text-blue-600" 
            : "text-muted-foreground hover:text-primary"
        )}
      >
        <Home className="w-6 h-6" />
        <span className={cn("text-[15px] font-normal", activeTab === "showcase" ? "text-blue-600" : "text-[#000000]")}>ویترین</span>
      </button>
    </nav>
  );
}

export default function VitrinPage() {
  const [, params] = useRoute("/vitrin/:username");
  const username = params?.username;
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "سلام! من دستیار هوشمند این فروشگاه هستم. چطور می‌توانم امروز به شما کمک کنم؟",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(`/api/vitrin/${username}/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("خطا در ارسال پیام");
      return res.json();
    },
  });

  const handleSend = async (content: string) => {
    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync(content);
      const aiMsg: Message = {
        role: "assistant",
        content: response.response || response.fallbackResponse || "متشکرم از پیام شما! به زودی پاسخ خواهم داد.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        role: "assistant",
        content: "متأسفانه در پردازش پیام شما مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  if (!isMobile) {
    return (
      <div className="flex h-screen w-full bg-background items-center justify-center" dir="rtl">
        <div className="text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-3">
            لطفا فقط در حالت موبایل وارد صفحه شوید
          </h1>
          <p className="text-muted-foreground text-sm">
            این برنامه برای استفاده در گوشی موبایل طراحی شده است
          </p>
        </div>
      </div>
    );
  }

  const fallbackProducts = [
    { id: "1", name: "محصول 1", priceBeforeDiscount: "250000", priceAfterDiscount: "180000", description: "این محصول با کیفیت عالی و قیمت مناسب برای شما فراهم شده است.", image: productImg1, quantity: 10 },
    { id: "2", name: "محصول 2", priceBeforeDiscount: "320000", priceAfterDiscount: "220000", description: "یکی از بهترین انتخاب ها در این دسته بندی است.", image: productImg2, quantity: 5 },
    { id: "3", name: "محصول 3", priceBeforeDiscount: "180000", priceAfterDiscount: "135000", description: "محصول اقتصادی و با کارایی بالا برای افراد کم بودجه.", image: productImg3, quantity: 15 },
    { id: "4", name: "محصول 4", priceBeforeDiscount: "420000", priceAfterDiscount: "280000", description: "محصول پریمیوم با تکنولوژی روز دنیا و طراحی شیک.", image: productImg4, quantity: 8 },
    { id: "5", name: "محصول 5", priceBeforeDiscount: "150000", priceAfterDiscount: "99000", description: "گزینه برتر برای خریداران اقتصادی.", image: productImg5, quantity: 20 },
    { id: "6", name: "محصول 6", priceBeforeDiscount: "380000", priceAfterDiscount: "250000", description: "محصول جدید با ویژگی های بهبود یافته.", image: productImg6, quantity: 3 },
  ];

  const displayProducts = products && products.length > 0 ? products : fallbackProducts;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans" dir="rtl">
      <div className="flex-1 flex flex-col h-full relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=inactive]:hidden h-full">
            <div className="flex-1 overflow-y-auto scroll-smooth pt-30 bg-[#fafafa]">
              <div className="max-w-4xl mx-auto p-4 space-y-6 min-h-full pb-32">
                {messages.map((msg, i) => (
                  <VitrinChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
                {isLoading && (
                  <VitrinChatMessage role="assistant" content="" isTyping={true} />
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pt-10 z-10">
              <VitrinChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
          </TabsContent>

          <TabsContent value="showcase" className="flex-1 overflow-y-auto scroll-smooth px-6 pb-6 pt-24 mt-0 data-[state=inactive]:hidden h-full">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 gap-6 pb-20">
                {displayProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-border/50 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col h-full">
                    <div className="w-full aspect-video relative overflow-hidden group">
                      <img 
                        src={product.image || productImg1} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                      <h3 className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 sm:text-base text-white font-semibold text-right line-clamp-2 text-[12px] pt-[6px] pb-[6px]">{product.name}</h3>
                      {product.quantity === 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="destructive">ناموجود</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-1 text-right">
                      <p className="text-xs sm:text-sm line-clamp-4 flex-1 text-right font-thin text-[#0a0000] bg-[#ffffff] mt-[2px] mb-[2px]">
                        {product.description || "محصول با کیفیت عالی"}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <Button size="sm" className="h-8 sm:h-9 w-8 sm:w-9 p-0 rounded-lg font-semibold bg-[#6572e5e6] text-[#ffffff] hover:bg-[#6572e5e6]/90 flex items-center justify-center">
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                        <div className="flex flex-col flex-1">
                          {product.priceAfterDiscount && product.priceAfterDiscount !== product.priceBeforeDiscount ? (
                            <>
                              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.priceBeforeDiscount)}</span>
                              <span className="text-sm font-bold text-black text-left">{formatPrice(product.priceAfterDiscount)}</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-black text-left">{formatPrice(product.priceBeforeDiscount)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cart" className="flex-1 overflow-auto px-6 pb-6 pt-24 mt-0 data-[state=inactive]:hidden h-full">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-border pt-[0px] pb-[0px] mt-[40px] mb-[40px]">
                <p className="text-muted-foreground text-center py-12">سبد خرید شما خالی است</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <VitrinBottomNav 
        onShowcase={() => setActiveTab("showcase")} 
        onCart={() => setActiveTab("cart")} 
        onProfile={() => setActiveTab("chat")} 
        activeTab={activeTab}
        storeLogo={vitrinInfo.storeLogo}
        storeName={vitrinInfo.storeName}
      />
    </div>
  );
}
