import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const PaymentForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const productType = searchParams.get('product') || 'course';
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const products = {
    course: {
      title: 'Курс "Банкротство физических лиц"',
      price: 2999,
      features: [
        '7 видеомодулей',
        'Все шаблоны документов',
        'Доступ на 3 месяца',
        'Пошаговые инструкции'
      ]
    },
    chat: {
      title: 'Доступ к чату с юристами',
      price: 3999,
      features: [
        'Неограниченные консультации',
        'Ответы в течение дня',
        'Доступ на 1 месяц',
        'Поддержка на каждом этапе'
      ]
    },
    combo: {
      title: 'Курс + Чат с юристами',
      price: 4999,
      features: [
        'Полный курс на 3 месяца',
        'Чат с юристами на 1 месяц',
        'Все материалы и шаблоны',
        'Максимальная поддержка'
      ]
    },
    test: {
      title: 'Тестовая оплата комбо (проверка вебхука)',
      price: 1,
      features: [
        'Проверка работы системы',
        'Тестовая оплата 1₽',
        'Проверка вебхука ЮKassa',
        'Тип продукта: combo'
      ]
    }
  };

  const currentProduct = products[productType as keyof typeof products] || products.course;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      const returnUrl = `${window.location.origin}/payment/success?product=${productType}`;
      
      const response = await fetch('https://functions.poehali.dev/b3f3dab4-093d-45bf-98cb-86512e00886b?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          name,
          amount: currentProduct.price,
          product_type: productType === 'test' ? 'combo' : productType,
          return_url: returnUrl
        })
      });

      const data = await response.json();

      if (response.ok && data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        toast({
          title: 'Ошибка оплаты',
          description: data.error || 'Не удалось создать платёж',
          variant: 'destructive'
        });
        setIsProcessing(false);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при создании платежа',
        variant: 'destructive'
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад на главную
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{currentProduct.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="text-4xl font-bold text-primary mb-4">
                {currentProduct.price.toLocaleString()} ₽
              </div>
              <ul className="space-y-2">
                {currentProduct.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Icon name="Check" className="text-accent flex-shrink-0" size={20} />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Ваше имя</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Иван Иванов"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email для получения доступа</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  На этот email придёт письмо с данными для входа
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-primary"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                    Создание платежа...
                  </>
                ) : (
                  <>
                    Оплатить {currentProduct.price.toLocaleString()} ₽
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                После нажатия вы будете перенаправлены на защищенную страницу оплаты ЮKassa
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentForm;