import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MaritalStatusSectionProps {
  personalForm: {
    maritalStatus: string;
    spouseName: string;
    marriageDate: string;
    divorceDate: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function MaritalStatusSection({ personalForm, onChange }: MaritalStatusSectionProps) {
  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="font-medium mb-3">Семейное положение</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="maritalStatus">Статус</Label>
          <select
            id="maritalStatus"
            value={personalForm.maritalStatus}
            onChange={(e) => onChange('maritalStatus', e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2 bg-background"
          >
            <option value="">Не указано</option>
            <option value="single">Не женат / Не замужем</option>
            <option value="married">Женат / Замужем</option>
            <option value="divorced">Разведен(а)</option>
            <option value="widowed">Вдовец / Вдова</option>
          </select>
        </div>

        {(personalForm.maritalStatus === 'married' || personalForm.maritalStatus === 'divorced') && (
          <>
            <div>
              <Label htmlFor="spouseName">ФИО супруга(и)</Label>
              <Input
                id="spouseName"
                value={personalForm.spouseName}
                onChange={(e) => onChange('spouseName', e.target.value)}
              />
            </div>

            {personalForm.maritalStatus === 'married' && (
              <div>
                <Label htmlFor="marriageDate">Дата заключения брака</Label>
                <Input
                  id="marriageDate"
                  type="date"
                  value={personalForm.marriageDate}
                  onChange={(e) => onChange('marriageDate', e.target.value)}
                />
              </div>
            )}

            {personalForm.maritalStatus === 'divorced' && (
              <>
                <div>
                  <Label htmlFor="marriageDate">Дата заключения брака</Label>
                  <Input
                    id="marriageDate"
                    type="date"
                    value={personalForm.marriageDate}
                    onChange={(e) => onChange('marriageDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="divorceDate">Дата расторжения брака</Label>
                  <Input
                    id="divorceDate"
                    type="date"
                    value={personalForm.divorceDate}
                    onChange={(e) => onChange('divorceDate', e.target.value)}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
