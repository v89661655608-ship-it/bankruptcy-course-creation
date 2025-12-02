import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Chat = () => {
  const [accessEnd, setAccessEnd] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [telegramLink] = useState('https://t.me/+QgiLIa1gFRY4Y2Iy');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('chat_token');
    const end = localStorage.getItem('chat_access_end');
    const email = localStorage.getItem('chat_user_email');

    if (!token || !end) {
      toast({
        title: 'Требуется авторизация',
        description: 'Сначала введите токен доступа',
        variant: 'destructive',
      });
      navigate('/chat-login');
      return;
    }

    const endDate = new Date(end);
    const now = new Date();

    if (endDate < now) {
      toast({
        title: 'Доступ истёк',
        description: 'Срок действия токена закончился',
        variant: 'destructive',
      });
      localStorage.removeItem('chat_token');
      localStorage.removeItem('chat_access_end');
      localStorage.removeItem('chat_user_email');
      navigate('/chat-login');
      return;
    }

    setAccessEnd(end);
    setUserEmail(email || '');
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_access_end');
    localStorage.removeItem('chat_user_email');
    navigate('/chat-login');
    toast({
      title: 'Выход выполнен',
      description: 'Вы вышли из чата',
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysLeft = () => {
    if (!accessEnd) return 0;
    const end = new Date(accessEnd);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysLeft = getDaysLeft();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Закрытый чат участников курса</h1>
            <p className="text-muted-foreground mt-1">
              Общайтесь с другими участниками и получайте поддержку экспертов
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <Icon name="LogOut" className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>

        {daysLeft > 0 && daysLeft <= 7 && (
          <Alert className="border-orange-200 bg-orange-50">
            <Icon name="AlertTriangle" className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Ваш доступ к чату истекает через {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" className="h-5 w-5 text-primary" />
              Информация о доступе
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userEmail && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium">{userEmail}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Доступ до:</span>
              <span className="font-medium">{formatDate(accessEnd)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Осталось дней:</span>
              <span className={`font-bold text-lg ${daysLeft <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                {daysLeft}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="MessageCircle" className="h-6 w-6 text-primary" />
              Telegram-чат участников
            </CardTitle>
            <CardDescription>
              Присоединяйтесь к закрытому чату в Telegram для общения с другими участниками курса
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">В чате вы можете:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Задавать вопросы экспертам по банкротству</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Делиться опытом с другими участниками</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Получать актуальные новости и обновления</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Находить единомышленников и поддержку</span>
                </li>
              </ul>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg h-14"
              onClick={() => window.open(telegramLink, '_blank')}
            >
              <Icon name="Send" className="mr-2 h-5 w-5" />
              Открыть чат в Telegram
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              После перехода по ссылке вы автоматически присоединитесь к закрытому чату
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="HelpCircle" className="h-5 w-5 text-primary" />
              Правила чата
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">• Уважайте других участников чата</p>
            <p className="text-sm">• Не размещайте рекламу без согласования</p>
            <p className="text-sm">• Задавайте вопросы по теме курса</p>
            <p className="text-sm">• Делитесь полезной информацией</p>
            <p className="text-sm">• Соблюдайте конфиденциальность других участников</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
