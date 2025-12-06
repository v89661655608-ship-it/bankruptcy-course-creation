import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

interface DebtDischargeEmploymentFormProps {
  motionData: DebtDischargeMotionData;
  setMotionData: (data: DebtDischargeMotionData) => void;
}

export default function DebtDischargeEmploymentForm({ 
  motionData, 
  setMotionData 
}: DebtDischargeEmploymentFormProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileCheck" size={20} />
            Сделки должника
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="noContestablTransactions"
              checked={motionData.noContestablTransactions}
              onCheckedChange={(checked) => 
                setMotionData({ ...motionData, noContestablTransactions: checked as boolean })
              }
            />
            <Label htmlFor="noContestablTransactions" className="cursor-pointer">
              Сделок должника, подлежащих оспариванию, не выявлено
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Briefcase" size={20} />
            Трудовая деятельность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasEmployment"
              checked={motionData.hasEmployment}
              onCheckedChange={(checked) => 
                setMotionData({ 
                  ...motionData, 
                  hasEmployment: checked as boolean,
                  employerName: checked ? motionData.employerName : undefined,
                  monthlyIncome: checked ? motionData.monthlyIncome : undefined
                })
              }
            />
            <Label htmlFor="hasEmployment" className="cursor-pointer">
              Должник в настоящее время осуществляет трудовую деятельность
            </Label>
          </div>

          {motionData.hasEmployment && (
            <div className="ml-6 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="employerName">Наименование работодателя</Label>
                <Input
                  id="employerName"
                  value={motionData.employerName || ''}
                  onChange={(e) => setMotionData({ ...motionData, employerName: e.target.value })}
                  placeholder="Например: ООО Ромашка"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Ежемесячный доход (руб.)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={motionData.monthlyIncome || ''}
                  onChange={(e) => setMotionData({ ...motionData, monthlyIncome: e.target.value })}
                  placeholder="Например: 45000"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
