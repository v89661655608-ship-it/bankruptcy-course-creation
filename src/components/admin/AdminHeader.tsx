import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminHeaderProps {
  onLogout: () => void;
  onSendTestEmail: () => void;
  sendingTestEmail: boolean;
}

export default function AdminHeader({ onLogout, onSendTestEmail, sendingTestEmail }: AdminHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Админ-панель</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/admin-support')}
          >
            <Icon name="MessageCircle" size={16} className="mr-2" />
            Чат поддержки
          </Button>
          <Button 
            variant="secondary" 
            onClick={onSendTestEmail}
            disabled={sendingTestEmail}
          >
            <Icon name="Mail" size={16} className="mr-2" />
            {sendingTestEmail ? 'Отправка...' : 'Тест письма'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            К курсам
          </Button>
          <Button variant="outline" onClick={onLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}