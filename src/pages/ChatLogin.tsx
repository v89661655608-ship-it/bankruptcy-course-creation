import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const ChatLogin = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите токен доступа',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/7001345f-b7d4-48c6-8f16-19213c0e4b08', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (data.valid && data.access_granted) {
        localStorage.setItem('chat_token', token.trim().toUpperCase());
        localStorage.setItem('chat_access_end', data.access_end);
        localStorage.setItem('chat_user_email', data.user_email || '');
        
        toast({
          title: 'Успешно!',
          description: `Доступ к чату открыт до ${new Date(data.access_end).toLocaleDateString('ru-RU')}`,
        });
        
        navigate('/chat');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Токен недействителен или срок доступа истёк',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось проверить токен. Попробуйте позже',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="MessageSquare" className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Доступ к закрытому чату</CardTitle>
          <CardDescription className="text-center">
            Введите токен доступа, который вы получили после оплаты курса
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="CHAT_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                required
                disabled={loading}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Токен начинается с CHAT_ и содержит 32 символа
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Проверка токена...
                </>
              ) : (
                <>
                  <Icon name="LogIn" className="mr-2 h-4 w-4" />
                  Войти в чат
                </>
              )}
            </Button>
            <div className="pt-4 border-t">
              <p className="text-sm text-center text-muted-foreground mb-3">
                Ещё нет доступа?
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/payment')}
              >
                <Icon name="CreditCard" className="mr-2 h-4 w-4" />
                Купить доступ к чату
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatLogin;
