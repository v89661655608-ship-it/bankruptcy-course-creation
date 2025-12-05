import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Client {
  id: number;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  telegram_username?: string;
  access_start: string;
  access_end: string;
  is_active: boolean;
  payment_amount?: number;
  notes?: string;
}

const ChatAccess = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    telegram_username: '',
    days: 7,
    payment_amount: 3999,
    notes: ''
  });

  const API_URL = 'https://functions.poehali.dev/7001345f-b7d4-48c6-8f16-19213c0e4b08';
  const EXPIRE_CHECK_URL = 'https://functions.poehali.dev/300236fb-71e2-46cf-beb7-284c45ce7a53';
  const NOTIFY_URL = 'https://functions.poehali.dev/002375a1-91ef-4076-9822-c2342937fb42';

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?active=true`);
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список клиентов',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkExpired = async () => {
    try {
      const response = await fetch(EXPIRE_CHECK_URL);
      const data = await response.json();
      if (data.deactivated_count > 0) {
        toast({
          title: 'Доступы обновлены',
          description: `Деактивировано клиентов: ${data.deactivated_count}`,
        });
        loadClients();
      } else {
        toast({
          title: 'Проверка завершена',
          description: 'Истёкших доступов не найдено',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось проверить истёкшие доступы',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех!',
          description: `Клиент ${formData.client_name} добавлен`,
        });
        setDialogOpen(false);
        setFormData({
          client_name: '',
          client_email: '',
          client_phone: '',
          telegram_username: '',
          days: 7,
          payment_amount: 3999,
          notes: ''
        });
        loadClients();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось добавить клиента',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка соединения с сервером',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Удалить клиента ${name}?`)) return;

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Удалено',
          description: `Клиент ${name} удалён`,
        });
        loadClients();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить клиента',
        variant: 'destructive'
      });
    }
  };

  const handleExtend = async (id: number, name: string, days: number = 7) => {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ extend_days: days })
      });

      if (response.ok) {
        toast({
          title: 'Продлено',
          description: `Доступ ${name} продлён на ${days} дней`,
        });
        loadClients();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось продлить доступ',
        variant: 'destructive'
      });
    }
  };

  const sendNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(NOTIFY_URL);
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Уведомления отправлены',
          description: `Отправлено: ${data.notifications_sent}, Не удалось: ${data.notifications_failed}`,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить уведомления',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка соединения с сервером',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Управление доступом к чату</h1>
            <p className="text-gray-600 mt-2">Контроль клиентов с оплаченным доступом к чату юристов</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={sendNotifications} variant="outline" disabled={loading}>
              <Icon name="Bell" className="mr-2 h-4 w-4" />
              Отправить уведомления
            </Button>
            <Button onClick={checkExpired} variant="outline">
              <Icon name="RefreshCw" className="mr-2 h-4 w-4" />
              Проверить истёкшие
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                  Добавить клиента
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Добавить клиента</DialogTitle>
                  <DialogDescription>
                    Заполните данные клиента для предоставления доступа к чату
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="client_name">Имя клиента *</Label>
                      <Input
                        id="client_name"
                        value={formData.client_name}
                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="client_email">Email</Label>
                      <Input
                        id="client_email"
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="client_phone">Телефон</Label>
                      <Input
                        id="client_phone"
                        value={formData.client_phone}
                        onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="telegram_username">Telegram</Label>
                      <Input
                        id="telegram_username"
                        placeholder="@username"
                        value={formData.telegram_username}
                        onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="days">Дней доступа</Label>
                        <Input
                          id="days"
                          type="number"
                          value={formData.days}
                          onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="payment_amount">Сумма оплаты</Label>
                        <Input
                          id="payment_amount"
                          type="number"
                          value={formData.payment_amount}
                          onChange={(e) => setFormData({ ...formData, payment_amount: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Заметки</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Добавление...' : 'Добавить'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Активные клиенты ({clients.length})</CardTitle>
            <CardDescription>Список клиентов с активным доступом к чату</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Загрузка...</div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Нет активных клиентов
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Контакты</TableHead>
                    <TableHead>Доступ до</TableHead>
                    <TableHead>Осталось</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => {
                    const daysLeft = getDaysLeft(client.access_end);
                    return (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.client_name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {client.telegram_username && (
                              <div className="flex items-center gap-1">
                                <Icon name="MessageCircle" className="h-3 w-3" />
                                {client.telegram_username}
                              </div>
                            )}
                            {client.client_email && (
                              <div className="text-gray-500">{client.client_email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(client.access_end)}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${daysLeft < 2 ? 'text-red-600' : daysLeft < 4 ? 'text-orange-600' : 'text-green-600'}`}>
                            {daysLeft} {daysLeft === 1 ? 'день' : 'дней'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {client.payment_amount ? `${client.payment_amount} ₽` : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExtend(client.id, client.client_name)}
                            >
                              <Icon name="Clock" className="h-4 w-4 mr-1" />
                              +7 дней
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(client.id, client.client_name)}
                            >
                              <Icon name="Trash2" className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatAccess;