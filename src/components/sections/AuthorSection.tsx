import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

export default function AuthorSection() {
  return (
    <section id="author" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <img 
            src="https://cdn.poehali.dev/files/c4d81d00-b8ed-4563-a70d-fb71c0287993.png"
            alt="Арбитражный управляющий Валентина Голосова"
            className="rounded-2xl shadow-xl"
          />
          <div>
            <Badge className="mb-4">Об авторе</Badge>
            <h3 className="text-4xl font-bold mb-6">Валентина Голосова</h3>
            <p className="text-xl mb-6 font-semibold text-primary">Арбитражный управляющий с опытом более 10 лет</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex gap-3">
                <Icon name="CheckCircle2" className="text-accent flex-shrink-0 mt-1" size={24} />
                <p className="text-muted-foreground">Более 500 успешно завершенных процедур по банкротству</p>
              </div>
              <div className="flex gap-3">
                <Icon name="CheckCircle2" className="text-accent flex-shrink-0 mt-1" size={24} />
                <p className="text-muted-foreground">Член Ассоциации арбитражных управляющих</p>
              </div>
              <div className="flex gap-3">
                <Icon name="CheckCircle2" className="text-accent flex-shrink-0 mt-1" size={24} />
                <p className="text-muted-foreground">Автор популярного блога о банкротстве физических лиц</p>
              </div>
              <div className="flex gap-3">
                <Icon name="CheckCircle2" className="text-accent flex-shrink-0 mt-1" size={24} />
                <p className="text-muted-foreground">Эксперт в области несостоятельности граждан</p>
              </div>
            </div>

            <blockquote className="border-l-4 border-accent pl-6 italic text-lg text-muted-foreground">
              "Я создала эту платформу, чтобы помочь людям самостоятельно пройти процедуру банкротства и не переплачивать юристам. Все знания, которые я накопила за годы практики, теперь доступны каждому."
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}