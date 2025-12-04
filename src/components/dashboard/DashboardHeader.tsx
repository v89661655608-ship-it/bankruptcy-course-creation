import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DashboardHeaderProps {
  user: {
    full_name?: string;
    email?: string;
    is_admin?: boolean;
  } | null;
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              {user?.full_name?.charAt(0) || 'У'}
            </div>
            <div>
              <h1 className="text-xl font-bold">Личный кабинет</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/support')}
            >
              <Icon name="MessageCircle" size={16} className="mr-2" />
              Поддержка юристов
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/document-constructor')}
            >
              <Icon name="FileText" size={16} className="mr-2" />
              Конструктор документов
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}