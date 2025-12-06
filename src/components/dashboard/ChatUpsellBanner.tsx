import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface ChatUpsellBannerProps {
  user: {
    chat_expires_at?: string | null;
    expires_at?: string | null;
  } | null;
}

export default function ChatUpsellBanner({ user }: ChatUpsellBannerProps) {
  const navigate = useNavigate();

  if (!user) return null;

  const chatExpires = user.chat_expires_at ? new Date(user.chat_expires_at) : null;
  const now = new Date();

  // Если у пользователя активный чат - не показываем баннер
  if (chatExpires && chatExpires > now) {
    return null;
  }

  // Если чат истек менее 7 дней назад - показываем срочный баннер
  const daysExpired = chatExpires ? Math.floor((now.getTime() - chatExpires.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isRecent = daysExpired !== null && daysExpired < 7;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Icon name="MessageCircle" className="text-white" size={28} />
            </div>
            <div className="flex-1">
              {isRecent && chatExpires ? (
                <>
                  <h3 className="text-lg font-bold text-purple-900 mb-1 flex items-center gap-2">
                    <Icon name="Clock" size={20} className="text-orange-500" />
                    Ваш доступ к чату истек {daysExpired} дн. назад
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Юристы больше не могут отвечать на ваши вопросы. Продлите подписку, чтобы продолжить получать поддержку!
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-purple-900 mb-1">
                    💬 Нужна помощь юриста?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Докупите доступ к чату с юристами и получайте неограниченные консультации по вашему делу
                  </p>
                </>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon name="Check" size={14} className="text-green-600" />
                  Ответы в течение 24 часов
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Check" size={14} className="text-green-600" />
                  Проверка документов
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Check" size={14} className="text-green-600" />
                  Помощь с ходатайствами
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="text-center md:text-right mb-2">
              <div className="text-sm text-muted-foreground line-through">5 000+ ₽</div>
              <div className="text-3xl font-bold text-purple-600">3 999 ₽</div>
              <div className="text-xs text-muted-foreground">за месяц поддержки</div>
            </div>
            <Button
              onClick={() => navigate('/payment-form?product=chat')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg w-full md:w-auto"
              size="lg"
            >
              <Icon name="MessageCircle" size={18} className="mr-2" />
              {isRecent ? 'Продлить чат' : 'Подключить чат'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              💰 Экономия до 80% от стоимости консультаций
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}