import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { IncomeData } from "../types";

interface ValidationErrors {
  [key: string]: string;
}

interface IncomeDataFormProps {
  onSubmit: (data: IncomeData) => void;
}

export default function IncomeDataForm({ onSubmit }: IncomeDataFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [incomeForm, setIncomeForm] = useState({
    monthlyIncome: "",
    source: "",
    lastYear: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: ValidationErrors = {};

    const monthly = parseFloat(incomeForm.monthlyIncome);
    const yearly = parseFloat(incomeForm.lastYear);

    if (!incomeForm.monthlyIncome || monthly <= 0) {
      newErrors.monthlyIncome = 'Укажите ежемесячный доход (больше 0)';
    }

    if (!incomeForm.source || incomeForm.source.length < 3) {
      newErrors.source = 'Укажите источник дохода (минимум 3 символа)';
    }

    if (!incomeForm.lastYear || yearly <= 0) {
      newErrors.lastYear = 'Укажите доход за год (больше 0)';
    }

    if (monthly > 0 && yearly > 0 && yearly < monthly * 12 * 0.5) {
      newErrors.lastYear = 'Годовой доход слишком мал (меньше 6 месячных доходов)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setErrors({});
    const data: IncomeData = {
      monthlyIncome: monthly,
      source: incomeForm.source,
      lastYear: yearly,
    };
    onSubmit(data);
    alert("Данные о доходах сохранены");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthlyIncome">Ежемесячный доход (₽) *</Label>
          <Input
            id="monthlyIncome"
            type="number"
            value={incomeForm.monthlyIncome}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, monthlyIncome: e.target.value })
            }
            min="0"
            required
            className={errors.monthlyIncome ? 'border-red-500' : ''}
          />
          {errors.monthlyIncome && (
            <p className="text-sm text-red-500 mt-1">{errors.monthlyIncome}</p>
          )}
        </div>
        <div>
          <Label htmlFor="source">Источник дохода *</Label>
          <Input
            id="source"
            value={incomeForm.source}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, source: e.target.value })
            }
            placeholder="заработная плата"
            required
            className={errors.source ? 'border-red-500' : ''}
          />
          {errors.source && (
            <p className="text-sm text-red-500 mt-1">{errors.source}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastYear">Доход за прошлый год (₽) *</Label>
          <Input
            id="lastYear"
            type="number"
            value={incomeForm.lastYear}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, lastYear: e.target.value })
            }
            min="0"
            required
            className={errors.lastYear ? 'border-red-500' : ''}
          />
          {errors.lastYear && (
            <p className="text-sm text-red-500 mt-1">{errors.lastYear}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Icon name="Save" className="mr-2" size={18} />
        Сохранить данные о доходах
      </Button>
    </form>
  );
}