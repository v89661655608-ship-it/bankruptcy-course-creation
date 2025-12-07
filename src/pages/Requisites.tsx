import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function Requisites() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <Icon name="ArrowLeft" size={20} />
            Вернуться на главную
          </Button>
        </nav>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Реквизиты</h1>
        
        <div className="space-y-6">
          <Card className="border-2">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Индивидуальный предприниматель</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="font-semibold text-muted-foreground">Полное наименование:</div>
                  <div className="md:col-span-2">Индивидуальный предприниматель Голосова Валентина Александровна</div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="font-semibold text-muted-foreground">Сокращенное наименование:</div>
                  <div className="md:col-span-2">ИП Голосова В.А.</div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="font-semibold text-muted-foreground">ИНН:</div>
                  <div className="md:col-span-2">505198617330</div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="font-semibold text-muted-foreground">ОГРНИП:</div>
                  <div className="md:col-span-2">322774600751927</div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="font-semibold text-muted-foreground">Почтовый адрес:</div>
                  <div className="md:col-span-2">119002, а/я 18, г. Москва</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Банковские реквизиты</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="font-semibold text-muted-foreground">Банк:</div>
                  <div className="md:col-span-2">ПАО Сбербанк</div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="font-semibold text-muted-foreground">Расчетный счет:</div>
                  <div className="md:col-span-2 font-mono">40802810038000317332</div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="font-semibold text-muted-foreground">Корр. счет:</div>
                  <div className="md:col-span-2 font-mono">30101810400000000225</div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="font-semibold text-muted-foreground">БИК:</div>
                  <div className="md:col-span-2 font-mono">044525225</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Контактная информация</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Icon name="Mail" className="text-accent" size={24} />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-muted-foreground">v89661655608@gmail.com</div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <Icon name="Phone" className="text-accent" size={24} />
                  <div>
                    <div className="font-semibold">Телефон</div>
                    <div className="text-muted-foreground">+7 966 165 56 08</div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <Icon name="MessageCircle" className="text-accent" size={24} />
                  <div>
                    <div className="font-semibold">Telegram</div>
                    <a 
                      href="https://t.me/bankrot_support_chat_bot" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      @bankrot_support_chat_bot
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Icon name="Info" className="text-primary flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold mb-2">Важная информация</h3>
                  <p className="text-muted-foreground text-sm">
                    Все реквизиты предоставлены выше. Для оформления документов и получения 
                    бухгалтерских справок свяжитесь с нами по электронной почте или телефону.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-8">
            <Button onClick={() => navigate("/")} size="lg" className="bg-accent hover:bg-accent/90 text-primary">
              Вернуться на главную страницу
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}