import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";

export default function PricingSection() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="price" className="py-20 px-4 bg-gradient-to-b from-primary to-primary/90 text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-red-500 text-white px-6 py-3 rounded-full mb-6 animate-pulse">
            <Icon name="Clock" size={24} />
            <span className="font-bold text-lg">
              Осталось {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
          <Badge className="mb-4 bg-accent text-primary">Специальное предложение</Badge>
          <h3 className="text-4xl md:text-5xl font-bold mb-6">Выберите свой пакет</h3>
          <p className="text-xl opacity-90">
            🔥 Цены действуют ограниченное время
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-accent transition-all hover:shadow-2xl">
            <CardContent className="pt-12 pb-12">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-primary/10 text-primary">Самостоятельно</Badge>
                <div className="text-5xl font-bold mb-2 text-primary">3 900 ₽</div>
                <p className="text-muted-foreground">Доступ на 3 месяца</p>
              </div>

              <Separator className="mb-8" />

              <div className="space-y-3 mb-8">
                <div className="flex gap-3">
                  <Icon name="Check" className="text-accent flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">7 подробных видеомодулей</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-accent flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Все шаблоны документов</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-accent flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Пошаговые инструкции</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-accent flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Авторские лайфхаки по банкротству</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-accent flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Доступ на 3 месяца</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-accent flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Обновления материалов в течение срока</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-accent hover:bg-accent/90 text-primary font-bold py-6"
                onClick={() => navigate('/payment-form?product=course')}
              >
                Купить курс
              </Button>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <a href="/oferta" target="_blank" className="underline hover:text-primary">
                  офертой
                </a>,{' '}
                <a href="/privacy" target="_blank" className="underline hover:text-primary">
                  политикой конфиденциальности
                </a>{' '}
                и{' '}
                <a href="/personal-data-consent" target="_blank" className="underline hover:text-primary">
                  обработкой перс. данных
                </a>
              </p>

              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-semibold flex items-center gap-2">
                  <Icon name="Shield" size={16} />
                  💰 Гарантия возврата в течение 3 дней*
                </p>
                <p className="text-[10px] text-green-600 mt-1">
                  *При просмотре менее 10% материалов курса
                </p>
              </div>

              <p className="text-sm text-muted-foreground text-center mt-4">
                Для простых случаев банкротства
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-2xl">
            <CardContent className="pt-12 pb-12">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-purple-100 text-purple-700">Только чат</Badge>
                <div className="text-5xl font-bold mb-2 text-purple-600">3 999 ₽</div>
                <p className="text-muted-foreground">Доступ на 1 месяц</p>
              </div>

              <Separator className="mb-8" />

              <div className="space-y-3 mb-8">
                <div className="flex gap-3">
                  <Icon name="Check" className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Личный чат с юристом</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Неограниченные консультации</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Проверка документов</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Помощь с ходатайствами</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Ответ в течение 24 часов</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Полная конфиденциальность</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6"
                onClick={() => navigate('/payment-form?product=chat')}
              >
                Купить доступ к чату
              </Button>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <a href="/oferta" target="_blank" className="underline hover:text-primary">
                  офертой
                </a>,{' '}
                <a href="/privacy" target="_blank" className="underline hover:text-primary">
                  политикой конфиденциальности
                </a>{' '}
                и{' '}
                <a href="/personal-data-consent" target="_blank" className="underline hover:text-primary">
                  обработкой перс. данных
                </a>
              </p>

              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-semibold flex items-center gap-2">
                  <Icon name="Shield" size={16} />
                  💰 Гарантия возврата в течение 3 дней*
                </p>
                <p className="text-[10px] text-green-600 mt-1">
                  *При просмотре менее 10% материалов курса
                </p>
              </div>

              <p className="text-sm text-muted-foreground text-center mt-4">
                <strong>Только для владельцев курса</strong> — докупите поддержку юриста
              </p>
            </CardContent>
          </Card>

          <Card className="border-4 border-green-500 hover:shadow-2xl transition-all relative bg-gradient-to-br from-green-50 to-white">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-green-500 text-white font-bold px-6 py-1">🔥 Выгода 1 900 ₽</Badge>
            </div>
            <CardContent className="pt-12 pb-12">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-green-100 text-green-700 border-green-300">Комбо-пакет</Badge>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-2xl text-muted-foreground line-through whitespace-nowrap">7 899 ₽</span>
                  <span className="text-5xl font-bold text-green-600 whitespace-nowrap">5 999 ₽</span>
                </div>
                <p className="text-muted-foreground">Курс + Месяц чата</p>
              </div>

              <Separator className="mb-8" />

              <div className="space-y-3 mb-8">
                <div className="flex gap-3">
                  <Icon name="Check" className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm font-semibold">Все из пакета "Самостоятельно"</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">7 подробных видеомодулей</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Все шаблоны документов</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Plus" className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm font-semibold">Месяц доступа к чату с юристами</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Неограниченные консультации</span>
                </div>
                <div className="flex gap-3">
                  <Icon name="Check" className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-sm">Проверка документов юристом</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6"
                onClick={() => navigate('/payment-form?product=combo')}
              >
                Купить комбо со скидкой
              </Button>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <a href="/oferta" target="_blank" className="underline hover:text-primary">
                  офертой
                </a>,{' '}
                <a href="/privacy" target="_blank" className="underline hover:text-primary">
                  политикой конфиденциальности
                </a>{' '}
                и{' '}
                <a href="/personal-data-consent" target="_blank" className="underline hover:text-primary">
                  обработкой перс. данных
                </a>
              </p>

              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-semibold flex items-center gap-2">
                  <Icon name="Shield" size={16} />
                  💰 Гарантия возврата в течение 24 часов*
                </p>
                <p className="text-[10px] text-green-600 mt-1">
                  *При отсутствии общения с юристом
                </p>
              </div>

              <p className="text-sm text-muted-foreground text-center mt-4">
                🔥 Самый популярный пакет! Экономия 1 999 ₽
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
          <h4 className="text-2xl font-bold mb-6 text-center">Часто задаваемые вопросы</h4>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="HelpCircle" size={18} className="text-accent" />
                Что если курс мне не подойдет?
              </p>
              <p className="text-sm opacity-90 pl-7">
                Вернем деньги в течение 3 дней, если вы просмотрели менее 10% материалов. Для чата — возврат в течение 24 часов при отсутствии общения с юристом.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="HelpCircle" size={18} className="text-accent" />
                Когда я получу доступ к курсу?
              </p>
              <p className="text-sm opacity-90 pl-7">
                Сразу после оплаты! Все материалы будут доступны в личном кабинете.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="HelpCircle" size={18} className="text-accent" />
                Можно ли купить только чат без курса?
              </p>
              <p className="text-sm opacity-90 pl-7">
                Да, доступ к чату с юристами можно купить отдельно за 3 999 ₽ на месяц.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}