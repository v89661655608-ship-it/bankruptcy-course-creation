import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DashboardHeaderProps {
  user: {
    full_name?: string;
    email?: string;
    is_admin?: boolean;
    chat_expires_at?: string | null;
  } | null;
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const navigate = useNavigate();
  
  const hasChatAccess = user?.chat_expires_at && new Date(user.chat_expires_at) > new Date();
  const isAdminViewing = sessionStorage.getItem('admin_authenticated') === 'true';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              {isAdminViewing ? 'А' : user?.full_name?.charAt(0) || 'У'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{isAdminViewing ? 'Просмотр курса (Админ)' : 'Личный кабинет'}</h1>
              <p className="text-sm text-muted-foreground">{isAdminViewing ? 'Режим администратора' : user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdminViewing ? (
              <>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => navigate('/admin')}
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Вернуться в админку
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/admin-support')}
                >
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  Чат поддержки (Админ)
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant={hasChatAccess ? "outline" : "ghost"} 
                  size="sm" 
                  onClick={() => hasChatAccess && navigate('/support')}
                  disabled={!hasChatAccess}
                  className={!hasChatAccess ? "opacity-50 cursor-not-allowed" : ""}
                  title={!hasChatAccess ? "Доступ к чату не активен. Купите подписку." : ""}
                >
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  Поддержка юристов
                  {!hasChatAccess && (
                    <Icon name="Lock" size={14} className="ml-1 text-muted-foreground" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/document-constructor')}
                  className="relative"
                >
                  <Icon name="FileText" size={16} className="mr-2" />
                  Конструктор документов
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                    NEW
                  </span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/settings')}
                >
                  <Icon name="Settings" size={16} className="mr-2" />
                  Настройки
                </Button>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}