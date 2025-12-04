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
  onLoadTestData: () => void;
  onShowManualInput: () => void;
  onShowDocumentUpload: () => void;
}

export default function DataAuthSection({
  isLoadingEsia,
  isLoadingBki,
  personalData,
  creditData,
  onEsiaAuth,
  onBkiAuth,
  onLoadTestData,
  onShowManualInput,
  onShowDocumentUpload
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
              <p className="font-medium mb-1">Для работы конструктора требуется:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Интеграция с ЕСИА (Госуслуги) для получения личных данных</li>
                <li>Подключение к Бюро кредитных историй для данных о кредитах</li>
                <li>API интеграции с ФССП для исполнительных производств</li>
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

        <div className="grid sm:grid-cols-3 gap-3">
          <Button onClick={onShowManualInput} variant="outline">
            <Icon name="Pencil" className="mr-2" size={18} />
            Ручной ввод
          </Button>
          
          <Button onClick={onShowDocumentUpload} variant="outline">
            <Icon name="Upload" className="mr-2" size={18} />
            Загрузить сканы
          </Button>
          
          <Button onClick={onLoadTestData} variant="outline">
            <Icon name="FlaskConical" className="mr-2" size={18} />
            Тестовые данные
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}