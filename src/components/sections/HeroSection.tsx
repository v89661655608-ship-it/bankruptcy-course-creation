import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  user: any;
  scrollToSection: (id: string) => void;
}

export default function HeroSection({ user, scrollToSection }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <Badge className="mb-4 bg-accent/20 text-accent-foreground border-accent">Эксклюзивная платформа</Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Банкротство физического лица
              <span className="block text-accent mt-2">без юристов</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
              Пошаговая инструкция по самостоятельной подаче на банкротство с профессиональной поддержкой юристов. Получите знания и защиту своих интересов.
            </p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold text-green-900 mb-1">Автоматизированный конструктор документов</h3>
                  <p className="text-sm text-green-800">
                    Система автоматически заполнит заявление на банкротство на основе ваших данных — быстро, точно и без ошибок!
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => user ? navigate('/dashboard') : navigate('/payment')} size="lg" className="bg-accent hover:bg-accent/90 text-primary font-semibold text-lg px-8 py-6">
                {user ? 'Получить доступ' : 'Получить курс за 3 900 ₽'}
              </Button>
              <Button onClick={() => scrollToSection("program")} variant="outline" size="lg" className="text-lg px-8 py-6">
                Узнать больше
              </Button>
            </div>
            
            <div className="mt-6 bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 rounded-xl p-4 border-2 border-accent/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Полный комплект</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary whitespace-nowrap">5 999 ₽</p>
                  <p className="text-xs text-muted-foreground">курс + месяц поддержки персонального юриста</p>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Вместо юриста за</p>
                  <p className="text-xl sm:text-2xl font-bold text-muted-foreground line-through whitespace-nowrap">50 000 ₽</p>
                </div>
              </div>
            </div>
            <div className="flex gap-8 mt-8">
              <div>
                <div className="text-3xl font-bold text-primary">10+</div>
                <div className="text-sm text-muted-foreground">лет опыта</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">успешных дел</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">легально</div>
              </div>
            </div>
          </div>
          <div className="animate-scale-in">
            <img 
              src="https://cdn.poehali.dev/files/bddaed2a-cd53-40bc-8c52-c6467fafdab8.png"
              alt="Голосова Валентина - арбитражный управляющий"
              className="rounded-2xl shadow-2xl w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}