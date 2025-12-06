import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { PersonalData, CreditData, IncomeData, PropertyData } from "./types";

interface ProgressSidebarProps {
  personalData: PersonalData | null;
  creditData: CreditData | null;
  incomeData: IncomeData | null;
  propertyData: PropertyData | null;
  isGenerating: boolean;
  onGenerateDocument: (format: 'pdf' | 'docx' | 'creditors-list' | 'property-list') => void;
}

export default function ProgressSidebar({
  personalData,
  creditData,
  incomeData,
  propertyData,
  isGenerating,
  onGenerateDocument
}: ProgressSidebarProps) {
  const requiredData = [personalData, creditData].filter(Boolean).length;
  const optionalData = [incomeData, propertyData].filter(Boolean).length;
  const totalDataLoaded = requiredData + optionalData;
  const progress = (requiredData / 2) * 100;

  return (
    <div className="space-y-6">
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="text-lg">Прогресс сбора данных</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Обязательные данные</span>
              <span className="font-medium">{requiredData}/2</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {personalData ? (
                <Icon name="CheckCircle" size={16} className="text-green-500" />
              ) : (
                <Icon name="Circle" size={16} className="text-muted-foreground" />
              )}
              <span>Персональные данные</span>
            </div>
            <div className="flex items-center gap-2">
              {creditData ? (
                <Icon name="CheckCircle" size={16} className="text-green-500" />
              ) : (
                <Icon name="Circle" size={16} className="text-muted-foreground" />
              )}
              <span>Кредитная история</span>
            </div>
            <div className="flex items-center gap-2">
              {incomeData ? (
                <Icon name="CheckCircle" size={16} className="text-green-500" />
              ) : (
                <Icon name="Circle" size={16} className="text-muted-foreground" />
              )}
              <span>Сведения о доходах</span>
              <span className="text-xs text-muted-foreground ml-auto">(необязательно)</span>
            </div>
            <div className="flex items-center gap-2">
              {propertyData ? (
                <Icon name="CheckCircle" size={16} className="text-green-500" />
              ) : (
                <Icon name="Circle" size={16} className="text-muted-foreground" />
              )}
              <span>Имущество</span>
              <span className="text-xs text-muted-foreground ml-auto">(необязательно)</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Скачать заявление:</p>
            
            <Button
              onClick={() => onGenerateDocument('docx')}
              disabled={!personalData || !creditData || isGenerating}
              className="w-full"
              variant="default"
            >
              {isGenerating ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                  Генерация...
                </>
              ) : (
                <>
                  <Icon name="FileText" className="mr-2" size={18} />
                  Скачать Word (DOCX)
                </>
              )}
            </Button>

            <Button
              onClick={() => onGenerateDocument('pdf')}
              disabled={!personalData || !creditData || isGenerating}
              className="w-full"
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                  Генерация...
                </>
              ) : (
                <>
                  <Icon name="FileDown" className="mr-2" size={18} />
                  Скачать PDF
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Приложения:</p>
            
            <Button
              onClick={() => onGenerateDocument('creditors-list')}
              disabled={!personalData || !creditData || isGenerating}
              className="w-full"
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                  Генерация...
                </>
              ) : (
                <>
                  <Icon name="FileSpreadsheet" className="mr-2" size={18} />
                  Приложение №1
                </>
              )}
            </Button>
            
            <Button
              onClick={() => onGenerateDocument('property-list')}
              disabled={!personalData || isGenerating}
              className="w-full"
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                  Генерация...
                </>
              ) : (
                <>
                  <Icon name="Package" className="mr-2" size={18} />
                  Приложение №2
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Скачайте готовые документы, внимательно вычитайте их на предмет опечаток и скорректируйте в соответствии с Вашими данными и индивидуальной информацией. Помните, генератор документов служит Вам помощником, не отдавайте в руки робота судьбу вашего банкротства!
          </p>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Icon name="AlertCircle" size={16} />
              Важная информация
            </p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p>• Все данные передаются через защищенное соединение</p>
              <p>• Документы формируются в соответствии с действующим законодательством</p>
              <p>• Рекомендуем консультацию юриста перед подачей</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}