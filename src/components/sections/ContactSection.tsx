import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-4xl text-center">
        <Badge className="mb-4">Контакты</Badge>
        <h3 className="text-4xl font-bold mb-6">Остались вопросы?</h3>
        <p className="text-xl text-muted-foreground mb-8">
          Свяжитесь со мной любым удобным способом
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            onClick={() => window.open('https://t.me/bankrot_support_chat_bot', '_blank')}
          >
            <Icon name="Send" size={20} />
            Telegram
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <Icon name="Mail" size={20} />
            v89661655608@gmail.com
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            onClick={() => window.open('https://wa.me/79661655608', '_blank')}
          >
            <Icon name="Phone" size={20} />
            +7 966 165 56 08
          </Button>
        </div>
      </div>
    </section>
  );
}