import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { BenefitsData } from "./types";

interface BenefitsFormProps {
  initialData?: BenefitsData;
  onSave: (data: BenefitsData) => void;
  onCancel: () => void;
}

export default function BenefitsForm({ initialData, onSave, onCancel }: BenefitsFormProps) {
  const [formData, setFormData] = useState<BenefitsData>(
    initialData || {
      isLowIncome: false,
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Heart" size={20} />
          Льготы и особый статус
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isLowIncome"
              checked={formData.isLowIncome}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isLowIncome: checked as boolean })
              }
            />
            <Label htmlFor="isLowIncome" className="text-sm font-normal cursor-pointer">
              Должник отнесен к категории малоимущих граждан
            </Label>
          </div>

          {formData.isLowIncome && (
            <div className="grid md:grid-cols-2 gap-4 pl-6 border-l-2 border-primary/20">
              <div>
                <Label htmlFor="certificateNumber">Номер справки</Label>
                <Input
                  id="certificateNumber"
                  value={formData.certificateNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, certificateNumber: e.target.value })
                  }
                  placeholder="№ справки"
                />
              </div>

              <div>
                <Label htmlFor="certificateDate">Дата справки</Label>
                <Input
                  id="certificateDate"
                  type="date"
                  value={formData.certificateDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, certificateDate: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="specialStatus">
              Особый статус (мать-одиночка, инвалид и т.д.)
            </Label>
            <Input
              id="specialStatus"
              value={formData.specialStatus || ""}
              onChange={(e) =>
                setFormData({ ...formData, specialStatus: e.target.value })
              }
              placeholder="Например: мать-одиночка, инвалид 2 группы"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
