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
  file_url?: string;
  file_name?: string;
  file_type?: string;
  edited_at?: string;
  reply_to_id?: number;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Размер файла не должен превышать 10 МБ',
          variant: 'destructive'
        });
        return;
      }
      
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Ошибка',
          description: 'Разрешены только PDF и Word документы',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string; type: string } | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://functions.poehali.dev/c9a0fff3-73c4-4f4b-9a92-f6aaf3e7cb2a', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          url: data.url,
          name: file.name,
          type: file.type
        };
      }
      return null;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (editingMessage) {
      return handleEditMessage();
    }
    
    if (!newMessage.trim() && !selectedImage && !selectedFile) return;
    
    setIsSending(true);
    
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
      
      let fileData = null;
      if (selectedFile) {
        fileData = await uploadFile(selectedFile);
      }
      
      const response = await fetch(
        'https://functions.poehali.dev/92d0eff0-8de5-4a02-b849-378019f1af28?action=send',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            message: newMessage.trim() || (imageUrl ? '📎 Изображение' : fileData ? `📄 ${fileData.name}` : ''),
            image_url: imageUrl,
            file_url: fileData?.url,
            file_name: fileData?.name,
            file_type: fileData?.type,
            reply_to_id: replyToMessage?.id,
            is_from_admin: false
          })
        }
      );
      
      if (response.ok) {
        setNewMessage('');
        setSelectedImage(null);
        setImagePreview('');
        setSelectedFile(null);
        setReplyToMessage(null);
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

  const handleEditMessage = async () => {
    if (!editingMessage || !newMessage.trim()) return;
    
    setIsSending(true);
    
    try {
      const response = await fetch(
        'https://functions.poehali.dev/92d0eff0-8de5-4a02-b849-378019f1af28?action=edit',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message_id: editingMessage.id,
            message: newMessage.trim(),
            user_id: userId
          })
        }
      );
      
      if (response.ok) {
        setNewMessage('');
        setEditingMessage(null);
        await loadMessages();
        toast({
          title: 'Изменено',
          description: 'Сообщение успешно отредактировано'
        });
      } else {
        throw new Error('Failed to edit message');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить сообщение',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('Вы уверены, что хотите удалить это сообщение?')) return;
    
    try {
      const response = await fetch(
        'https://functions.poehali.dev/92d0eff0-8de5-4a02-b849-378019f1af28?action=delete',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message_id: messageId,
            user_id: userId
          })
        }
      );
      
      if (response.ok) {
        await loadMessages();
        toast({
          title: 'Удалено',
          description: 'Сообщение удалено'
        });
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить сообщение',
        variant: 'destructive'
      });
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
                            {msg.reply_to_id && (
                              <div className={`mb-2 p-2 rounded border-l-2 ${
                                msg.is_from_admin ? 'bg-white border-gray-300' : 'bg-purple-700 border-purple-400'
                              }`}>
                                <p className={`text-xs ${msg.is_from_admin ? 'text-muted-foreground' : 'text-purple-200'}`}>
                                  Ответ на сообщение #{msg.reply_to_id}
                                </p>
                              </div>
                            )}
                            {msg.image_url && (
                              <img
                                src={msg.image_url}
                                alt="Прикрепленное изображение"
                                className="rounded-lg mb-2 max-w-full"
                              />
                            )}
                            {msg.file_url && (
                              <a
                                href={msg.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 mb-2 p-2 rounded ${
                                  msg.is_from_admin ? 'bg-white' : 'bg-purple-700'
                                }`}
                              >
                                <Icon name="FileText" size={20} />
                                <span className="text-sm">{msg.file_name || 'Файл'}</span>
                                <Icon name="Download" size={16} />
                              </a>
                            )}
                            <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className={`text-xs ${msg.is_from_admin ? 'text-muted-foreground' : 'text-purple-200'}`}>
                                {formatTime(msg.created_at)}
                              </p>
                              {msg.edited_at && (
                                <span className={`text-xs italic ${msg.is_from_admin ? 'text-muted-foreground' : 'text-purple-300'}`}>
                                  (изменено)
                                </span>
                              )}
                            </div>
                          </div>

                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex gap-1 mt-1 ml-2">
                              {['👍', '❤️', '👏', '🙏'].map((emoji) => {
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

                          <div className="flex gap-2 mt-1 ml-2 items-center flex-wrap">
                            {['👍', '❤️', '👏', '🙏'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg.id, emoji)}
                                className="text-sm hover:scale-125 transition-transform"
                                title={`Реакция ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                            {!msg.is_from_admin && msg.user_id === userId && (
                              <>
                                <button
                                  onClick={() => setReplyToMessage(msg)}
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                  title="Ответить"
                                >
                                  <Icon name="Reply" size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingMessage(msg);
                                    setNewMessage(msg.message);
                                  }}
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                  title="Редактировать"
                                >
                                  <Icon name="Pencil" size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="text-xs text-red-500 hover:text-red-700"
                                  title="Удалить"
                                >
                                  <Icon name="Trash2" size={14} />
                                </button>
                              </>
                            )}
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
            {replyToMessage && (
              <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Reply" size={16} />
                  <span className="text-sm">Ответ на: {replyToMessage.message.substring(0, 50)}...</span>
                </div>
                <button onClick={() => setReplyToMessage(null)}>
                  <Icon name="X" size={16} />
                </button>
              </div>
            )}
            
            {editingMessage && (
              <div className="mb-2 p-2 bg-yellow-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Pencil" size={16} />
                  <span className="text-sm">Редактирование сообщения</span>
                </div>
                <button onClick={() => {
                  setEditingMessage(null);
                  setNewMessage('');
                }}>
                  <Icon name="X" size={16} />
                </button>
              </div>
            )}
            
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
            
            {selectedFile && (
              <div className="mb-3 p-2 bg-muted rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="FileText" size={20} />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
                <button onClick={() => setSelectedFile(null)}>
                  <Icon name="X" size={16} />
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
                disabled={editingMessage !== null}
              >
                <Icon name="Image" size={20} />
              </Button>
              
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={editingMessage !== null}
              >
                <Icon name="Paperclip" size={20} />
              </Button>

              <Input
                placeholder={editingMessage ? "Редактировать сообщение..." : "Напишите сообщение..."}
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
                disabled={isSending || (!newMessage.trim() && !selectedImage && !selectedFile)}
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