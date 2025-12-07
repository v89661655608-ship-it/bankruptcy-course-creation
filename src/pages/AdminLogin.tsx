import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'password' | 'code'>('password');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/19e2cf7d-2f13-4607-8088-00afc3c77b76', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', password }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('code');
        toast({
          title: 'Код отправлен',
          description: 'Проверьте email melni-v@yandex.ru',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: 'Неверный пароль',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить код',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/19e2cf7d-2f13-4607-8088-00afc3c77b76', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', code }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('admin_authenticated', 'true');
        navigate('/admin');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error === 'Code expired' ? 'Код истёк' : 'Неверный код',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось проверить код',
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
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Shield" className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Вход в админ-панель</CardTitle>
          <CardDescription className="text-center">
            {step === 'password' 
              ? 'Введите пароль для доступа к административной панели'
              : 'Введите код из письма на melni-v@yandex.ru'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Пароль администратора"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Отправка кода...
                  </>
                ) : (
                  <>
                    <Icon name="Mail" className="mr-2 h-4 w-4" />
                    Отправить код на email
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                Назад в личный кабинет
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="6-значный код"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  disabled={loading}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" className="mr-2 h-4 w-4" />
                    Войти
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('password');
                  setCode('');
                  setPassword('');
                }}
              >
                <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                Назад к вводу пароля
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
