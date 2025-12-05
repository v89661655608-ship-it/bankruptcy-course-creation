import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function TestPayment() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPayment = async (amount: number, productType: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/b3f3dab4-093d-45bf-98cb-86512e00886b?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'melni-v@yandex.ru',
          name: 'Тестовый пользователь',
          amount: amount,
          product_type: productType,
          return_url: window.location.origin
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
          <CardContent className="space-y-4">
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

            <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              <p><strong>Email:</strong> melni-v@yandex.ru</p>
              <p className="mt-2">При нажатии создастся платёж в ЮKassa и откроется страница оплаты</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
