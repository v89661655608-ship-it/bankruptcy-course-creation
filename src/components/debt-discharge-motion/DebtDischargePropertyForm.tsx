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

interface DebtDischargePropertyFormProps {
  motionData: DebtDischargeMotionData;
  setMotionData: (data: DebtDischargeMotionData) => void;
}

export default function DebtDischargePropertyForm({ 
  motionData, 
  setMotionData 
}: DebtDischargePropertyFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Package" size={20} />
          Имущество конкурсной массы
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="property-not-found"
              name="propertyStatus"
              checked={motionData.propertyStatus === 'not-found'}
              onChange={() => setMotionData({ ...motionData, propertyStatus: 'not-found', propertySaleAmount: undefined })}
              className="w-4 h-4"
            />
            <Label htmlFor="property-not-found" className="cursor-pointer">
              Имущество, подлежащее включению в конкурсную массу, не выявлено
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="property-found"
              name="propertyStatus"
              checked={motionData.propertyStatus === 'found-and-sold'}
              onChange={() => setMotionData({ ...motionData, propertyStatus: 'found-and-sold' })}
              className="w-4 h-4"
            />
            <Label htmlFor="property-found" className="cursor-pointer">
              Имущество выявлено, добровольно передано и реализовано на торгах
            </Label>
          </div>

          {motionData.propertyStatus === 'found-and-sold' && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="propertySaleAmount">Сумма реализации имущества (руб.)</Label>
              <Input
                id="propertySaleAmount"
                type="number"
                value={motionData.propertySaleAmount || ''}
                onChange={(e) => setMotionData({ ...motionData, propertySaleAmount: e.target.value })}
                placeholder="Например: 250000"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
