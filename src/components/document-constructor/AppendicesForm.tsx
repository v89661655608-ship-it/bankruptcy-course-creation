import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { AppendicesData, AppendixItem } from "./types";
import { useToast } from "@/hooks/use-toast";

interface AppendicesFormProps {
  onSubmit: (data: AppendicesData) => void;
  initialData?: AppendicesData;
}

const DEFAULT_APPENDICES: Omit<AppendixItem, 'id'>[] = [
  { title: "Почтовые квитанции о направлении копии настоящего заявления кредиторам", pages: "", isIncluded: true },
  { title: "Документ, подтверждающий уплату государственной пошлины", pages: "", isIncluded: true },
  { title: "Документ, подтверждающий внесение денежных средств на выплату вознаграждения финансовому управляющему в депозит арбитражного суда", pages: "", isIncluded: true },
  { title: "Копия паспорта (всех страниц)", pages: "", isIncluded: true },
  { title: "Копия ИНН (свидетельства о постановке на учет в налоговом органе) (при наличии)", pages: "", isIncluded: true },
  { title: "Копия СНИЛС", pages: "", isIncluded: true },
  { title: "Копии справок, выданных кредиторами о задолженности", pages: "", isIncluded: true },
  { title: "Копии кредитных договоров", pages: "", isIncluded: true },
  { title: "Документы, подтверждающие наличие или отсутствие у гражданина статуса индивидуального предпринимателя, полученные не ранее чем за пять рабочих дней до даты подачи в суд заявления", pages: "", isIncluded: true },
  { title: "Список кредиторов и должников гражданина по форме Приложения № 1 к Приказу Минэкономразвития России от 05.08.2015 № 530", pages: "", isIncluded: true },
  { title: "Опись имущества гражданина по форме Приложения № 2 к Приказу Минэкономразвития России от 05.08.2015 № 530", pages: "", isIncluded: true },
  { title: "Справки 2 НДФЛ за трехлетний период, предшествующий дате подачи заявления о признании гражданина банкротом", pages: "", isIncluded: true },
  { title: "Копии документов, подтверждающих право собственности гражданина на имущество (при наличии)", pages: "", isIncluded: false },
  { title: "Копии документов о совершавшихся гражданином в течение трех лет до даты подачи заявления сделках с недвижимым имуществом, транспортными средствами и сделках на сумму свыше трехсот тысяч рублей (при наличии)", pages: "", isIncluded: false },
  { title: "Копия свидетельства пенсионного страхования (при наличии)", pages: "", isIncluded: false },
  { title: "Копия решения о признании гражданина безработным, выданная государственной службой занятости населения (при наличии)", pages: "", isIncluded: false },
  { title: "Копия свидетельства о заключении брака (при наличии заключенного и не расторгнутого на дату подачи заявления брака)", pages: "", isIncluded: false },
  { title: "Копия свидетельства о расторжении брака, если оно выдано в течение трех лет до даты подачи заявления (при наличии)", pages: "", isIncluded: false },
  { title: "Копия брачного договора (при наличии)", pages: "", isIncluded: false },
  { title: "Копия соглашения или судебного акта о разделе общего имущества супругов, соответственно заключенного и принятого в течение трех лет до даты подачи заявления (при наличии)", pages: "", isIncluded: false },
  { title: "Копия свидетельства о рождении ребенка, если гражданин является его родителем, усыновителем или опекуном", pages: "", isIncluded: false },
];

export default function AppendicesForm({ onSubmit, initialData }: AppendicesFormProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<AppendixItem[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [customPages, setCustomPages] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('documentConstructorData');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.appendicesData?.items) {
        setItems(data.appendicesData.items);
        return;
      }
    }
    
    if (initialData?.items) {
      setItems(initialData.items);
    } else {
      setItems(DEFAULT_APPENDICES.map((item, idx) => ({
        ...item,
        id: `default-${idx}`
      })));
    }
  }, [initialData]);

  const handleToggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isIncluded: !item.isIncluded } : item
    ));
  };

  const handleUpdatePages = (id: string, pages: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, pages } : item
    ));
  };

  const handleAddCustom = () => {
    if (!customTitle.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название приложения',
        variant: 'destructive'
      });
      return;
    }

    const newItem: AppendixItem = {
      id: `custom-${Date.now()}`,
      title: customTitle,
      pages: customPages,
      isIncluded: true
    };

    setItems([...items, newItem]);
    setCustomTitle("");
    setCustomPages("");
    
    toast({
      title: 'Добавлено',
      description: 'Приложение добавлено в список'
    });
  };

  const handleRemoveCustom = (id: string) => {
    if (!id.startsWith('custom-')) return;
    setItems(items.filter(item => item.id !== id));
    toast({
      title: 'Удалено',
      description: 'Приложение удалено из списка'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: AppendicesData = { items };
    onSubmit(data);
    toast({
      title: 'Сохранено',
      description: 'Список приложений успешно сохранен'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-lg p-4 bg-muted/50">
        <h3 className="font-medium mb-3">Список приложений к заявлению</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Отметьте приложения, которые будут включены в заявление, и укажите количество страниц
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-start gap-3 p-3 border rounded bg-background">
              <Checkbox
                id={`item-${item.id}`}
                checked={item.isIncluded}
                onCheckedChange={() => handleToggleItem(item.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <Label 
                  htmlFor={`item-${item.id}`}
                  className="text-sm font-normal cursor-pointer block"
                >
                  <span className="font-medium">{index + 1}.</span> {item.title}
                </Label>
                {item.isIncluded && (
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      type="text"
                      value={item.pages}
                      onChange={(e) => handleUpdatePages(item.id, e.target.value)}
                      placeholder="Кол-во листов (например: 3 листа)"
                      className="max-w-xs text-sm"
                    />
                  </div>
                )}
              </div>
              {item.id.startsWith('custom-') && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCustom(item.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Icon name="X" size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-muted/50">
        <h3 className="font-medium mb-3">Добавить свое приложение</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="customTitle">Название приложения</Label>
            <Input
              id="customTitle"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Например: Копия трудовой книжки"
            />
          </div>
          <div>
            <Label htmlFor="customPages">Количество листов</Label>
            <Input
              id="customPages"
              value={customPages}
              onChange={(e) => setCustomPages(e.target.value)}
              placeholder="Например: 5 листов"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddCustom}
            variant="outline"
            className="w-full"
          >
            <Icon name="Plus" className="mr-2" size={18} />
            Добавить приложение
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Icon name="Save" className="mr-2" size={18} />
        Сохранить список приложений
      </Button>
    </form>
  );
}
