import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { admin, uploadFile, getFiles, deleteFile } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/admin/AdminHeader';
import ModulesTab from '@/components/admin/ModulesTab';
import LessonsTab from '@/components/admin/LessonsTab';
import FilesTab from '@/components/admin/FilesTab';

interface Module {
  id?: number;
  title: string;
  description: string;
  sort_order: number;
  is_published: boolean;
}

interface Lesson {
  id?: number;
  module_id: number;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  sort_order: number;
  is_published: boolean;
}

interface CourseFile {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  isWelcomeVideo?: boolean;
}

const Admin = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<number | undefined>();
  const [selectedModule, setSelectedModule] = useState<number | undefined>();
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [welcomeVideoUrl, setWelcomeVideoUrl] = useState('');
  const [welcomeVideoTitle, setWelcomeVideoTitle] = useState('');
  const [welcomeVideoDescription, setWelcomeVideoDescription] = useState('');
  const [moduleFileUrl, setModuleFileUrl] = useState('');
  const [moduleFileTitle, setModuleFileTitle] = useState('');
  const [moduleFileDescription, setModuleFileDescription] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [newModule, setNewModule] = useState<Module>({
    title: '',
    description: '',
    sort_order: 0,
    is_published: false,
  });
  const [newLesson, setNewLesson] = useState<Lesson>({
    module_id: 0,
    title: '',
    description: '',
    video_url: '',
    duration_minutes: 0,
    sort_order: 0,
    is_published: false,
  });

  useEffect(() => {
    const isAdminAuthenticated = sessionStorage.getItem('admin_authenticated');
    if (!isAdminAuthenticated) {
      navigate('/admin-login');
      return;
    }
    
    loadModules();
    loadLessons();
    loadFiles();
  }, [navigate]);

  const getAdminToken = () => {
    return token || 'admin_session_token';
  };

  const loadModules = async () => {
    try {
      const data = await admin.getModules(getAdminToken());
      if (!data.error) {
        setModules(data);
      }
    } catch (err) {
      console.error('Error loading modules:', err);
    }
  };

  const loadLessons = async () => {
    try {
      const data = await admin.getLessons(getAdminToken());
      if (!data.error) {
        setLessons(data);
      }
    } catch (err) {
      console.error('Error loading lessons:', err);
    }
  };

  const loadFiles = async () => {
    try {
      const data = await getFiles(getAdminToken());
      if (!data.error) {
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await admin.createModule(getAdminToken(), newModule);
      if (data.error) {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Успех', description: 'Модуль создан' });
        setNewModule({ title: '', description: '', sort_order: 0, is_published: false });
        loadModules();
      }
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    try {
      const data = await admin.updateModule(getAdminToken(), editingModule);
      if (data.error) {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Успех', description: 'Модуль обновлён' });
        setEditingModule(null);
        loadModules();
      }
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await admin.createLesson(getAdminToken(), newLesson);
      if (data.error) {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Успех', description: 'Урок создан' });
        setNewLesson({
          module_id: 0,
          title: '',
          description: '',
          video_url: '',
          duration_minutes: 0,
          sort_order: 0,
          is_published: false,
        });
        loadLessons();
      }
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    try {
      const data = await admin.updateLesson(getAdminToken(), editingLesson);
      if (data.error) {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Успех', description: 'Урок обновлён' });
        setEditingLesson(null);
        loadLessons();
      }
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    }
  };

  const handleSaveWelcomeVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!welcomeVideoUrl.trim()) {
      toast({ title: 'Ошибка', description: 'Введите ссылку на видео', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const data = await uploadFile(getAdminToken(), {
        title: welcomeVideoTitle || 'Видео-приветствие',
        description: welcomeVideoDescription,
        fileType: 'video/mp4',
        externalUrl: welcomeVideoUrl,
        isWelcomeVideo: true,
      });

      if (data.error) {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Успех', description: 'Видео-приветствие сохранено' });
        setWelcomeVideoUrl('');
        setWelcomeVideoTitle('');
        setWelcomeVideoDescription('');
        loadFiles();
      }
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveModuleFile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moduleFileUrl.trim()) {
      toast({ title: 'Ошибка', description: 'Введите ссылку на файл', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const data = await uploadFile(getAdminToken(), {
        title: moduleFileTitle || 'Файл модуля',
        description: moduleFileDescription,
        fileType: 'application/pdf',
        externalUrl: moduleFileUrl,
        moduleId: selectedModule,
        lessonId: selectedLesson,
      });

      if (data.error) {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Успех', description: 'Файл сохранен' });
        setModuleFileUrl('');
        setModuleFileTitle('');
        setModuleFileDescription('');
        loadFiles();
      }
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('Удалить этот файл?')) return;

    try {
      const data = await deleteFile(getAdminToken(), fileId);
      if (data.error) {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Успех', description: 'Файл удален' });
        loadFiles();
      }
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    }
  };

  const sendTestEmail = async () => {
    setSendingTestEmail(true);
    try {
      const response = await fetch('https://functions.poehali.dev/44b67bea-4c0b-4f2d-833a-f5adc60d9567', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'melni-v@yandex.ru',
          name: 'Владимир',
          password: '12341234'
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Письмо отправлено!', description: 'Проверьте почту melni-v@yandex.ru' });
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось отправить', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <AdminHeader 
        onLogout={logout} 
        onSendTestEmail={sendTestEmail}
        sendingTestEmail={sendingTestEmail}
      />

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="modules">Модули</TabsTrigger>
            <TabsTrigger value="lessons">Уроки</TabsTrigger>
            <TabsTrigger value="files">Файлы</TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            <ModulesTab
              modules={modules}
              newModule={newModule}
              editingModule={editingModule}
              onNewModuleChange={setNewModule}
              onEditingModuleChange={setEditingModule}
              onCreateModule={handleCreateModule}
              onUpdateModule={handleUpdateModule}
            />
          </TabsContent>

          <TabsContent value="lessons">
            <LessonsTab
              modules={modules}
              lessons={lessons}
              newLesson={newLesson}
              editingLesson={editingLesson}
              onNewLessonChange={setNewLesson}
              onEditingLessonChange={setEditingLesson}
              onCreateLesson={handleCreateLesson}
              onUpdateLesson={handleUpdateLesson}
            />
          </TabsContent>

          <TabsContent value="files">
            <FilesTab
              modules={modules}
              lessons={lessons}
              files={files}
              uploading={uploading}
              selectedModule={selectedModule}
              selectedLesson={selectedLesson}
              welcomeVideoUrl={welcomeVideoUrl}
              welcomeVideoTitle={welcomeVideoTitle}
              welcomeVideoDescription={welcomeVideoDescription}
              moduleFileUrl={moduleFileUrl}
              moduleFileTitle={moduleFileTitle}
              moduleFileDescription={moduleFileDescription}
              onSelectedModuleChange={setSelectedModule}
              onSelectedLessonChange={setSelectedLesson}
              onWelcomeVideoUrlChange={setWelcomeVideoUrl}
              onWelcomeVideoTitleChange={setWelcomeVideoTitle}
              onWelcomeVideoDescriptionChange={setWelcomeVideoDescription}
              onModuleFileUrlChange={setModuleFileUrl}
              onModuleFileTitleChange={setModuleFileTitle}
              onModuleFileDescriptionChange={setModuleFileDescription}
              onSaveWelcomeVideo={handleSaveWelcomeVideo}
              onSaveModuleFile={handleSaveModuleFile}
              onDeleteFile={handleDeleteFile}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;