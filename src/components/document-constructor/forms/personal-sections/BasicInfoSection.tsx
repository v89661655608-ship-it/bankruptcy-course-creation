import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicInfoSectionProps {
  personalForm: {
    fullName: string;
    inn: string;
    snils: string;
    birthDate: string;
    birthPlace: string;
  };
  errors: { [key: string]: string };
  onChange: (field: string, value: string) => void;
}

export default function BasicInfoSection({ personalForm, errors, onChange }: BasicInfoSectionProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="fullName">ФИО *</Label>
        <Input
          id="fullName"
          value={personalForm.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          required
          className={errors.fullName ? 'border-red-500' : ''}
        />
        {errors.fullName && (
          <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
        )}
      </div>
      <div>
        <Label htmlFor="birthDate">Дата рождения *</Label>
        <Input
          id="birthDate"
          type="date"
          value={personalForm.birthDate}
          onChange={(e) => onChange('birthDate', e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="birthPlace">Место рождения</Label>
        <Input
          id="birthPlace"
          value={personalForm.birthPlace}
          onChange={(e) => onChange('birthPlace', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="inn">ИНН</Label>
        <Input
          id="inn"
          value={personalForm.inn}
          onChange={(e) => onChange('inn', e.target.value)}
          placeholder="123456789012"
          maxLength={12}
          className={errors.inn ? 'border-red-500' : ''}
        />
        {errors.inn && (
          <p className="text-sm text-red-500 mt-1">{errors.inn}</p>
        )}
      </div>
      <div>
        <Label htmlFor="snils">СНИЛС</Label>
        <Input
          id="snils"
          value={personalForm.snils}
          onChange={(e) => onChange('snils', e.target.value)}
          placeholder="123-456-789 01"
          className={errors.snils ? 'border-red-500' : ''}
        />
        {errors.snils && (
          <p className="text-sm text-red-500 mt-1">{errors.snils}</p>
        )}
      </div>
    </div>
  );
}
