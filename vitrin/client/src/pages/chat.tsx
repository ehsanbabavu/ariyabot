import { useState } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Smartphone, Plus } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

import productImg1 from "@assets/stock_images/product_package_box__aff87e0a.jpg";
import productImg2 from "@assets/stock_images/product_package_box__3e574040.jpg";
import productImg3 from "@assets/stock_images/product_package_box__01733114.jpg";
import productImg4 from "@assets/stock_images/product_package_box__95a8ec97.jpg";
import productImg5 from "@assets/stock_images/product_package_box__cde3f106.jpg";
import productImg6 from "@assets/stock_images/product_package_box__6fb8a26d.jpg";

// Simple theme toggler
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    setIsDark(!isDark);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "سلام! من دستیار هوشمند شما هستم. چطور می‌توانم امروز به شما کمک کنم؟",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  const handleSend = async (content: string) => {
    // Add user message
    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        role: "assistant",
        content: "این یک پاسخ نمونه است. در نسخه واقعی، این متن از طریق API تولید می‌شود. من می‌توانم به سوالات شما پاسخ دهم، کد بنویسم، یا در حل مسائل به شما کمک کنم.",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 2000);
  };

  const handleShowcase = () => {
    setActiveTab("showcase");
  };

  const handleCart = () => {
    setActiveTab("cart");
  };

  const handleProfile = () => {
    setActiveTab("chat");
  };

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

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=inactive]:hidden h-full">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth pt-30 bg-[#fafafa]">
              <div className="max-w-4xl mx-auto p-4 space-y-6 min-h-full pb-32">
                {messages.map((msg, i) => (
                  <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
                {isLoading && (
                  <ChatMessage role="assistant" content="" isTyping={true} />
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-background via-background/90 to-transparent pt-10 z-10">
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
          </TabsContent>

          <TabsContent value="showcase" className="flex-1 overflow-y-auto scroll-smooth px-6 pb-6 pt-24 mt-0 data-[state=inactive]:hidden h-full">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 gap-6 pb-20">
                {[
                  { id: 1, title: "محصول 1", price: 250000, discount: 180000, desc: "این محصول با کیفیت عالی و قیمت مناسب برای شما فراهم شده است. مشخصات کاملی دارد و برای استفاده روزمره بسیار مناسب می باشد.", image: productImg1 },
                  { id: 2, title: "محصول 2", price: 320000, discount: 220000, desc: "یکی از بهترین انتخاب ها در این دسته بندی است. تمامی استانداردهای کیفی را برآورده می کند و گارانتی معتبر دارد.", image: productImg2 },
                  { id: 3, title: "محصول 3", price: 180000, discount: 135000, desc: "محصول اقتصادی و با کارایی بالا برای افراد کم بودجه. ویژگی های منحصر به فردی دارد که آن را متمایز می کند.", image: productImg3 },
                  { id: 4, title: "محصول 4", price: 420000, discount: 280000, desc: "محصول پریمیوم با تکنولوژی روز دنیا و طراحی شیک. مناسب برای کسانی که کیفیت بهتری را ترجیح می دهند.", image: productImg4 },
                  { id: 5, title: "محصول 5", price: 150000, discount: 99000, desc: "گزینه برتر برای خریداران اقتصادی که به دنبال بهترین قیمت هستند. کیفیت مناسب با قیمت بسیار رقابتی.", image: productImg5 },
                  { id: 6, title: "محصول 6", price: 380000, discount: 250000, desc: "محصول جدید با ویژگی های بهبود یافته و طراحی مدرن. تمام بخش هایش با دقت ساخته شده و آماده استفاده.", image: productImg6 },
                ].map((product) => (
                  <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-border/50 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col h-full">
                    <div className="w-full aspect-video relative overflow-hidden group">
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                      <h3 className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 sm:text-base text-white font-semibold text-right line-clamp-2 text-[12px] pt-[6px] pb-[6px]">{product.title}</h3>
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-1 text-right">
                      <p className="text-xs sm:text-sm line-clamp-4 flex-1 text-right font-thin text-[#0a0000] bg-[#ffffff] mt-[2px] mb-[2px]">{product.desc}</p>
                      <div className="flex items-center justify-between gap-2">
                        <Button size="sm" className="h-8 sm:h-9 w-8 sm:w-9 p-0 rounded-lg font-semibold bg-[#6572e5e6] text-[#ffffff] hover:bg-[#6572e5e6]/90 flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></Button>
                        <div className="flex flex-col flex-1">
                          <span className="text-xs text-muted-foreground line-through">{product.price.toLocaleString('fa-IR')}</span>
                          <span className="text-sm font-bold text-black text-left">{product.discount.toLocaleString('fa-IR')}</span>
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
      {/* Bottom Navigation */}
      <BottomNav onShowcase={handleShowcase} onCart={handleCart} onProfile={handleProfile} activeTab={activeTab} />
    </div>
  );
}
