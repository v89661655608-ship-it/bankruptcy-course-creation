import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { PersonalData, CreditData } from "./types";

interface DataAuthSectionProps {
  isLoadingEsia: boolean;
  isLoadingBki: boolean;
  personalData: PersonalData | null;
  creditData: CreditData | null;
  onEsiaAuth: () => void;
  onBkiAuth: () => void;
  onShowManualInput: () => void;
}

export default function DataAuthSection({
  isLoadingEsia,
  isLoadingBki,
  personalData,
  creditData,
  onEsiaAuth,
  onBkiAuth,
  onShowManualInput
}: DataAuthSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Shield" size={20} />
          Авторизация и сбор данных
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <Icon name="Info" size={20} className="text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-2">Интеграции с ЕСИА (Госуслуги) и БКИ находятся в разработке</p>
              <p className="text-muted-foreground mb-3">
                Автоматическая загрузка данных появится совсем скоро. А пока используйте ручной ввод данных — все поля с автозаполнением адресов и реквизитов организаций для вашего удобства.
              </p>
              <p className="text-xs text-muted-foreground font-medium">Планируемые интеграции:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground mt-1">
                <li>ЕСИА (Госуслуги) — автозагрузка личных данных, паспорта, СНИЛС, ИНН</li>
                <li>Бюро кредитных историй — автозагрузка данных о кредиторах и долгах</li>
                <li>ФССП — автозагрузка исполнительных производств</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Button
            onClick={onEsiaAuth}
            disabled={isLoadingEsia || !!personalData}
            className="h-auto py-4 flex-col items-start"
            variant={personalData ? "outline" : "default"}
          >
            <div className="flex items-center gap-2 mb-1">
              {personalData ? (
                <Icon name="CheckCircle" size={20} className="text-green-500" />
              ) : (
                <Icon name="ShieldCheck" size={20} />
              )}
              <span className="font-semibold">ЕСИА / Госуслуги</span>
            </div>
            <span className="text-xs opacity-80">
              ФИО, паспорт, регистрация, СНИЛС, ИНН
            </span>
          </Button>

          <Button
            onClick={onBkiAuth}
            disabled={isLoadingBki || !!creditData}
            className="h-auto py-4 flex-col items-start"
            variant={creditData ? "outline" : "default"}
          >
            <div className="flex items-center gap-2 mb-1">
              {creditData ? (
                <Icon name="CheckCircle" size={20} className="text-green-500" />
              ) : (
                <Icon name="Building2" size={20} />
              )}
              <span className="font-semibold">Бюро кредитных историй</span>
            </div>
            <span className="text-xs opacity-80">
              Кредиторы, долги, исполнительные листы
            </span>
          </Button>
        </div>

        <Separator />

        <div>
          <Button onClick={onShowManualInput} variant="outline" className="w-full">
            <Icon name="Pencil" className="mr-2" size={18} />
            Ручной ввод данных
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}