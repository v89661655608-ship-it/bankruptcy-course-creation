import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { AdditionalFields } from "./types";

interface AdditionalFieldsFormProps {
  initialData?: AdditionalFields;
  onSave: (data: AdditionalFields) => void;
  onCancel: () => void;
}

export default function AdditionalFieldsForm({ initialData, onSave, onCancel }: AdditionalFieldsFormProps) {
  const [formData, setFormData] = useState<AdditionalFields>(
    initialData || {
      courtName: "Арбитражный суд города Москвы",
      courtAddress: "",
      phone: "",
      email: ""
    }
  );

  const handleSave = () => {
    // Поля phone и email теперь в PersonalDataForm, поэтому очищаем их здесь
    const dataToSave = {
      courtName: formData.courtName,
      courtAddress: formData.courtAddress,
      phone: "",
      email: ""
    };
    onSave(dataToSave);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="courtName">Название суда</Label>
          <Input
            id="courtName"
            value={formData.courtName}
            onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
            placeholder="Арбитражный суд города Москвы"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="courtAddress">Адрес суда</Label>
          <Input
            id="courtAddress"
            value={formData.courtAddress}
            onChange={(e) => setFormData({ ...formData, courtAddress: e.target.value })}
            placeholder="г. Москва, ул. Большая Тульская, д. 17"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            <Icon name="Check" size={16} className="mr-2" />
            Сохранить
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            <Icon name="X" size={16} className="mr-2" />
            Отмена
          </Button>
        </div>
      </form>
    </Card>
  );
}