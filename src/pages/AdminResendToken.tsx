import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AdminResendToken() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleResend = async () => {
    if (!email) {
      toast({
        title: 'Ошибка',
        description: 'Введите email',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://functions.poehali.dev/7fa1eab7-2076-49e2-902c-12381143af6d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      setResult(data);

      if (response.ok) {
        toast({
          title: 'Успешно!',
          description: `Токен чата создан и отправлен на ${email}`
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать токен',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Пересоздать токен чата для пользователя</CardTitle>
          </CardTitle>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email пользователя</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              onClick={handleResend}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Создание токена...' : 'Создать и отправить токен'}
            </Button>

            {result && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-bold mb-2">Результат:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
