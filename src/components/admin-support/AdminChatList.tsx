import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Chat } from './types';

interface AdminChatListProps {
  chats: Chat[];
  selectedChatUserId: number | null;
  setSelectedChatUserId: (userId: number) => void;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  onBack: () => void;
}

export default function AdminChatList({
  chats,
  selectedChatUserId,
  setSelectedChatUserId,
  formatDate,
  formatTime,
  onBack
}: AdminChatListProps) {
  return (
    <Card className="col-span-4 flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
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
  );
}
