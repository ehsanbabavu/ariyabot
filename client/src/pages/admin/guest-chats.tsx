import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Send, 
  X,
  User,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAuthenticatedRequest } from "@/lib/auth";
import type { GuestChatSession, GuestChatMessage } from "@shared/schema";

export default function GuestChats() {
  const [selectedSession, setSelectedSession] = useState<GuestChatSession | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery<GuestChatSession[]>({
    queryKey: ["/api/admin/guest-chats"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/admin/guest-chats");
      if (!response.ok) throw new Error("خطا در دریافت چت‌ها");
      return response.json();
    },
    refetchInterval: 5000,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<GuestChatMessage[]>({
    queryKey: ["/api/admin/guest-chats/messages", selectedSession?.id],
    queryFn: async () => {
      if (!selectedSession) return [];
      const response = await createAuthenticatedRequest(`/api/admin/guest-chats/${selectedSession.id}/messages`);
      if (!response.ok) throw new Error("خطا در دریافت پیام‌ها");
      return response.json();
    },
    enabled: !!selectedSession,
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string; message: string }) => {
      const response = await createAuthenticatedRequest(`/api/admin/guest-chats/${sessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error("خطا در ارسال پیام");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guest-chats/messages", selectedSession?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guest-chats"] });
      setMessageInput("");
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "ارسال پیام با مشکل مواجه شد",
        variant: "destructive",
      });
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await createAuthenticatedRequest(`/api/admin/guest-chats/${sessionId}/close`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("خطا در بستن جلسه");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guest-chats"] });
      setSelectedSession(null);
      toast({
        title: "موفق",
        description: "جلسه چت بسته شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "بستن جلسه با مشکل مواجه شد",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedSession) return;
    
    sendMessageMutation.mutate({
      sessionId: selectedSession.id,
      message: messageInput.trim(),
    });
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const formatTime = (dateString: string | Date | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const activeSessions = sessions.filter(s => s.isActive);
  const closedSessions = sessions.filter(s => !s.isActive);

  return (
    <DashboardLayout title="چت مهمانان">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">چت با مهمانان</h1>
              <p className="text-muted-foreground text-sm">پاسخ به سوالات بازدیدکنندگان سایت</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{activeSessions.length} فعال</span>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                لیست چت‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-320px)]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>هنوز چتی وجود ندارد</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedSession?.id === session.id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {session.guestName || "مهمان"}
                              </p>
                              {session.guestPhone && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {session.guestPhone}
                                </p>
                              )}
                            </div>
                          </div>
                          {(session.unreadByAdmin || 0) > 0 && (
                            <Badge variant="destructive" className="rounded-full h-6 w-6 p-0 flex items-center justify-center text-xs">
                              {session.unreadByAdmin}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(session.lastMessageAt)}
                          </span>
                          <Badge variant={session.isActive ? "default" : "secondary"} className="text-xs">
                            {session.isActive ? "فعال" : "بسته"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {closedSessions.length > 0 && (
                      <>
                        <div className="px-4 py-2 bg-muted/30 text-sm text-muted-foreground">
                          چت‌های بسته شده
                        </div>
                        {closedSessions.map((session) => (
                          <div
                            key={session.id}
                            onClick={() => setSelectedSession(session)}
                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors opacity-60 ${
                              selectedSession?.id === session.id ? "bg-muted" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {session.guestName || "مهمان"}
                                </p>
                                {session.guestPhone && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {session.guestPhone}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 ml-1" />
                              {formatDate(session.lastMessageAt)}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            {selectedSession ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {selectedSession.guestName || "مهمان"}
                        </CardTitle>
                        {selectedSession.guestPhone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {selectedSession.guestPhone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedSession.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => closeSessionMutation.mutate(selectedSession.id)}
                          disabled={closeSessionMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 ml-1" />
                          بستن چت
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedSession(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[calc(100vh-400px)]">
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>هنوز پیامی ارسال نشده</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === "admin" ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.sender === "admin"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}>
                                {formatTime(message.createdAt)}
                                {message.sender === "admin" && (
                                  <span className="mr-2">
                                    {message.isRead ? (
                                      <CheckCircle className="h-3 w-3 inline" />
                                    ) : (
                                      <Clock className="h-3 w-3 inline" />
                                    )}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  
                  {selectedSession.isActive && (
                    <>
                      <Separator />
                      <form onSubmit={handleSendMessage} className="p-4 flex items-center gap-2">
                        <Input
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="پیام خود را بنویسید..."
                          className="flex-1"
                          disabled={sendMessageMutation.isPending}
                        />
                        <Button
                          type="submit"
                          disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        >
                          <Send className="h-4 w-4 ml-1" />
                          ارسال
                        </Button>
                      </form>
                    </>
                  )}
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">یک چت از لیست انتخاب کنید</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
