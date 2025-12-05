import { motion } from "framer-motion";
import { MessageSquare, Plus, Settings, LogOut, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function ChatSidebar({ isOpen, toggleSidebar }: ChatSidebarProps) {
  const history = [
    "ایده‌های بازاریابی برای استارتاپ",
    "کد نویسی یک کامپوننت ری‌اکت",
    "ترجمه متن به انگلیسی",
    "برنامه سفر به شیراز",
    "تحلیل داده‌های فروش",
  ];

  return (
    <motion.div
      initial={{ width: isOpen ? 280 : 0 }}
      animate={{ width: isOpen ? 280 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full border-l border-border/40 bg-sidebar/50 backdrop-blur-xl overflow-hidden flex flex-col shadow-xl z-20"
    >
      <div className="p-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="md:hidden hover:bg-white/10"
        >
          <PanelLeftClose className="w-5 h-5" />
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all"
        >
          <Plus className="w-4 h-4 text-primary" />
          <span>چت جدید</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 mb-2">امروز</div>
          {history.map((item, i) => (
            <Button
              key={i}
              variant="ghost"
              className="w-full justify-start gap-3 text-sm font-normal h-10 px-3 hover:bg-white/5 transition-all duration-200 rounded-xl overflow-hidden"
            >
              <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate">{item}</span>
            </Button>
          ))}
          
          <div className="text-xs font-medium text-muted-foreground px-2 mt-6 mb-2">هفته گذشته</div>
          {history.slice(0, 3).map((item, i) => (
            <Button
              key={`old-${i}`}
              variant="ghost"
              className="w-full justify-start gap-3 text-sm font-normal h-10 px-3 hover:bg-white/5 transition-all duration-200 rounded-xl overflow-hidden opacity-70 hover:opacity-100"
            >
              <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate">{item}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/40 space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-white/5 rounded-xl">
          <Settings className="w-4 h-4" />
          <span>تنظیمات</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-white/5 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4" />
          <span>خروج</span>
        </Button>
      </div>
    </motion.div>
  );
}
