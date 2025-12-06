import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface DebtDischargeBasicDataFormProps {
  motionData: DebtDischargeMotionData;
  setMotionData: (data: DebtDischargeMotionData) => void;
}

export default function DebtDischargeBasicDataForm({ 
  motionData, 
  setMotionData 
}: DebtDischargeBasicDataFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Hash" size={20} />
          Основные данные
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="caseNumber">Номер дела</Label>
          <Input
            id="caseNumber"
            value={motionData.caseNumber}
            onChange={(e) => setMotionData({ ...motionData, caseNumber: e.target.value })}
            placeholder="Например: А40-123456/2024"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hearingDate">Дата судебного заседания</Label>
          <Input
            id="hearingDate"
            type="date"
            value={motionData.hearingDate}
            onChange={(e) => setMotionData({ ...motionData, hearingDate: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Дата заседания по рассмотрению отчета финансового управляющего
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalDebt">Общая сумма реестра требований кредиторов (руб.)</Label>
          <Input
            id="totalDebt"
            type="number"
            value={motionData.totalDebt}
            onChange={(e) => setMotionData({ ...motionData, totalDebt: e.target.value })}
            placeholder="Например: 850000"
          />
        </div>
      </CardContent>
    </Card>
  );
}
