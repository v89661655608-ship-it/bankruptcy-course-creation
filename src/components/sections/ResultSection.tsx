import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function ResultSection() {
  const resultAnimation = useScrollAnimation();

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto max-w-6xl" ref={resultAnimation.ref}>
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/20 text-primary">Результат</Badge>
          <h3 className="text-4xl md:text-5xl font-bold mb-6">Вы по шагам вместе с нами подали заявление на банкротство</h3>
          <p className="text-2xl font-semibold text-accent mt-4">
            И списали все долги
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className={`border-2 border-primary/20 hover:border-primary transition-all hover:shadow-xl bg-white opacity-0 ${resultAnimation.isVisible ? 'animate-fade-in-up' : ''}`}>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Icon name="ClipboardCheck" className="text-primary" size={32} />
              </div>
              <div className="text-5xl font-bold text-primary mb-2">1</div>
              <h4 className="text-lg font-bold mb-2">Собрали документы</h4>
              <p className="text-sm text-muted-foreground">
                По готовым шаблонам и чек-листам
              </p>
            </CardContent>
          </Card>

          <Card className={`border-2 border-primary/20 hover:border-primary transition-all hover:shadow-xl bg-white opacity-0 ${resultAnimation.isVisible ? 'animate-fade-in-up delay-100' : ''}`}>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Icon name="FileSignature" className="text-primary" size={32} />
              </div>
              <div className="text-5xl font-bold text-primary mb-2">2</div>
              <h4 className="text-lg font-bold mb-2">Подали заявление</h4>
              <p className="text-sm text-muted-foreground">
                Самостоятельно в арбитражный суд
              </p>
            </CardContent>
          </Card>

          <Card className={`border-2 border-primary/20 hover:border-primary transition-all hover:shadow-xl bg-white opacity-0 ${resultAnimation.isVisible ? 'animate-fade-in-up delay-200' : ''}`}>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Icon name="Scale" className="text-primary" size={32} />
              </div>
              <div className="text-5xl font-bold text-primary mb-2">3</div>
              <h4 className="text-lg font-bold mb-2">Прошли процедуру</h4>
              <p className="text-sm text-muted-foreground">
                Взаимодействовали с судом и финансовым управляющим
              </p>
            </CardContent>
          </Card>

          <Card className={`border-2 border-accent/40 hover:border-accent transition-all hover:shadow-xl bg-gradient-to-br from-accent/10 to-white opacity-0 ${resultAnimation.isVisible ? 'animate-fade-in-up delay-300' : ''}`}>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Icon name="PartyPopper" className="text-accent" size={32} />
              </div>
              <div className="text-5xl font-bold text-accent mb-2">✓</div>
              <h4 className="text-lg font-bold mb-2">Списали долги!</h4>
              <p className="text-sm text-muted-foreground">
                Получили свободу от финансового бремени
              </p>
            </CardContent>
          </Card>
        </div>

        <div className={`mt-12 text-center bg-white rounded-2xl p-8 shadow-lg border-2 border-accent/20 opacity-0 ${resultAnimation.isVisible ? 'animate-fade-in-up delay-400' : ''}`}>
          <Icon name="TrendingUp" className="text-accent mx-auto mb-4" size={48} />
          <h4 className="text-2xl font-bold mb-4">С нами легко начать новую жизнь без долгов и переплат юристам</h4>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Процедура банкротства — это законный способ освободиться от финансовых обязательств. 
            С нашим курсом вы пройдёте весь путь самостоятельно и сэкономите на услугах юристов.
          </p>
          <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-6 max-w-2xl mx-auto">
            <p className="text-lg font-semibold text-primary mb-2">
              💰 Экономия до 150 000 ₽
            </p>
            <p className="text-sm text-muted-foreground">
              Услуги юристов по банкротству стоят от 50 000 до 150 000 рублей. 
              С нашим курсом вы пройдёте всю процедуру самостоятельно за 3 900 ₽.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}