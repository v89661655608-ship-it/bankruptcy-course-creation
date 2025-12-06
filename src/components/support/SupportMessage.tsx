import Icon from '@/components/ui/icon';
import { Message } from './types';

interface SupportMessageProps {
  msg: Message;
  userId?: number;
  formatTime: (dateString: string) => string;
  getReactionCount: (reactions: Array<{ reaction: string; user_id: number }>, emoji: string) => number;
  hasUserReacted: (reactions: Array<{ reaction: string; user_id: number }>, emoji: string) => boolean;
  handleReaction: (messageId: number, reaction: string) => void;
  setReplyToMessage: (msg: Message) => void;
  setEditingMessage: (msg: Message) => void;
  setNewMessage: (message: string) => void;
  handleDeleteMessage: (messageId: number) => void;
}

export default function SupportMessage({
  msg,
  userId,
  formatTime,
  getReactionCount,
  hasUserReacted,
  handleReaction,
  setReplyToMessage,
  setEditingMessage,
  setNewMessage,
  handleDeleteMessage
}: SupportMessageProps) {
  return (
    <div className={`flex ${msg.is_from_admin ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] md:max-w-[70%] ${msg.is_from_admin ? '' : 'ml-auto'}`}>
        {msg.is_from_admin && (
          <p className="text-[10px] md:text-xs text-muted-foreground mb-1 ml-2">
            Юрист
          </p>
        )}
        
        <div
          className={`rounded-2xl px-3 py-2 md:px-4 ${
            msg.is_from_admin
              ? 'bg-muted text-foreground'
              : !msg.read_by_admin
              ? 'bg-yellow-500 text-white'
              : 'bg-purple-600 text-white'
          }`}
        >
          {msg.reply_to_id && (
            <div className={`mb-2 p-1.5 md:p-2 rounded border-l-2 ${
              msg.is_from_admin ? 'bg-white border-gray-300' : 'bg-purple-700 border-purple-400'
            }`}>
              <p className={`text-[10px] md:text-xs ${msg.is_from_admin ? 'text-muted-foreground' : 'text-purple-200'}`}>
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
          <p className="whitespace-pre-wrap break-words text-sm md:text-base">{msg.message}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className={`text-[10px] md:text-xs ${msg.is_from_admin ? 'text-muted-foreground' : 'text-purple-200'}`}>
              {formatTime(msg.created_at)}
            </p>
            {msg.edited_at && (
              <span className={`text-[10px] md:text-xs italic ${msg.is_from_admin ? 'text-muted-foreground' : 'text-purple-300'}`}>
                (изменено)
              </span>
            )}
          </div>
        </div>

        {msg.reactions && msg.reactions.length > 0 && (
          <div className="flex gap-1 mt-1 ml-1 md:ml-2">
            {['👍', '❤️', '👏', '🙏'].map((emoji) => {
              const count = getReactionCount(msg.reactions, emoji);
              if (count === 0) return null;
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(msg.id, emoji)}
                  className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${
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

        <div className="flex gap-1.5 md:gap-2 mt-1 ml-1 md:ml-2 items-center flex-wrap">
          {['👍', '❤️', '👏', '🙏'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(msg.id, emoji)}
              className="text-base md:text-sm hover:scale-125 transition-transform cursor-pointer p-1"
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
          {!msg.is_from_admin && msg.user_id === userId && (
            <>
              <button
                onClick={() => {
                  setEditingMessage(msg);
                  setNewMessage(msg.message);
                }}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer p-1"
                title="Редактировать"
              >
                <Icon name="Pencil" size={14} />
              </button>
              <button
                onClick={() => handleDeleteMessage(msg.id)}
                className="text-xs text-red-500 hover:text-red-700 cursor-pointer p-1"
                title="Удалить"
              >
                <Icon name="Trash2" size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}