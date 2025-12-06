import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactInfoSectionProps {
  personalForm: {
    phone: string;
    email: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function ContactInfoSection({ personalForm, onChange }: ContactInfoSectionProps) {
  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="font-medium mb-3">Контактные данные</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            value={personalForm.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+7 (999) 123-45-67"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={personalForm.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="ivanov@example.com"
          />
        </div>
      </div>
    </div>
  );
}
