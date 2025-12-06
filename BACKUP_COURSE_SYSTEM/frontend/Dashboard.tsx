import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { course, getFiles } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProgressCard from '@/components/dashboard/ProgressCard';
import WelcomeVideo from '@/components/dashboard/WelcomeVideo';
import CourseModule from '@/components/dashboard/CourseModule';
import ChatUpsellBanner from '@/components/dashboard/ChatUpsellBanner';
import ChangePasswordModal from '@/components/dashboard/ChangePasswordModal';

interface Material {
  id: number;
  title: string;
  file_url: string;
  file_type: string;
}

interface CourseFile {
  id: number;
  title: string;
  description: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at?: string;
  module_id?: number;
  lesson_id?: number;
  is_welcome_video?: boolean;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  progress: {
    completed: boolean;
    watch_time_seconds: number;
  };
  materials: Material[];
  files?: CourseFile[];
}

interface Module {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
  materials: Material[];
  files?: CourseFile[];
}

export const Dashboard = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const progressIntervals = useRef<{ [key: number]: NodeJS.Timeout }>({});

  const getToken = () => {
    const isAdminViewing = sessionStorage.getItem('admin_authenticated');
    return isAdminViewing ? 'admin_session_token' : token;
  };

  useEffect(() => {
    const isAdminViewing = sessionStorage.getItem('admin_authenticated');
    if (!token && !isAdminViewing) {
      navigate('/login');
      return;
    }
    
    loadCourseContent();
    loadCourseFiles();
    
    if (user && !(user as any).password_changed_by_user && !isAdminViewing) {
      setTimeout(() => {
        setShowPasswordModal(true);
      }, 2000);
    }
  }, [token, navigate]);

  const loadCourseContent = async () => {
    try {
      const currentToken = getToken();
      if (!currentToken) return;
      const data = await course.getContent(currentToken);
      if (data.error) {
        setError(data.error);
      } else {
        console.log('Course modules data:', data);
        data.forEach((module: Module) => {
          if (module.files && module.files.length > 0) {
            console.log(`Module "${module.title}" files:`, module.files);
          }
          module.lessons.forEach((lesson: Lesson) => {
            if (lesson.files && lesson.files.length > 0) {
              console.log(`Lesson "${lesson.title}" files:`, lesson.files);
            }
          });
        });
        setModules(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    let total = 0;
    let completed = 0;
    modules.forEach(module => {
      module.lessons.forEach(lesson => {
        total++;
        if (lesson.progress?.completed) completed++;
      });
    });
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const markLessonComplete = async (lessonId: number) => {
    try {
      const currentToken = getToken();
      if (!currentToken) return;
      await course.updateProgress(currentToken, lessonId, true, 0);
      loadCourseContent();
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleVideoPlay = (lessonId: number) => {
    if (progressIntervals.current[lessonId]) {
      clearInterval(progressIntervals.current[lessonId]);
    }
    
    progressIntervals.current[lessonId] = setInterval(async () => {
      const video = videoRefs.current[lessonId];
      if (video && !video.paused) {
        const watchTime = Math.floor(video.currentTime);
        const duration = Math.floor(video.duration);
        const completed = watchTime >= duration * 0.9;
        
        setModules(prevModules => 
          prevModules.map(module => ({
            ...module,
            lessons: module.lessons.map(lesson =>
              lesson.id === lessonId
                ? {
                    ...lesson,
                    progress: {
                      completed,
                      watch_time_seconds: watchTime,
                    },
                  }
                : lesson
            ),
          }))
        );
        
        try {
          const currentToken = getToken();
          if (currentToken) {
            await course.updateProgress(currentToken, lessonId, completed, watchTime);
            if (completed) {
              clearInterval(progressIntervals.current[lessonId]);
            }
          }
        } catch (err) {
          console.error('Error updating progress:', err);
        }
      }
    }, 5000);
  };

  const handleVideoPause = (lessonId: number) => {
    if (progressIntervals.current[lessonId]) {
      clearInterval(progressIntervals.current[lessonId]);
    }
    
    const video = videoRefs.current[lessonId];
    if (video) {
      const watchTime = Math.floor(video.currentTime);
      const duration = Math.floor(video.duration);
      const completed = watchTime >= duration * 0.9;
      
      setModules(prevModules => 
        prevModules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson =>
            lesson.id === lessonId
              ? {
                  ...lesson,
                  progress: {
                    completed,
                    watch_time_seconds: watchTime,
                  },
                }
              : lesson
          ),
        }))
      );
      
      const currentToken = getToken();
      if (currentToken) {
        course.updateProgress(currentToken, lessonId, completed, watchTime).catch(err => {
          console.error('Error saving progress on pause:', err);
        });
      }
    }
  };

  const handleVideoEnded = async (lessonId: number) => {
    if (progressIntervals.current[lessonId]) {
      clearInterval(progressIntervals.current[lessonId]);
    }
    
    const video = videoRefs.current[lessonId];
    if (video) {
      const watchTime = Math.floor(video.duration);
      
      setModules(prevModules => 
        prevModules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson =>
            lesson.id === lessonId
              ? {
                  ...lesson,
                  progress: {
                    completed: true,
                    watch_time_seconds: watchTime,
                  },
                }
              : lesson
          ),
        }))
      );
      
      try {
        const currentToken = getToken();
        if (currentToken) {
          await course.updateProgress(currentToken, lessonId, true, watchTime);
        }
      } catch (err) {
        console.error('Error marking as completed:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      Object.values(progressIntervals.current).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, []);

  const loadCourseFiles = async () => {
    try {
      const currentToken = getToken();
      if (!currentToken) return;
      console.log('Dashboard - Loading files with token:', currentToken.substring(0, 20) + '...');
      const data = await getFiles(currentToken);
      console.log('Dashboard - Files response:', data);
      if (!data.error) {
        console.log('Dashboard - Setting files:', data.files);
        setFiles(data.files || []);
      } else {
        console.error('Dashboard - Files error:', data.error);
      }
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium">Загрузка курса...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Icon name="AlertCircle" size={24} />
              Доступ ограничен
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Чтобы получить доступ к материалам курса, необходимо его приобрести.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Перейти к покупке курса
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const completedLessons = modules.reduce((acc, mod) => 
    acc + mod.lessons.filter(l => l.progress?.completed).length, 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DashboardHeader user={user} onLogout={logout} />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ProgressCard 
          progress={calculateProgress()} 
          completedLessons={completedLessons} 
          totalLessons={totalLessons} 
        />

        <WelcomeVideo files={files} />

        <ChatUpsellBanner user={user} />

        <div className="space-y-6">
          {modules.map((module, moduleIndex) => (
            <CourseModule
              key={module.id}
              module={module}
              moduleIndex={moduleIndex}
              videoRefs={videoRefs}
              onVideoPlay={handleVideoPlay}
              onVideoPause={handleVideoPause}
              onVideoEnded={handleVideoEnded}
              onMarkComplete={markLessonComplete}
            />
          ))}
        </div>
      </div>

      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        token={token!}
      />
    </div>
  );
};

export default Dashboard;
