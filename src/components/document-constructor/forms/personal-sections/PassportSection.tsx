import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PassportSectionProps {
  personalForm: {
    passportSeries: string;
    passportNumber: string;
    passportIssueDate: string;
    passportIssuedBy: string;
    passportCode: string;
  };
  errors: { [key: string]: string };
  onChange: (field: string, value: string) => void;
}

export default function PassportSection({ personalForm, errors, onChange }: PassportSectionProps) {
  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="font-medium mb-3">Паспортные данные</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="passportSeries">Серия *</Label>
          <Input
            id="passportSeries"
            value={personalForm.passportSeries}
            onChange={(e) => onChange('passportSeries', e.target.value)}
            placeholder="1234"
            maxLength={4}
            required
            className={errors.passportSeries ? 'border-red-500' : ''}
          />
          {errors.passportSeries && (
            <p className="text-sm text-red-500 mt-1">{errors.passportSeries}</p>
          )}
        </div>
        <div>
          <Label htmlFor="passportNumber">Номер *</Label>
          <Input
            id="passportNumber"
            value={personalForm.passportNumber}
            onChange={(e) => onChange('passportNumber', e.target.value)}
            placeholder="123456"
            maxLength={6}
            required
            className={errors.passportNumber ? 'border-red-500' : ''}
          />
          {errors.passportNumber && (
            <p className="text-sm text-red-500 mt-1">{errors.passportNumber}</p>
          )}
        </div>
        <div>
          <Label htmlFor="passportIssueDate">Дата выдачи *</Label>
          <Input
            id="passportIssueDate"
            type="date"
            value={personalForm.passportIssueDate}
            onChange={(e) => onChange('passportIssueDate', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="passportCode">Код подразделения</Label>
          <Input
            id="passportCode"
            value={personalForm.passportCode}
            onChange={(e) => onChange('passportCode', e.target.value)}
            placeholder="123-456"
            className={errors.passportCode ? 'border-red-500' : ''}
          />
          {errors.passportCode && (
            <p className="text-sm text-red-500 mt-1">{errors.passportCode}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="passportIssuedBy">Кем выдан *</Label>
          <Input
            id="passportIssuedBy"
            value={personalForm.passportIssuedBy}
            onChange={(e) => onChange('passportIssuedBy', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
}
