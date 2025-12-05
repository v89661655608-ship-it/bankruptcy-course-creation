import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

interface ChatSupportSectionProps {
  user: any;
}

export default function ChatSupportSection({ user }: ChatSupportSectionProps) {
  const navigate = useNavigate();

  return (
    <section id="support" className="py-20 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-700 text-base px-4 py-1">
            Профессиональная поддержка
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Личный юрист всегда на связи
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Вы не остаётесь один на один с проблемами. Наши опытные юристы сопровождают вас на каждом этапе банкротства
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="MessageCircle" className="text-purple-600" size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3">Ответ в течение 24 часов</h4>
              <p className="text-muted-foreground text-sm">
                Гарантируем быстрый отклик на все ваши вопросы. Чаще всего отвечаем в течение нескольких часов
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Shield" className="text-blue-600" size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3">Полная конфиденциальность</h4>
              <p className="text-muted-foreground text-sm">
                Личный защищённый чат только между вами и юристом. Никаких публичных обсуждений
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" className="text-indigo-600" size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3">Опыт 500+ дел</h4>
              <p className="text-muted-foreground text-sm">
                Наши юристы успешно провели через банкротство сотни клиентов с разными ситуациями
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Icon name="MessageSquare" className="text-white" size={24} />
                </div>
                <div>
                  <Badge className="bg-purple-100 text-purple-700 mb-1">3 999 ₽/месяц</Badge>
                  <h4 className="text-2xl font-bold">Юридическая поддержка</h4>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Прямая связь с юристом через защищённый чат в личном кабинете. Задавайте любые вопросы — мы всегда поможем.
              </p>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <Icon name="Sparkles" className="text-purple-600 mt-1" size={24} />
                  <div>
                    <p className="font-bold text-purple-900 mb-1">Невероятная экономия!</p>
                    <p className="text-sm text-muted-foreground">
                      Одна консультация юриста — <strong className="text-red-600">от 5 000 ₽</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      У нас — <strong className="text-green-600">неограниченные консультации</strong> за 3 999 ₽/месяц
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-purple-600" size={16} />
                  </div>
                  <span className="text-sm">Проверим все ваши заявления и документы</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-purple-600" size={16} />
                  </div>
                  <span className="text-sm">Подскажем, как действовать при оспаривании сделок</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-purple-600" size={16} />
                  </div>
                  <span className="text-sm">Поможем составить ходатайства в суд</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-purple-600" size={16} />
                  </div>
                  <span className="text-sm">Ответим на вопросы по работе с финуправляющим</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-purple-600" size={16} />
                  </div>
                  <span className="text-sm">Полная конфиденциальность — только вы и юрист</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-purple-600" size={16} />
                  </div>
                  <span className="text-sm">Доступ с любого устройства — компьютер или телефон</span>
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Tag" className="text-purple-600" size={24} />
                  <p className="font-bold text-purple-900">Доступен только для владельцев курса</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Докупите чат отдельно за 3 999 ₽/мес или купите выгодный комбо курс+чат за 5 999 ₽ (экономия 1 900 ₽)
                </p>
              </div>

              <Button 
                onClick={() => navigate('/payment-form?product=chat')} 
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-base shadow-lg"
              >
                <Icon name="MessageCircle" size={20} className="mr-2" />
                Купить доступ за 3 999 ₽
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Icon name="UserCheck" className="text-white" size={24} />
                </div>
                <div>
                  <Badge className="bg-blue-100 text-blue-700 mb-1">Премиум</Badge>
                  <h4 className="text-2xl font-bold">Персональное сопровождение</h4>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Личный юрист ведёт ваше дело от подачи заявления до полного списания долгов. Максимальная защита ваших интересов.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-blue-600" size={16} />
                  </div>
                  <span className="text-sm font-medium">Личный юрист на весь период банкротства</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-blue-600" size={16} />
                  </div>
                  <span className="text-sm font-medium">Подготовка всех документов и заявлений</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-blue-600" size={16} />
                  </div>
                  <span className="text-sm font-medium">Представительство в арбитражном суде</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-blue-600" size={16} />
                  </div>
                  <span className="text-sm font-medium">Защита от субсидиарной ответственности</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-blue-600" size={16} />
                  </div>
                  <span className="text-sm font-medium">Работа с финансовым управляющим</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-blue-600" size={16} />
                  </div>
                  <span className="text-sm font-medium">Оспаривание незаконных требований кредиторов</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-blue-600" size={16} />
                  </div>
                  <span className="text-sm font-medium">Контроль всех этапов процедуры</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" className="text-blue-600" size={16} />
                  </div>
                  <span className="text-sm font-medium">Сопровождение до полного завершения дела</span>
                </div>
              </div>

              <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-5 mb-6">
                <p className="font-bold text-blue-900 mb-2">💼 Для сложных случаев</p>
                <p className="text-sm text-blue-800">
                  Рекомендуем, если у вас: крупные активы, сделки под угрозой оспаривания, бизнес-долги, риск субсидиарки
                </p>
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">Стоимость рассчитывается индивидуально</p>
                <p className="text-xs text-muted-foreground">в зависимости от сложности дела</p>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-12 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-base transition-all"
                onClick={() => window.open('https://t.me/crashbusiness', '_blank')}
              >
                <Icon name="Send" size={20} className="mr-2" />
                Связаться для консультации
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
            <CardContent className="py-8">
              <Icon name="Award" className="text-purple-600 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-3">Гарантия качества</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Мы не бросаем клиентов после оплаты. Каждый вопрос получает профессиональный ответ от практикующего юриста. 
                Ваш успех в банкротстве — наша репутация.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}