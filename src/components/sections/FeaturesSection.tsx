import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface FeaturesSectionProps {
  scrollToSection: (id: string) => void;
}

export default function FeaturesSection({ scrollToSection }: FeaturesSectionProps) {
  return (
    <section id="about" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge className="mb-4">О курсе</Badge>
          <h3 className="text-4xl md:text-5xl font-bold mb-6">Что вы получите</h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Полный комплект знаний и документов для самостоятельного банкротства
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <Icon name="Sparkles" className="text-green-600" size={32} />
              </div>
              <h4 className="text-2xl font-bold mb-4">Конструктор документов</h4>
              <p className="text-muted-foreground">
                Автоматическая генерация заявления на банкротство на основе ваших данных
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent transition-all hover:shadow-lg">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
                <Icon name="Video" className="text-accent" size={32} />
              </div>
              <h4 className="text-2xl font-bold mb-4">Видеоуроки</h4>
              <p className="text-muted-foreground">
                Пошаговые видеоинструкции по каждому этапу процедуры банкротства
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent transition-all hover:shadow-lg">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
                <Icon name="FileText" className="text-accent" size={32} />
              </div>
              <h4 className="text-2xl font-bold mb-4">Шаблоны документов</h4>
              <p className="text-muted-foreground">
                Готовые шаблоны всех необходимых заявлений и документов для суда
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent transition-all hover:shadow-lg">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
                <Icon name="BookOpen" className="text-accent" size={32} />
              </div>
              <h4 className="text-2xl font-bold mb-4">Инструкции</h4>
              <p className="text-muted-foreground">
                Детальные письменные инструкции с примерами и объяснениями
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30 hover:border-primary transition-all hover:shadow-lg bg-gradient-to-br from-primary/5 to-white">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Icon name="ShieldCheck" className="text-primary" size={32} />
              </div>
              <h4 className="text-2xl font-bold mb-4">Проверка юристами</h4>
              <p className="text-muted-foreground mb-4">
                При покупке сопровождения — профессиональная проверка ваших документов
              </p>
              <button 
                onClick={() => scrollToSection('price')} 
                className="text-primary hover:text-accent font-semibold text-sm flex items-center gap-1 transition-colors"
              >
                Подробнее <Icon name="ArrowRight" size={16} />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}