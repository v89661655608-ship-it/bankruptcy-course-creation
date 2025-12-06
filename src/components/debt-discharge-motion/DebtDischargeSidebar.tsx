import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface DebtDischargeMotionData {
  caseNumber: string;
  hearingDate: string;
  propertyStatus: 'not-found' | 'found-and-sold';
  propertySaleAmount?: string;
  noContestablTransactions: boolean;
  hasEmployment: boolean;
  employerName?: string;
  monthlyIncome?: string;
  totalDebt: string;
}

interface DebtDischargeSidebarProps {
  personalData: any;
  motionData: DebtDischargeMotionData;
  isGenerating: boolean;
  onGenerateDocument: () => void;
}

export default function DebtDischargeSidebar({ 
  personalData, 
  motionData, 
  isGenerating, 
  onGenerateDocument 
}: DebtDischargeSidebarProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Генерация документа</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            {personalData ? (
              <Icon name="CheckCircle" size={16} className="text-green-500" />
            ) : (
              <Icon name="Circle" size={16} className="text-muted-foreground" />
            )}
            <span>Личные данные</span>
          </div>
          <div className="flex items-center gap-2">
            {motionData.caseNumber ? (
              <Icon name="CheckCircle" size={16} className="text-green-500" />
            ) : (
              <Icon name="Circle" size={16} className="text-muted-foreground" />
            )}
            <span>Номер дела</span>
          </div>
          <div className="flex items-center gap-2">
            {motionData.hearingDate ? (
              <Icon name="CheckCircle" size={16} className="text-green-500" />
            ) : (
              <Icon name="Circle" size={16} className="text-muted-foreground" />
            )}
            <span>Дата заседания</span>
          </div>
          <div className="flex items-center gap-2">
            {motionData.totalDebt ? (
              <Icon name="CheckCircle" size={16} className="text-green-500" />
            ) : (
              <Icon name="Circle" size={16} className="text-muted-foreground" />
            )}
            <span>Сумма реестра</span>
          </div>
        </div>

        <Button
          onClick={onGenerateDocument}
          disabled={!personalData || !motionData.caseNumber || !motionData.hearingDate || !motionData.totalDebt || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
              Генерация...
            </>
          ) : (
            <>
              <Icon name="FileText" className="mr-2" size={18} />
              Скачать ходатайство
            </>
          )}
        </Button>

        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm font-medium flex items-center gap-2">
            <Icon name="AlertCircle" size={16} />
            Важная информация
          </p>
          <div className="text-xs space-y-1 text-muted-foreground">
            <p>• Проверьте все введенные данные</p>
            <p>• Документ формируется в формате DOCX</p>
            <p>• Используется после завершения реализации имущества</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
