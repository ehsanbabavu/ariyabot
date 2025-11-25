import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Users, ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback, ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ariyaBotImage from "@assets/generated_images/colorful_ai_ariya_bot_assistant_illustration.png";
import robotCharacterImage from "@assets/generated_images/robot_character.jpg";
import robotCharacterVideosImage from "@assets/generated_images/robot_character_videos.jpg";
import robotCharacterFaqImage from "@assets/generated_images/robot_character_faq.jpg";

function TypeWriter({ text, speed = 100 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {[
        {
          question: "اهداف این پیش فروش چیست؟",
          answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است."
        },
        {
          question: "توکن فروشی و پیش فروش چیست؟",
          answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است."
        },
        {
          question: "تاریخ شروع پیش فروش چیست؟",
          answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است."
        },
        {
          question: "چگونه ممکن است در پیش فروش شرکت کنم؟",
          answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است."
        }
      ].map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
          className="group relative"
        >
          <motion.button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`w-full text-right p-4 rounded-xl font-medium transition-all duration-300 ${
              openIndex === index
                ? 'bg-gradient-to-r from-purple-100/60 to-blue-100/60 border-2 border-purple-400 shadow-lg shadow-purple-500/20'
                : 'bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className={`text-base font-bold leading-tight transition-colors ${
                openIndex === index ? 'text-purple-900' : 'text-gray-900'
              }`}>
                {item.question}
              </h3>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                className="flex-shrink-0"
              >
                <ChevronDown className={`w-5 h-5 transition-colors ${
                  openIndex === index ? 'text-purple-600' : 'text-gray-400'
                }`} />
              </motion.div>
            </div>
          </motion.button>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: openIndex === index ? "auto" : 0,
              opacity: openIndex === index ? 1 : 0
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="p-4 pt-3 bg-gradient-to-br from-purple-50/80 via-blue-50/40 to-cyan-50/60 text-gray-700 leading-relaxed text-sm border-t border-purple-200/50 rounded-b-xl"
            >
              {item.answer}
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

function NewsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    direction: 'rtl' as const,
  });
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollLeft(emblaApi.canScrollPrev());
    setCanScrollRight(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-scroll every 5 seconds - pause on hover
  useEffect(() => {
    if (!emblaApi || isHovered) return;
    
    const autoScrollTimer = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(autoScrollTimer);
  }, [emblaApi, isHovered]);

  const baseNewsItems: Array<{title: string; date: string; description: string; gradient: string; svgElements: ReactNode[]}> = [
    {
      title: "ICO پیش فروش چیست.",
      date: "۱۰ بهمن ۱۴۰۲",
      description: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.",
      gradient: "from-cyan-400 to-blue-500",
      svgElements: [
        <rect key="1" x="40" y="40" width="60" height="50" rx="4" fill="#0369A1" opacity={0.8} />,
        <rect key="2" x="120" y="30" width="50" height="60" rx="4" fill="#0EA5E9" opacity={0.8} />,
        <rect key="3" x="200" y="50" width="55" height="45" rx="4" fill="#06B6D4" opacity={0.8} />,
        <rect key="4" x="50" y="120" width="40" height="50" rx="3" fill="#FFC107" opacity={0.7} />,
        <rect key="5" x="120" y="130" width="45" height="55" rx="3" fill="#FF9800" opacity={0.7} />,
        <rect key="6" x="200" y="120" width="40" height="50" rx="3" fill="#FF6B6B" opacity={0.7} />,
        <circle key="7" cx="280" cy="180" r="30" fill="none" stroke="#FFF" strokeWidth={3} opacity={0.6} />,
        <line key="8" x1="305" y1="205" x2="330" y2="230" stroke="#FFF" strokeWidth={3} opacity={0.6} />
      ]
    },
    {
      title: "نحوه دریافت بازدرآمد.",
      date: "۱۰ بهمن ۱۴۰۲",
      description: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.",
      gradient: "from-teal-300 to-cyan-400",
      svgElements: [
        <circle key="1" cx="80" cy="60" r="20" fill="#1E293B" opacity={0.8} />,
        <rect key="2" x="60" y="90" width="40" height="50" rx="5" fill="#1E293B" opacity={0.8} />,
        <circle key="3" cx="200" cy="100" r="25" fill="#0891B2" opacity={0.7} />,
        <circle key="4" cx="280" cy="120" r="20" fill="#06B6D4" opacity={0.7} />,
        <circle key="5" cx="240" cy="180" r="22" fill="#0EA5E9" opacity={0.7} />,
        <line key="6" x1="100" y1="100" x2="180" y2="100" stroke="#FFF" strokeWidth={2} opacity={0.5} />,
        <line key="7" x1="200" y1="130" x2="260" y2="150" stroke="#FFF" strokeWidth={2} opacity={0.5} />
      ]
    },
    {
      title: "چه زمانی فروش توکن شروع میشود.",
      date: "۱۰ بهمن ۱۴۰۲",
      description: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.",
      gradient: "from-amber-300 to-orange-400",
      svgElements: [
        <rect key="1" x="40" y="120" width="50" height="100" fill="#1F2937" opacity={0.8} />,
        <rect key="2" x="100" y="100" width="60" height="120" fill="#374151" opacity={0.8} />,
        <rect key="3" x="170" y="130" width="55" height="90" fill="#1F2937" opacity={0.8} />,
        <rect key="4" x="240" y="110" width="50" height="110" fill="#374151" opacity={0.8} />,
        <rect key="5" x="80" y="200" width="80" height="30" rx="5" fill="#EF4444" opacity={0.8} />,
        <circle key="6" cx="95" cy="230" r="8" fill="#1F2937" />,
        <circle key="7" cx="155" cy="230" r="8" fill="#1F2937" />,
        <rect key="8" x="0" y="220" width="400" height="20" fill="#E5E7EB" opacity={0.6} />
      ]
    },
    {
      title: "استراتژی بازاریابی پیش فروش.",
      date: "۱۵ بهمن ۱۴۰۲",
      description: "بررسی کامل استراتژی و روش های بازاریابی برای حداکثر رسانایی و نتایج مطلوب.",
      gradient: "from-rose-300 to-pink-400",
      svgElements: [
        <rect key="1" x="40" y="60" width="70" height="80" fill="#BE123C" opacity={0.8} />,
        <rect key="2" x="130" y="50" width="60" height="90" fill="#E11D48" opacity={0.7} />,
        <rect key="3" x="210" y="70" width="50" height="70" fill="#BE123C" opacity={0.8} />,
        <circle key="4" cx="70" cy="180" r="12" fill="#FCA5A5" />,
        <circle key="5" cx="150" cy="190" r="15" fill="#FCA5A5" />,
        <circle key="6" cx="230" cy="185" r="10" fill="#FCA5A5" />
      ]
    },
    {
      title: "نکات مهم برای سرمایه گذاران.",
      date: "۲۰ بهمن ۱۴۰۲",
      description: "راهنمای جامع برای سرمایه گذاران تازه کار و باتجربه در صحنه پیش فروش توکن.",
      gradient: "from-yellow-300 to-amber-400",
      svgElements: [
        <circle key="1" cx="80" cy="80" r="25" fill="#FBBF24" opacity={0.8} />,
        <circle key="2" cx="200" cy="100" r="30" fill="#F59E0B" opacity={0.7} />,
        <rect key="3" x="50" y="140" width="60" height="50" fill="#FBBF24" opacity={0.8} />,
        <rect key="4" x="130" y="150" width="70" height="40" fill="#F59E0B" opacity={0.7} />,
        <rect key="5" x="220" y="145" width="50" height="45" fill="#FBBF24" opacity={0.8} />
      ]
    },
    {
      title: "بهترین روش های حفظ سرمایه.",
      date: "۲۵ بهمن ۱۴۰۲",
      description: "نکات ایمنی و استراتژی های ثابت شده برای حفاظت از سرمایه شما در دوره پیش فروش.",
      gradient: "from-green-300 to-emerald-400",
      svgElements: [
        <rect key="1" x="40" y="80" width="50" height="80" fill="#059669" opacity={0.8} />,
        <rect key="2" x="110" y="70" width="60" height="90" fill="#10B981" opacity={0.7} />,
        <rect key="3" x="190" y="85" width="55" height="75" fill="#059669" opacity={0.8} />,
        <circle key="4" cx="70" cy="200" r="8" fill="#A7F3D0" />,
        <circle key="5" cx="145" cy="210" r="10" fill="#A7F3D0" />,
        <circle key="6" cx="220" cy="205" r="9" fill="#A7F3D0" />
      ]
    }
  ];

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!emblaApi) return;
    if (direction === 'left') {
      emblaApi.scrollNext();
    } else {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  return (
    <div 
      className="relative group w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-10 px-8">
          {baseNewsItems.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 min-w-64 w-64 group relative"
            >
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="w-full h-full bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
              >
              {/* Image Container */}
              <div className={`relative h-36 bg-gradient-to-br ${item.gradient} overflow-hidden`}>
                <svg viewBox="0 0 400 300" className="w-full h-full">
                  {item.svgElements}
                </svg>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.date}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight group-hover:text-purple-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 line-clamp-2">
                  {item.description}
                </p>
              </div>

                {/* Hover Border */}
                <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <motion.button
        onClick={() => scroll('left')}
        disabled={!canScrollRight}
        className="absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="carousel-button-left"
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>

      <motion.button
        onClick={() => scroll('right')}
        disabled={!canScrollLeft}
        className="absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="carousel-button-right"
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

function FloatingCounter() {
  const [count, setCount] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev >= 100) {
          return 20;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      animate={{ y: [0, 15, 0] }}
      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
      className="absolute -left-8 bottom-1/4 bg-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 z-20 hidden lg:block"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center relative">
         <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 border-t-transparent animate-spin opacity-60"></div>
         <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-sm">{count}</div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [hasUnreadBotMessage, setHasUnreadBotMessage] = useState(false);
  const [showInitialBubble, setShowInitialBubble] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'bot'}>>([
    { id: 1, text: 'سلام! چطور می‌تونم کمکتون کنم؟', sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clear unread notification and initial bubble when chat is opened
  useEffect(() => {
    if (isContactOpen) {
      setHasUnreadBotMessage(false);
      setShowInitialBubble(false);
    }
  }, [isContactOpen]);

  // Hide initial bubble when user sends a message
  const handleSendMessageWithBubbleHide = (callback: () => void) => {
    setShowInitialBubble(false);
    callback();
  };

  // Helper for smooth scroll or navigation
  const navItems = [
    { name: "خانه", href: "#home" },
    { name: "درباره", href: "#videos-section" },
    { name: "خدمات", href: "#services" },
    { name: "اشتراک ها", href: "#news" },
    { name: "اخرین اخبار", href: "#pricing" },
    { name: "سوالات متداول", href: "#faq" },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = () => {
    handleSendMessageWithBubbleHide(() => {
      if (inputMessage.trim()) {
        const newMessage = {
          id: chatMessages.length + 1,
          text: inputMessage,
          sender: 'user' as const
        };
        setChatMessages([...chatMessages, newMessage]);
        setInputMessage('');
        
        // Simulate bot response
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: prev.length + 1,
            text: 'پیام شما دریافت شد در اسرع وقت پاسخگو خواهم بود',
            sender: 'bot'
          }]);
          setHasUnreadBotMessage(true);
        }, 5000);
      }
    });
  };

  const faqItems = [
    {
      question: "اهداف این پیش فروش چیست؟",
      answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است."
    },
    {
      question: "توکن فروشی و پیش فروش چیست؟",
      answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است."
    },
    {
      question: "تاریخ شروع پیش فروش چیست؟",
      answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است."
    },
    {
      question: "چگونه ممکن است در پیش فروش شرکت کنم؟",
      answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است."
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans" dir="rtl">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-100/95 backdrop-blur-md border-b border-gray-300 shadow-lg' 
          : 'bg-white/80 backdrop-blur-md'
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer">
              <motion.img 
                src={ariyaBotImage}
                alt="Ariya Bot"
                className="w-10 h-10 rounded-full object-cover shadow-lg"
                whileHover={{ scale: 1.05 }}
              />
              <span className="text-2xl font-bold text-gray-800 tracking-tight">Ariya Bot</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-colors relative group bg-none border-none cursor-pointer"
                  style={{ fontFamily: 'Estedad, sans-serif' }}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full"></span>
                </button>
              ))}
            </div>

            {/* Signup Button */}
            <div className="hidden md:block">
              <Link href="/login">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2.5 rounded-lg shadow-md shadow-green-500/20 transition-all hover:shadow-green-500/40 hover:-translate-y-0.5 font-bold text-sm cursor-pointer">
                  ورود و ثبت نام
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-100 p-4 shadow-xl animate-in slide-in-from-top-5">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    handleNavClick(item.href);
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 font-medium p-3 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors text-right bg-none border-none cursor-pointer w-full"
                  style={{ fontFamily: 'Estedad, sans-serif' }}
                >
                  {item.name}
                </button>
              ))}
              <Link href="/login">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white w-full rounded-lg py-3 font-bold text-base shadow-md shadow-green-500/20 cursor-pointer">
                  ورود و ثبت نام
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-20 md:pt-32 md:pb-32 px-4 overflow-hidden min-h-[90vh] flex items-center">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Right Column (Text) */}
            <div className="space-y-8 order-2 md:order-1 relative z-10">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 leading-[1.2] tracking-tight"
              >
                دستیار هوشمند <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500">24 ساعته</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-xl"
              >
                با این ربات به راحتی یک کارمند 24 ساعته استخدام کنید و به راحتی کارهای روزمره خودتون رو مدیریت کنید
              </motion.p>

            </div>

            {/* Left Column (Image) */}
            <motion.div 
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative order-1 md:order-2 perspective-1000"
            >
              {/* Abstract Background Elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
              
              {/* Main Image Container */}
              <div className="relative z-10">
                 {/* Multiple animated glow backgrounds */}
                 <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute inset-0 rounded-3xl -z-10 bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 blur-3xl"
                 />
                 <motion.div
                  animate={{ 
                    scale: [1.1, 1, 1.1],
                    opacity: [0.6, 0.7, 0.6]
                  }}
                  transition={{ repeat: Infinity, duration: 4, delay: 1 }}
                  className="absolute inset-0 rounded-3xl -z-10 bg-gradient-to-l from-purple-400/20 to-pink-400/20 blur-3xl"
                 />
                 
                 <motion.div 
                   animate={{
                     rotate: [0, 360],
                   }}
                   transition={{
                     repeat: Infinity,
                     duration: 20,
                     ease: "linear"
                   }}
                   className="absolute inset-0 rounded-3xl -z-10"
                 >
                   <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-border opacity-30"></div>
                 </motion.div>
                 
                 <div className="relative bg-white rounded-3xl p-2 shadow-2xl border border-white/60 backdrop-blur-sm">
                   <motion.img 
                    src={ariyaBotImage}
                    alt="Ariya Bot - AI Assistant" 
                    animate={{
                      y: [0, -20, 0],
                      rotate: [-2, 2, -2]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 5,
                      ease: "easeInOut"
                    }}
                    className="w-full h-auto rounded-2xl"
                   />
                 </div>
                
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -right-6 top-1/3 bg-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 z-20 hidden lg:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl">✓</div>
                    <div>
                      <div className="h-2 w-20 bg-gray-200 rounded-full mb-1"></div>
                      <div className="h-2 w-12 bg-gray-100 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>

                <FloatingCounter />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section id="videos-section" className="py-20 md:py-32 px-4 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="w-full"
        >
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              {/* Left Column (Text) */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-8 order-2 md:order-1"
              >
              {/* Title */}
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                ویدیوهایی را توضیح دهید که پیام برند شما را ساده می کنند.
              </h2>

              {/* Description Paragraphs */}
              <div className="space-y-6">
                <p className="text-gray-600 text-lg leading-relaxed">
                  لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و هر گاه زمانی برای بروز می کند و برای فرض شرط حتما.
                </p>
              </div>
            </motion.div>

              {/* Right Column (Animated Stats) */}
              <motion.div 
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative order-1 md:order-2 flex items-center justify-center"
              >
              {/* Decorative Background */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-100/40 rounded-full blur-3xl"></div>

              {/* Animated Stats Container */}
              <div className="relative z-10 w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
                
                {/* Center Image */}
                <motion.img
                  src={robotCharacterVideosImage}
                  alt="Robot Character"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="relative z-10 w-64 h-64 md:w-96 md:h-96 object-contain"
                />

                {/* Orbiting Elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  className="absolute w-72 h-72 md:w-96 md:h-96"
                >
                  {/* Stat 1 */}
                  <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
                    <div className="text-purple-600 font-black text-xl">98%</div>
                    <div className="text-gray-600 text-xs mt-1">رضایت</div>
                  </motion.div>

                  {/* Stat 2 */}
                  <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white rounded-2xl p-4 shadow-lg border border-emerald-100">
                    <div className="text-emerald-600 font-black text-xl">50K+</div>
                    <div className="text-gray-600 text-xs mt-1">کاربر فعال</div>
                  </motion.div>

                  {/* Stat 3 */}
                  <motion.div className="absolute top-1/2 -translate-y-1/2 right-0 bg-white rounded-2xl p-4 shadow-lg border border-cyan-100">
                    <div className="text-cyan-600 font-black text-xl">99.9%</div>
                    <div className="text-gray-600 text-xs mt-1">دسترسی</div>
                  </motion.div>

                  {/* Stat 4 */}
                  <motion.div className="absolute top-1/2 -translate-y-1/2 left-0 bg-white rounded-2xl p-4 shadow-lg border border-pink-100">
                    <div className="text-pink-600 font-black text-xl">15M+</div>
                    <div className="text-gray-600 text-xs mt-1">درخواست</div>
                  </motion.div>
                </motion.div>

                {/* Animated dots around center */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="absolute w-60 h-60 md:w-72 md:h-72"
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                      className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${i * 60}deg) translateY(-120px) translateX(-4px) translateY(-4px)`,
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-20 px-4 overflow-hidden">
        <div className="container mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" style={{ fontFamily: 'Vazirmatn-Regular' }}>خدمات اصلی ما</h2>
          </motion.div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {/* Service Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-2xl hover:border-purple-200 transition-all"
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Icon */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="relative z-10 w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4"
              >
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </motion.div>

              {/* Content */}
              <h3 className="text-base font-bold text-gray-900 mb-2 relative z-10">تحلیل اطلاعات</h3>
              <p className="text-gray-600 relative z-10">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.
              </p>

              {/* Hover effect border */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 w-0 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </motion.div>

            {/* Service Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-2xl hover:border-cyan-200 transition-all"
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-cyan-100 to-emerald-100 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Icon */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 0.1 }}
                className="relative z-10 w-10 h-10 bg-gradient-to-br from-cyan-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-4"
              >
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </motion.div>

              {/* Content */}
              <h3 className="text-base font-bold text-gray-900 mb-2 relative z-10">دستیار اجتماعی تطبیقی</h3>
              <p className="text-gray-600 relative z-10">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.
              </p>

              {/* Hover effect border */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 w-0 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </motion.div>

            {/* Service Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-2xl hover:border-pink-200 transition-all"
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Icon */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 0.2 }}
                className="relative z-10 w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mb-4"
              >
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </motion.div>

              {/* Content */}
              <h3 className="text-base font-bold text-gray-900 mb-2 relative z-10">متجر های ذکی</h3>
              <p className="text-gray-600 relative z-10">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.
              </p>

              {/* Hover effect border */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500 w-0 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </motion.div>

            {/* Service Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-2xl hover:border-indigo-200 transition-all"
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Icon */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 0.3 }}
                className="relative z-10 w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4"
              >
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>

              {/* Content */}
              <h3 className="text-base font-bold text-gray-900 mb-2 relative z-10">خودکارسازی هوشمند</h3>
              <p className="text-gray-600 relative z-10">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.
              </p>

              {/* Hover effect border */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 w-0 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </motion.div>

            {/* Service Card 5 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-2xl hover:border-orange-200 transition-all"
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Icon */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 0.4 }}
                className="relative z-10 w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mb-4"
              >
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>

              {/* Content */}
              <h3 className="text-base font-bold text-gray-900 mb-2 relative z-10">راهحل های مالی</h3>
              <p className="text-gray-600 relative z-10">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.
              </p>

              {/* Hover effect border */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 w-0 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </motion.div>

            {/* Service Card 6 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-2xl hover:border-teal-200 transition-all"
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Icon */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                className="relative z-10 w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-4"
              >
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </motion.div>

              {/* Content */}
              <h3 className="text-base font-bold text-gray-900 mb-2 relative z-10">تکنولوژی ابری</h3>
              <p className="text-gray-600 relative z-10">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.
              </p>

              {/* Hover effect border */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 w-0 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="pt-8 md:pt-12 pb-20 md:pb-32 px-4 overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="container mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" style={{ fontFamily: 'Vazirmatn-Regular' }}>اشتراک ها</h2>
          </motion.div>

          {/* Pricing Cards Grid */}
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100"
            >
              {/* Gradient Accent Top */}
              <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-blue-400/20 to-transparent rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* Tag */}
              <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                پایه
              </div>

              {/* Plan Name */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">پایه ای</h3>
              <p className="text-gray-500 text-xs mb-4">برای شروع کار</p>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-black text-blue-600">۲۹۹</span>
                <span className="text-gray-500 text-xs mr-2">تومان / ماه</span>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-blue-200 to-transparent mb-4"></div>

              {/* Features */}
              <ul className="space-y-2 mb-5">
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>۵ درخواست روزانه</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>پشتیبانی ایمیل</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>۱ GB فضای ذخیره</span>
                </li>
              </ul>

              {/* Button */}
              <button className="w-full bg-blue-50 text-blue-600 font-semibold py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                شروع کنید
              </button>
            </motion.div>

            {/* Standard Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group relative bg-gradient-to-br from-white via-purple-50 to-gray-50 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-purple-300"
            >
              {/* Gradient Accent Top */}
              <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-purple-400/30 to-transparent rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* Popular Badge */}
              <div className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 animate-pulse">
                محبوب ترین
              </div>

              {/* Plan Name */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">استاندارد</h3>
              <p className="text-gray-500 text-xs mb-4">برای حرفه ای ها</p>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-black text-purple-600">۷۹۹</span>
                <span className="text-gray-500 text-xs mr-2">تومان / ماه</span>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-purple-300 to-transparent mb-4"></div>

              {/* Features */}
              <ul className="space-y-2 mb-5">
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>۵۰ درخواست روزانه</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>پشتیبانی ۲۴/۷</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>۵۰ GB فضای ذخیره</span>
                </li>
              </ul>

              {/* Button */}
              <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-2 px-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all text-sm">
                انتخاب کنید
              </button>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group relative bg-gradient-to-br from-white to-emerald-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100"
            >
              {/* Gradient Accent Top */}
              <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* Tag */}
              <div className="inline-block bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                حرفه ای
              </div>

              {/* Plan Name */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">حرفه ای</h3>
              <p className="text-gray-500 text-xs mb-4">برای تیم های بزرگ</p>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-black text-emerald-600">۱۹۹۹</span>
                <span className="text-gray-500 text-xs mr-2">تومان / ماه</span>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-emerald-200 to-transparent mb-4"></div>

              {/* Features */}
              <ul className="space-y-2 mb-5">
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>درخواست نامحدود</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>پشتیبانی اختصاصی</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-700">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>۵۰۰ GB فضای ذخیره</span>
                </li>
              </ul>

              {/* Button */}
              <button className="w-full bg-emerald-50 text-emerald-600 font-semibold py-2 px-3 rounded-lg hover:bg-emerald-100 transition-colors text-sm">
                شروع کنید
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 px-4 overflow-hidden">
        <div className="container mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" style={{ fontFamily: 'Vazirmatn-Regular' }}>اخرین اخبار</h2>
          </motion.div>

          {/* News Carousel */}
          <NewsCarousel />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="pt-8 md:pt-12 pb-20 md:pb-32 px-4 overflow-hidden bg-white">
        <div className="container mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" style={{ fontFamily: 'Vazirmatn-Regular' }}>سوالات متداول پیش فروش</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، فقط یک فنون است ممکن است پازدهستان فوتبال برنامه ریزی دفاتر راحتی است.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left Column - Illustration */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex items-center justify-center relative order-2 md:order-1"
            >
              {/* Decorative Background */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl"></div>

              {/* Robot Character Image */}
              <motion.img 
                src={robotCharacterFaqImage}
                alt="Robot Character"
                className="w-full h-auto max-w-2xl relative z-10 object-contain -translate-y-12"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Right Column - FAQ */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <FAQAccordion />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative bg-black text-white pt-20 md:pt-32 pb-8 px-4 mt-32 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="container mx-auto relative z-10">
          {/* Top Section */}
          <div className="grid md:grid-cols-3 gap-16 mb-20 pb-20 border-b border-white/10">
            {/* Brand & Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-4">
                <motion.img 
                  src={ariyaBotImage}
                  alt="Ariya Bot"
                  className="w-16 h-16 rounded-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                />
                <h3 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Ariya Bot</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                دستیار هوشمند ۲۴/۷ برای رفع تمام نیازهای کسب و کار شما با تکنولوژی AI پیشرفته
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-12"
            >
              <div>
                <h5 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">محصول</h5>
                <ul className="space-y-4">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center gap-2"><span className="group-hover:translate-x-1 transition-transform">→</span> ویژگی ها</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center gap-2"><span className="group-hover:translate-x-1 transition-transform">→</span> قیمت</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center gap-2"><span className="group-hover:translate-x-1 transition-transform">→</span> امنیت</a></li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">شرکت</h5>
                <ul className="space-y-4">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center gap-2"><span className="group-hover:translate-x-1 transition-transform">→</span> درباره</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center gap-2"><span className="group-hover:translate-x-1 transition-transform">→</span> بلاگ</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center gap-2"><span className="group-hover:translate-x-1 transition-transform">→</span> تماس</a></li>
                </ul>
              </div>
            </motion.div>

            {/* Contact & Social */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-right"
            >
              <h5 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">تماس</h5>
              <div className="space-y-4 mb-8">
                <div>
                  <a href="mailto:support@ariyabot.com" className="text-gray-400 hover:text-white transition-colors text-sm">
                    support@ariyabot.com
                  </a>
                </div>
                <div>
                  <a href="tel:+989123456789" className="text-gray-400 hover:text-white transition-colors text-sm">
                    ۰۹۱۲ ۳۴۵ ۶۷۸۹
                  </a>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-3 justify-end">
                <motion.a 
                  href="#" 
                  className="w-10 h-10 bg-white/10 hover:bg-purple-600 rounded-full flex items-center justify-center transition-all duration-300 group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                  </svg>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="w-10 h-10 bg-white/10 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a9 9 0 01-9 9h-1v-1a9 9 0 019-9h1z" />
                  </svg>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="w-10 h-10 bg-white/10 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-300 group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                  </svg>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="w-10 h-10 bg-white/10 hover:bg-blue-500 rounded-full flex items-center justify-center transition-all duration-300 group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </div>

        </div>
      </footer>

      {/* Floating Chat Button - Modern Design */}
      <motion.div
        className="fixed bottom-8 right-8 z-40 flex items-center gap-3 flex-row-reverse"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Initial bubble - shows before user sends any message and when scrolled */}
        <AnimatePresence>
          {showInitialBubble && !isContactOpen && isScrolled && (
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl px-4 py-2 border border-red-50 max-w-xs"
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <div className="absolute -bottom-1 right-6 w-3 h-3 bg-white border-l border-b border-red-50 rotate-45"></div>
              <p className="text-xs text-gray-800 leading-tight" style={{ fontFamily: 'Estedad, sans-serif' }}>
                <TypeWriter text={chatMessages[0]?.text.substring(0, 40) + '...'} speed={30} />
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification bubble - shows when bot has unread message */}
        <AnimatePresence>
          {hasUnreadBotMessage && !isContactOpen && (
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl px-4 py-2 border border-red-50 max-w-xs"
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <div className="absolute -bottom-1 right-6 w-3 h-3 bg-white border-l border-b border-red-50 rotate-45"></div>
              <p className="text-xs text-gray-800 leading-tight" style={{ fontFamily: 'Estedad, sans-serif' }}>
                <TypeWriter text={chatMessages[chatMessages.length - 1]?.text.substring(0, 40) + '...'} speed={30} />
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Button - Modern with notification badge */}
        <motion.button
          key={`chat-btn-${hasUnreadBotMessage}`}
          onClick={() => setIsContactOpen(!isContactOpen)}
          className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all flex-shrink-0 group ${
            hasUnreadBotMessage && !isContactOpen
              ? 'bg-gradient-to-br from-red-600 via-red-500 to-red-700 hover:shadow-red-500/50'
              : 'bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 hover:shadow-green-500/50'
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          animate={isContactOpen ? { rotate: 180 } : (hasUnreadBotMessage ? { x: [0, -20, 20, -20, 0] } : { rotate: 0 })}
          transition={hasUnreadBotMessage ? { repeat: Infinity, repeatDelay: 5, duration: 0.4 } : undefined}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 blur-xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <AnimatePresence mode="wait">
            {isContactOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-7 h-7 relative z-10" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-7 h-7 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Contact Modal Backdrop */}
      <AnimatePresence>
        {isContactOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gradient-to-br from-black/50 via-purple-900/20 to-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsContactOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Modern Chat Window */}
      <AnimatePresence>
        {isContactOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 400, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-8 bottom-8 z-50 w-80 h-96 bg-white shadow-2xl rounded-3xl flex flex-col overflow-hidden border border-purple-200/50"
          >
            {/* Modern Header with Avatar */}
            <div className="relative bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              
              {/* Bot Avatar */}
              <motion.div 
                className="relative flex-shrink-0"
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <div className="w-9 h-9 rounded-full bg-white p-1 shadow-lg">
                  <img 
                    src={ariyaBotImage}
                    alt="Ariya Bot"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white">
                  <motion.div 
                    className="w-full h-full bg-green-300 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>
              </motion.div>

              {/* Header Text */}
              <div className="flex-1 relative z-10">
                <h3 className="text-sm font-bold mb-0" style={{ fontFamily: 'Vazirmatn-Regular' }}>دستیار آریا</h3>
                <div className="flex items-center gap-1">
                  <motion.div
                    className="w-1.5 h-1.5 bg-green-300 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  <span className="text-xs text-white/80">آنلاین</span>
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                onClick={() => setIsContactOpen(false)}
                className="relative z-10 p-1 hover:bg-white/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Messages Area - Modern Design */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-gradient-to-b from-gray-50 via-white to-purple-50/30">
              {chatMessages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Bot Avatar for bot messages */}
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 p-0.5 flex-shrink-0">
                      <img 
                        src={ariyaBotImage}
                        alt="Bot"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`relative max-w-[70%] px-3 py-1.5 rounded-xl shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm border border-purple-100'
                    }`}
                  >
                    <p className="text-xs leading-snug" style={{ fontFamily: 'Estedad, sans-serif' }}>
                      {msg.text}
                    </p>
                  </motion.div>

                  {/* User Avatar placeholder */}
                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white flex-shrink-0">
                      <Users className="w-3 h-3" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Modern Input Area */}
            <div className="border-t border-purple-100 px-4 py-3 bg-gradient-to-r from-purple-50/50 to-blue-50/50 flex-shrink-0">
              <div className="flex gap-2.5 items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="پیام..."
                  className="flex-1 px-3 py-2.5 text-sm border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all bg-white shadow-sm"
                  style={{ fontFamily: 'Estedad, sans-serif' }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  <motion.svg 
                    className="w-4 h-4" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ x: 2, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16201717 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99021575 L3.03521743,10.4312088 C3.03521743,10.5883061 3.19218622,10.7454035 3.50612381,10.7454035 L16.6915026,11.5308904 C16.6915026,11.5308904 17.1624089,11.5308904 17.1624089,12.0021826 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                  </motion.svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decoration */}
      <div className="fixed top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-50/50 via-purple-50/30 to-transparent -z-10 rounded-bl-[100px]"></div>
    </div>
  );
}
