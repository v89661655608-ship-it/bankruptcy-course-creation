import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function TestPayment() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { toast } = useToast();

  const createPayment = async (amount: number, productType: string) => {
    if (!email || !name) {
      toast({
        title: '❌ Заполните все поля',
        description: 'Введите email и имя для продолжения',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/b3f3dab4-093d-45bf-98cb-86512e00886b?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          name: name,
          amount: amount,
          product_type: productType,
          return_url: `${window.location.origin}/payment/success?product=${productType}`
        })
      });

      const data = await response.json();

      if (response.ok && data.confirmation_url) {
        toast({
          title: '✅ Ссылка создана!',
          description: `Payment ID: ${data.payment_id}`,
        });
        
        setTimeout(() => {
          window.location.href = data.confirmation_url;
        }, 1000);
      } else {
        throw new Error(data.error || 'Не удалось создать платёж');
      }
    } catch (error: any) {
      toast({
        title: '❌ Ошибка',
        description: error.message,
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">🧪 Тестовые оплаты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Ваше имя</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Иван Иванов"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <Button 
                onClick={() => createPayment(1, 'combo')}
                disabled={loading}
                size="lg"
                className="w-full text-lg"
              >
                {loading ? (
                  <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                ) : (
                  <span className="mr-2">💳</span>
                )}
                Оплатить 1₽ (Комбо - тест)
              </Button>

              <Button 
                onClick={() => createPayment(2, 'course')}
                disabled={loading}
                size="lg"
                className="w-full text-lg"
                variant="secondary"
              >
                {loading ? (
                  <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                ) : (
                  <span className="mr-2">📚</span>
                )}
                Оплатить 2₽ (Курс)
              </Button>

              <Button 
                onClick={() => createPayment(3, 'chat')}
                disabled={loading}
                size="lg"
                className="w-full text-lg"
                variant="outline"
              >
                {loading ? (
                  <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                ) : (
                  <span className="mr-2">💬</span>
                )}
                Оплатить 3₽ (Чат)
              </Button>

              <Button 
                onClick={() => createPayment(1, 'consultation')}
                disabled={loading}
                size="lg"
                className="w-full text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                ) : (
                  <span className="mr-2">👨‍💼</span>
                )}
                Оплатить 1₽ (Консультация 9999₽ - тест)
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              <p className="font-medium mb-2">ℹ️ Как проверить:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Введите email и имя</li>
                <li>Выберите тип оплаты</li>
                <li>Завершите оплату в ЮKassa</li>
                <li>Проверьте письмо на указанный email</li>
                <li>Войдите в личный кабинет</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}