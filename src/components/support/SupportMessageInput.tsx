import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Message } from './types';

interface SupportMessageInputProps {
  replyToMessage: Message | null;
  setReplyToMessage: (msg: Message | null) => void;
  editingMessage: Message | null;
  setEditingMessage: (msg: Message | null) => void;
  imagePreview: string;
  setSelectedImage: (file: File | null) => void;
  setImagePreview: (preview: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  selectedImage: File | null;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: () => void;
}

export default function SupportMessageInput({
  replyToMessage,
  setReplyToMessage,
  editingMessage,
  setEditingMessage,
  imagePreview,
  setSelectedImage,
  setImagePreview,
  selectedFile,
  setSelectedFile,
  newMessage,
  setNewMessage,
  isSending,
  selectedImage,
  handleImageSelect,
  handleFileSelect,
  handleSendMessage
}: SupportMessageInputProps) {
  return (
    <div className="border-t p-2 md:p-4">
      {replyToMessage && (
        <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Icon name="Reply" size={16} className="flex-shrink-0" />
            <span className="text-xs md:text-sm truncate">Ответ на: {replyToMessage.message.substring(0, 30)}...</span>
          </div>
          <button onClick={() => setReplyToMessage(null)} className="flex-shrink-0">
            <Icon name="X" size={16} />
          </button>
        </div>
      )}
      
      {editingMessage && (
        <div className="mb-2 p-2 bg-yellow-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Icon name="Pencil" size={16} className="flex-shrink-0" />
            <span className="text-xs md:text-sm">Редактирование сообщения</span>
          </div>
          <button onClick={() => {
            setEditingMessage(null);
            setNewMessage('');
          }} className="flex-shrink-0">
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
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Icon name="FileText" size={20} className="flex-shrink-0" />
            <span className="text-xs md:text-sm truncate">{selectedFile.name}</span>
          </div>
          <button onClick={() => setSelectedFile(null)} className="flex-shrink-0">
            <Icon name="X" size={16} />
          </button>
        </div>
      )}
      
      <div className="flex gap-1 md:gap-2">
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
          className="h-9 w-9 md:h-10 md:w-10"
        >
          <Icon name="Image" size={18} className="md:size-5" />
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
          className="h-9 w-9 md:h-10 md:w-10"
        >
          <Icon name="Paperclip" size={18} className="md:size-5" />
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
          className="flex-1 text-sm md:text-base h-9 md:h-10"
        />

        <Button
          onClick={handleSendMessage}
          disabled={isSending || (!newMessage.trim() && !selectedImage && !selectedFile)}
          className="h-9 w-9 md:h-10 md:w-10"
          size="icon"
        >
          {isSending ? (
            <Icon name="Loader2" size={18} className="animate-spin md:size-5" />
          ) : (
            <Icon name="Send" size={18} className="md:size-5" />
          )}
        </Button>
      </div>
    </div>
  );
}