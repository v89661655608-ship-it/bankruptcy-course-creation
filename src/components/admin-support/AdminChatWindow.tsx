import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Message, Chat } from './types';

interface AdminChatWindowProps {
  selectedChatUserId: number | null;
  selectedChat?: Chat;
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  selectedImage: File | null;
  setSelectedImage: (file: File | null) => void;
  imagePreview: string;
  setImagePreview: (preview: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  replyToMessage: Message | null;
  setReplyToMessage: (msg: Message | null) => void;
  editingMessage: Message | null;
  setEditingMessage: (msg: Message | null) => void;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: () => void;
  handleDeleteMessage: (messageId: number, userId: number) => void;
  handleReaction: (messageId: number, reaction: string) => void;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  getReactionCount: (reactions: Array<{ reaction: string; user_id: number }>, emoji: string) => number;
  hasUserReacted: (reactions: Array<{ reaction: string; user_id: number }>, emoji: string) => boolean;
}

export default function AdminChatWindow({
  selectedChatUserId,
  selectedChat,
  messages,
  newMessage,
  setNewMessage,
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
  handleImageSelect,
  handleFileSelect,
  handleSendMessage,
  handleDeleteMessage,
  handleReaction,
  formatTime,
  formatDate,
  getReactionCount,
  hasUserReacted
}: AdminChatWindowProps) {
  let lastDate = '';

  if (!selectedChatUserId) {
    return (
      <Card className="col-span-8 flex flex-col">
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <Icon name="MessageCircleMore" size={64} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">Выберите чат</p>
          <p className="text-sm">Выберите диалог из списка слева</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="col-span-8 flex flex-col">
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
                        : !msg.read_by_admin
                        ? 'bg-red-100 text-foreground border-2 border-red-400'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.reply_to_id && (
                      <div className={`mb-2 p-2 rounded border-l-2 ${
                        msg.is_from_admin ? 'bg-purple-700 border-purple-400' : 'bg-white border-gray-300'
                      }`}>
                        <p className={`text-xs ${msg.is_from_admin ? 'text-purple-200' : 'text-muted-foreground'}`}>
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
                          msg.is_from_admin ? 'bg-purple-700' : 'bg-white'
                        }`}
                      >
                        <Icon name="FileText" size={20} />
                        <span className="text-sm">{msg.file_name || 'Файл'}</span>
                        <Icon name="Download" size={16} />
                      </a>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-xs ${msg.is_from_admin ? 'text-purple-200' : 'text-muted-foreground'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                      {msg.edited_at && (
                        <span className={`text-xs italic ${msg.is_from_admin ? 'text-purple-300' : 'text-muted-foreground'}`}>
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
                        className="text-sm hover:scale-125 transition-transform cursor-pointer"
                        title={`Реакция ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      onClick={() => setReplyToMessage(msg)}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Ответить"
                    >
                      <Icon name="Reply" size={14} />
                    </button>
                    {msg.is_from_admin && (
                      <>
                        <button
                          onClick={() => {
                            setEditingMessage(msg);
                            setNewMessage(msg.message);
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Редактировать"
                        >
                          <Icon name="Pencil" size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id, msg.user_id)}
                          className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
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
            id="admin-image-upload"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => document.getElementById('admin-image-upload')?.click()}
            disabled={editingMessage !== null}
          >
            <Icon name="Image" size={20} />
          </Button>
          
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            className="hidden"
            id="admin-file-upload"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => document.getElementById('admin-file-upload')?.click()}
            disabled={editingMessage !== null}
          >
            <Icon name="Paperclip" size={20} />
          </Button>

          <Input
            placeholder={editingMessage ? "Редактировать сообщение..." : "Напишите ответ клиенту..."}
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
  );
}