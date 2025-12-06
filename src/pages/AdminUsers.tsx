import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import funcUrls from '../../backend/func2url.json';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
  chat_expires_at: string | null;
  purchased_product: string | null;
  password_changed_by_user: boolean;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    const adminAuth = sessionStorage.getItem('admin_authenticated');
    if (!adminAuth) {
      navigate('/admin-login');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(funcUrls['admin-user-management'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'list'
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователей');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        throw new Error(data.error || 'Неизвестная ошибка');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeleting(userToDelete.id);
    try {
      const response = await fetch(funcUrls['admin-user-management'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          user_id: userToDelete.id
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении пользователя');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Успешно',
          description: `Пользователь ${userToDelete.email} удален`,
        });
        loadUsers();
      } else {
        throw new Error(data.error || 'Неизвестная ошибка');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
      setUserToDelete(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSubscriptionStatus = (expiresAt: string | null) => {
    if (!expiresAt) return { text: 'Нет подписки', variant: 'secondary' as const };
    
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    
    if (expiryDate < now) {
      return { text: 'Истекла', variant: 'destructive' as const };
    }
    
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 7) {
      return { text: `Осталось ${daysLeft} дн.`, variant: 'destructive' as const };
    }
    
    return { text: `До ${formatDate(expiresAt)}`, variant: 'default' as const };
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="-ml-2"
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад в админ-панель
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={loading}
          >
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Обновить
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Управление пользователями</h1>
        <p className="text-muted-foreground">
          Список всех пользователей системы с информацией о подписках
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={20} />
            Пользователи ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Icon name="Loader2" size={32} className="animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-4">Загрузка пользователей...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Пользователи не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Продукт</TableHead>
                    <TableHead>Подписка</TableHead>
                    <TableHead>Регистрация</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const subscriptionStatus = getSubscriptionStatus(user.chat_expires_at);
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.email}
                          {!user.password_changed_by_user && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              <Icon name="AlertCircle" size={12} className="mr-1" />
                              Первый вход
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{user.full_name || '—'}</TableCell>
                        <TableCell>
                          {user.purchased_product ? (
                            <Badge variant="secondary">{user.purchased_product}</Badge>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={subscriptionStatus.variant}>
                            {subscriptionStatus.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell>
                          {user.is_admin ? (
                            <Badge variant="default">
                              <Icon name="Shield" size={12} className="mr-1" />
                              Админ
                            </Badge>
                          ) : (
                            <Badge variant="outline">Пользователь</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!user.is_admin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(user)}
                              disabled={deleting === user.id}
                            >
                              {deleting === user.id ? (
                                <Icon name="Loader2" size={16} className="animate-spin" />
                              ) : (
                                <Icon name="Trash2" size={16} className="text-destructive" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить пользователя <strong>{userToDelete?.email}</strong>?
              <br />
              <br />
              Это действие удалит:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Данные пользователя</li>
                <li>Прогресс по курсу</li>
                <li>Историю покупок</li>
                <li>Токены доступа к чату</li>
                <li>Все связанные данные</li>
              </ul>
              <br />
              <strong className="text-destructive">Это действие нельзя отменить.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Удалить пользователя
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
