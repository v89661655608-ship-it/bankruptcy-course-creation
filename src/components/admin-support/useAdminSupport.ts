import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Message, Chat } from './types';

export function useAdminSupport() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.is_admin;
  const currentUser = user;
  
  // Для админа, залогиненного через пароль, используем ID = 1 (admin из БД)
  const adminUserId = currentUser?.id || 1;

  useEffect(() => {
    const isAdminAuthenticated = sessionStorage.getItem('admin_authenticated');
    if (!isAdminAuthenticated) {
      navigate('/admin-login');
      return;
    }
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (selectedChatUserId) {
      loadMessages(selectedChatUserId);
      const interval = setInterval(() => loadMessages(selectedChatUserId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChatUserId]);



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
      
      const response = await fetch('https://functions.poehali.dev/b233c85a-373c-4aa0-919e-68298ebe6c1b', {
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
      
      const response = await fetch('https://functions.poehali.dev/b233c85a-373c-4aa0-919e-68298ebe6c1b', {
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
    
    if ((!newMessage.trim() && !selectedImage && !selectedFile) || !selectedChatUserId) return;
    
    setIsSending(true);
    
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          toast({
            title: 'Ошибка',
            description: 'Не удалось загрузить изображение',
            variant: 'destructive'
          });
          setIsSending(false);
          return;
        }
      }
      
      let fileData = null;
      if (selectedFile) {
        fileData = await uploadFile(selectedFile);
        if (!fileData) {
          toast({
            title: 'Ошибка',
            description: 'Не удалось загрузить файл',
            variant: 'destructive'
          });
          setIsSending(false);
          return;
        }
      }
      
      const response = await fetch(
        'https://functions.poehali.dev/92d0eff0-8de5-4a02-b849-378019f1af28?action=send',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: selectedChatUserId,
            message: newMessage.trim() || (imageUrl ? '📎 Изображение' : fileData ? `📄 ${fileData.name}` : ''),
            image_url: imageUrl,
            file_url: fileData?.url,
            file_name: fileData?.name,
            file_type: fileData?.type,
            reply_to_id: replyToMessage?.id,
            is_from_admin: true
          })
        }
      );
      
      if (response.ok) {
        setNewMessage('');
        setSelectedImage(null);
        setImagePreview('');
        setSelectedFile(null);
        setReplyToMessage(null);
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
            user_id: editingMessage.user_id
          })
        }
      );
      
      if (response.ok) {
        setNewMessage('');
        setEditingMessage(null);
        if (selectedChatUserId) {
          await loadMessages(selectedChatUserId);
        }
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

  const handleDeleteMessage = async (messageId: number, userId: number) => {
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
        if (selectedChatUserId) {
          await loadMessages(selectedChatUserId);
        }
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
    console.log('Admin adding reaction:', { messageId, reaction, adminUserId });
    try {
      const response = await fetch(
        'https://functions.poehali.dev/92d0eff0-8de5-4a02-b849-378019f1af28?action=react',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message_id: messageId,
            user_id: adminUserId,
            reaction
          })
        }
      );
      console.log('Reaction response:', response.status, await response.text());
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
    return reactions.some(r => r.reaction === emoji && r.user_id === adminUserId);
  };

  return {
    chats,
    selectedChatUserId,
    setSelectedChatUserId,
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    isSending,
    selectedImage,
    setSelectedImage,
    imagePreview,
    setImagePreview,
    selectedFile,
    setSelectedFile,
    replyToMessage,
    setReplyToMessage,
    editingMessage,
    setEditingMessage,
    navigate,
    handleImageSelect,
    handleFileSelect,
    handleSendMessage,
    handleEditMessage,
    handleDeleteMessage,
    handleReaction,
    formatTime,
    formatDate,
    getReactionCount,
    hasUserReacted
  };
}