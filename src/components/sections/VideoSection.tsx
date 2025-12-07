import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useRef, useState } from "react";

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Video play error:', error);
      });
      setShowPlayButton(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4">Как это работает</Badge>
            <h3 className="text-4xl md:text-5xl font-bold mb-6">Узнайте о курсе подробнее</h3>
            <p className="text-lg text-muted-foreground mb-8">
              Видео о том, как наш курс поможет вам пройти банкротство самостоятельно и сэкономить до 150&nbsp;000&nbsp;₽
            </p>
            
            <div className="space-y-4">
              <Card className="border-l-4 border-l-accent">
                <CardContent className="p-4 flex items-start gap-3">
                  <Icon name="Play" className="text-accent mt-1" size={20} />
                  <div>
                    <p className="font-semibold">7 видеомодулей</p>
                    <p className="text-sm text-muted-foreground">Пошаговые инструкции на каждый этап</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-accent">
                <CardContent className="p-4 flex items-start gap-3">
                  <Icon name="FileText" className="text-accent mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Готовые шаблоны</p>
                    <p className="text-sm text-muted-foreground">Все документы для суда и кредиторов</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-accent">
                <CardContent className="p-4 flex items-start gap-3">
                  <Icon name="Users" className="text-accent mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Поддержка юристов</p>
                    <p className="text-sm text-muted-foreground">Опционально: чат с профессионалами</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl group">
              <video 
                ref={videoRef}
                className="w-full h-full object-cover"
                controls
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onPlay={() => {
                  setIsPlaying(true);
                  setShowPlayButton(false);
                }}
                onPause={() => setIsPlaying(false)}
              >
                <source src="https://storage.yandexcloud.net/poehalidev-user-files/%D0%A1%D0%B0%D0%B9%D1%82.MOV" type="video/quicktime" />
                <source src="https://storage.yandexcloud.net/poehalidev-user-files/%D0%A1%D0%B0%D0%B9%D1%82.MOV" type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/10 via-transparent to-black/10"></div>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/10"></div>
              {showPlayButton && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors cursor-pointer"
                  onClick={handlePlayClick}
                >
                  <div className="bg-white/90 rounded-full p-6 group-hover:scale-110 transition-transform">
                    <Icon name="Play" size={48} className="text-primary" />
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              *не является офертой, автор оставляет за собой право изменить цены, актуальные цены в карточке оплаты и в договоре оферты
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}