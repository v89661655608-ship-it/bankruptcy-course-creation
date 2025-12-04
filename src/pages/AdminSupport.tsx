import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: number;
  user_id: number;
  message: string;
  image_url?: string;
  is_from_admin: boolean;
  created_at: string;
  read_by_admin: boolean;
  read_by_user: boolean;
  full_name: string;
  email: string;
  reactions: Array<{ reaction: string; user_id: number }>;
}

interface Chat {
  user_id: number;
  full_name: string;
  email: string;
  last_message_time: string;
  unread_count: number;
  last_message: string;
}

export default function AdminSupport() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.is_admin;

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    if (selectedChatUserId) {
      loadMessages(selectedChatUserId);
      const interval = setInterval(() => loadMessages(selectedChatUserId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChatUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/92d0eff0-8de5-4a02-b849-378019f1af28?action=all_chats'
      );
      
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadMessages = async (userId: number) => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/92d0eff0-8de5-4a02-b849-378019f1af28?action=list&user_id=${userId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        await fetch(
          'https://functions.poehali.dev/92d0eff0-8de5-4a02-b849-378019f1af28?action=mark_read',
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, is_admin: true })
          }
        );
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatUserId) return;
    
    setIsSending(true);
    
    try {
      const response = await fetch(
        'https://functions.poehali.dev/92d0eff0-8de5-4a02-b849-378019f1af28?action=send',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: selectedChatUserId,
            message: newMessage.trim(),
            is_from_admin: true
          })
        }
      );
      
      if (response.ok) {
        setNewMessage('');
        await loadMessages(selectedChatUserId);
        await loadChats();
        toast({
          title: 'Отправлено',
          description: 'Сообщение отправлено клиенту'
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleReaction = async (messageId: number, reaction: string) => {
    try {
      await fetch(
        'https://functions.poehali.dev/92d0eff0-8de5-4a02-b849-378019f1af28?action=react',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message_id: messageId,
            user_id: currentUser.id,
            reaction
          })
        }
      );
      if (selectedChatUserId) {
        await loadMessages(selectedChatUserId);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }
  };

  const getReactionCount = (reactions: Array<{ reaction: string; user_id: number }>, emoji: string) => {
    return reactions.filter(r => r.reaction === emoji).length;
  };

  const hasUserReacted = (reactions: Array<{ reaction: string; user_id: number }>, emoji: string) => {
    return reactions.some(r => r.reaction === emoji && r.user_id === currentUser.id);
  };

  const selectedChat = chats.find(c => c.user_id === selectedChatUserId);
  let lastDate = '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-12 gap-4 h-[85vh]">
          <Card className="col-span-4 flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin')}
                  >
                    <Icon name="ArrowLeft" size={20} />
                  </Button>
                  <CardTitle>Все чаты</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-2">
              {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                  <Icon name="MessageCircle" size={48} className="mb-3 opacity-20" />
                  <p className="text-sm">Пока нет обращений</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <button
                      key={chat.user_id}
                      onClick={() => setSelectedChatUserId(chat.user_id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedChatUserId === chat.user_id
                          ? 'bg-purple-100 border-2 border-purple-600'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{chat.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{chat.email}</p>
                        </div>
                        {chat.unread_count > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{chat.last_message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(chat.last_message_time)} {formatTime(chat.last_message_time)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-8 flex flex-col">
            {selectedChatUserId ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Icon name="User" size={40} className="text-purple-600" />
                    <div>
                      <CardTitle>{selectedChat?.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedChat?.email}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const msgDate = formatDate(msg.created_at);
                    const showDate = msgDate !== lastDate;
                    lastDate = msgDate;

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                              {msgDate}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${msg.is_from_admin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${msg.is_from_admin ? 'ml-auto' : ''}`}>
                            {!msg.is_from_admin && (
                              <p className="text-xs text-muted-foreground mb-1 ml-2">
                                {msg.full_name}
                              </p>
                            )}
                            
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                msg.is_from_admin
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              {msg.image_url && (
                                <img
                                  src={msg.image_url}
                                  alt="Прикрепленное изображение"
                                  className="rounded-lg mb-2 max-w-full"
                                />
                              )}
                              <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                              <p className={`text-xs mt-1 ${msg.is_from_admin ? 'text-purple-200' : 'text-muted-foreground'}`}>
                                {formatTime(msg.created_at)}
                              </p>
                            </div>

                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className="flex gap-1 mt-1 ml-2">
                                {['👍', '❤️', '👏'].map((emoji) => {
                                  const count = getReactionCount(msg.reactions, emoji);
                                  if (count === 0) return null;
                                  return (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReaction(msg.id, emoji)}
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        hasUserReacted(msg.reactions, emoji)
                                          ? 'bg-purple-100 border-purple-400'
                                          : 'bg-muted'
                                      } border`}
                                    >
                                      {emoji} {count}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            <div className="flex gap-1 mt-1 ml-2">
                              {['👍', '❤️', '👏'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className="text-sm hover:scale-125 transition-transform"
                                  title={`Реакция ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </CardContent>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Напишите ответ клиенту..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />

                    <Button
                      onClick={handleSendMessage}
                      disabled={isSending || !newMessage.trim()}
                    >
                      {isSending ? (
                        <Icon name="Loader2" size={20} className="animate-spin" />
                      ) : (
                        <Icon name="Send" size={20} />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Icon name="MessageCircleMore" size={64} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Выберите чат</p>
                <p className="text-sm">Выберите диалог из списка слева</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}