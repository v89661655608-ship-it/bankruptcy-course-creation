import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function Support() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const userId = user?.id;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!userId) return;
    
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
            body: JSON.stringify({ user_id: userId, is_admin: false })
          }
        );
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Размер файла не должен превышать 5 МБ',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://functions.poehali.dev/c9a0fff3-73c4-4f4b-9a92-f6aaf3e7cb2a', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;
    
    setIsSending(true);
    
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
      
      const response = await fetch(
        'https://functions.poehali.dev/92d0eff0-8de5-4a02-b849-378019f1af28?action=send',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            message: newMessage.trim() || (imageUrl ? '📎 Изображение' : ''),
            image_url: imageUrl,
            is_from_admin: false
          })
        }
      );
      
      if (response.ok) {
        setNewMessage('');
        setSelectedImage(null);
        setImagePreview('');
        await loadMessages();
        toast({
          title: 'Отправлено',
          description: 'Ваше сообщение отправлено юристу'
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
            user_id: userId,
            reaction
          })
        }
      );
      await loadMessages();
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
    return reactions.some(r => r.reaction === emoji && r.user_id === userId);
  };

  let lastDate = '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="h-[80vh] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <Icon name="ArrowLeft" size={20} />
                </Button>
                <div>
                  <CardTitle>Поддержка юристов</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Задайте вопрос нашим специалистам
                  </p>
                </div>
              </div>
              <Icon name="MessageCircle" size={24} className="text-purple-600" />
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Icon name="MessageCircle" size={64} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Пока нет сообщений</p>
                <p className="text-sm">Начните диалог с юристом</p>
              </div>
            ) : (
              <>
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
                      
                      <div className={`flex ${msg.is_from_admin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[70%] ${msg.is_from_admin ? '' : 'ml-auto'}`}>
                          {msg.is_from_admin && (
                            <p className="text-xs text-muted-foreground mb-1 ml-2">
                              Юрист
                            </p>
                          )}
                          
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              msg.is_from_admin
                                ? 'bg-muted text-foreground'
                                : 'bg-purple-600 text-white'
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
                            <p className={`text-xs mt-1 ${msg.is_from_admin ? 'text-muted-foreground' : 'text-purple-200'}`}>
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
              </>
            )}
          </CardContent>

          <div className="border-t p-4">
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Предпросмотр"
                  className="max-h-32 rounded-lg"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview('');
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Icon name="Image" size={20} />
              </Button>

              <Input
                placeholder="Напишите сообщение..."
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
                disabled={isSending || (!newMessage.trim() && !selectedImage)}
              >
                {isSending ? (
                  <Icon name="Loader2" size={20} className="animate-spin" />
                ) : (
                  <Icon name="Send" size={20} />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}