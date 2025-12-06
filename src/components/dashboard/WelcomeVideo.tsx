import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface WelcomeVideoProps {
  files: any[];
}

export default function WelcomeVideo({ files }: WelcomeVideoProps) {
  console.log('WelcomeVideo - All files:', files);
  const welcomeVideos = files.filter(f => f.isWelcomeVideo);
  console.log('WelcomeVideo - Welcome videos found:', welcomeVideos);
  const [playbackRate, setPlaybackRate] = useState<{[key: number]: number}>({});

  if (welcomeVideos.length === 0) {
    console.log('WelcomeVideo - No welcome videos, returning null');
    return null;
  }

  const changeSpeed = (fileId: number, videoElement: HTMLVideoElement | null) => {
    if (!videoElement) return;
    const currentRate = playbackRate[fileId] || 1.0;
    const newRate = currentRate === 1.0 ? 1.2 : 1.0;
    videoElement.playbackRate = newRate;
    setPlaybackRate({...playbackRate, [fileId]: newRate});
  };

  return (
    <Card className="mb-8 border-0 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-accent/20 to-primary/20 p-6 border-b">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Icon name="Play" size={24} className="text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Добро пожаловать!</h3>
            <p className="text-muted-foreground">Начните с приветственного видео</p>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        {welcomeVideos.map((file) => {
          const videoId = `welcome-video-${file.id}`;
          const currentRate = playbackRate[file.id] || 1.0;
          return (
            <div key={file.id} className="space-y-4">
              <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden shadow-xl relative">
                <video 
                  id={videoId}
                  controls 
                  className="w-full h-full"
                >
                  <source src={file.fileUrl} type={file.fileType} />
                  Ваш браузер не поддерживает видео.
                </video>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeSpeed(file.id, document.getElementById(videoId) as HTMLVideoElement)}
                  className="gap-2"
                >
                  <Icon name="Gauge" size={16} />
                  Скорость: {currentRate}x
                </Button>
              </div>
              {file.description && (
                <p className="text-muted-foreground">{file.description}</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}