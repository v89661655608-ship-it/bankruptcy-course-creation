import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { payment } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function Payment() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const paymentId = searchParams.get('payment_id');
  const serviceType = searchParams.get('type') || 'course';
  
  const serviceConfig = {
    course: {
      title: 'Курс "Банкротство физических лиц - самостоятельно"',
      price: 1900,
      features: [
        '7 видеомодулей',
        'Все шаблоны документов',
        'Доступ на 3 месяца'
      ]
    },
    chat: {
      title: 'Доступ к чату с юристами',
      price: 3999,
      features: [
        'Неограниченное количество вопросов',
        'Ответы в течение дня',
        'Доступ на 1 месяц',
        'Сопровождение на каждом этапе'
      ]
    }
  };
  
  const currentService = serviceConfig[serviceType as keyof typeof serviceConfig] || serviceConfig.course;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (paymentId) {
      checkPaymentStatus(paymentId);
    }
  }, [paymentId]);

  const checkPaymentStatus = async (id: string) => {
    setCheckingPayment(true);
    try {
      const result = await payment.checkStatus(id);
      if (result.paid) {
        toast({
          title: 'Оплата успешна!',
          description: 'Доступ к курсу открыт. Переходим в личный кабинет...',
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        toast({
          title: 'Ожидание оплаты',
          description: 'Платеж еще не обработан. Попробуйте обновить страницу через минуту.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    } finally {
      setCheckingPayment(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт для покупки курса',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      const returnUrl = `${window.location.origin}/payment/success?product=${serviceType}`;
      const result = await payment.createPayment(
        user.id, 
        currentService.price, 
        user.email, 
        returnUrl,
        user.full_name,
        serviceType
      );

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.confirmation_url) {
        window.location.href = result.confirmation_url;
      } else {
        throw new Error('Не удалось получить ссылку на оплату');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать платеж',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (checkingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Проверка статуса оплаты</h3>
            <p className="text-muted-foreground">Пожалуйста, подождите...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate('/')}
          >
            <Icon name="ArrowLeft" size={20} />
            Назад на главную
          </Button>
          
          {serviceType === 'course' ? (
            <Button 
              variant="outline"
              onClick={() => navigate('/payment?type=chat')}
            >
              Перейти к чату с юристами
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => navigate('/payment')}
            >
              Перейти к курсу
            </Button>
          )}
        </div>

        <div className="text-center mb-8">
          <Badge className="mb-4">Оформление заказа</Badge>
          <h1 className="text-4xl font-bold mb-4">Оплата услуги</h1>
          <p className="text-xl text-muted-foreground">
            Безопасная оплата через ЮKassa
          </p>
        </div>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="bg-muted/30 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {currentService.title}
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {currentService.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Icon name="Check" className="text-accent flex-shrink-0 mt-0.5" size={16} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{currentService.price.toLocaleString('ru-RU')} ₽</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="User" size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Покупатель:</span>
                </div>
                <p className="text-sm ml-7">{user.full_name}</p>
                <p className="text-sm ml-7 text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm mb-6">
              <div className="flex gap-3">
                <Icon name="Shield" className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-blue-900 mb-1">Безопасная оплата</p>
                  <p className="text-blue-700">
                    Оплата происходит через защищенную платежную систему ЮKassa (Яндекс.Касса). 
                    Мы не храним данные вашей карты.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handlePayment}
              size="lg" 
              className="w-full bg-accent hover:bg-accent/90 text-primary font-bold text-lg py-6"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                  Подготовка к оплате...
                </>
              ) : (
                <>
                  <Icon name="CreditCard" className="mr-2" size={20} />
                  Перейти к оплате {currentService.price.toLocaleString('ru-RU')} ₽
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Нажимая кнопку, вы соглашаетесь с{' '}
              <a href="/oferta" className="underline hover:text-primary">договором оферты</a>,{' '}
              <a href="/privacy" className="underline hover:text-primary">политикой конфиденциальности</a>
              {' '}и{' '}
              <a href="/personal-data-consent" className="underline hover:text-primary">согласием на обработку персональных данных</a>
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Принимаем к оплате:</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="gap-2">
              <Icon name="CreditCard" size={16} />
              Банковские карты
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Icon name="Smartphone" size={16} />
              СБП
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Icon name="Wallet" size={16} />
              Электронные кошельки
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}