import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [noIncome, setNoIncome] = useState(false);
  const [incomeForm, setIncomeForm] = useState({
    monthlyIncome: "",
    source: "",
    lastYear: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: ValidationErrors = {};

    if (noIncome) {
      const data: IncomeData = {
        monthlyIncome: 0,
        source: 'Доход отсутствует',
        lastYear: 0,
        noIncome: true
      };
      onSubmit(data);
      alert("Данные о доходах сохранены (доход отсутствует)");
      return;
    }

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
      noIncome: false
    };
    onSubmit(data);
    alert("Данные о доходах сохранены");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
        <Checkbox
          id="noIncome"
          checked={noIncome}
          onCheckedChange={(checked) => setNoIncome(checked as boolean)}
        />
        <Label htmlFor="noIncome" className="cursor-pointer">
          Доход отсутствует (безработный)
        </Label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthlyIncome">Ежемесячный доход (₽) {!noIncome && '*'}</Label>
          <Input
            id="monthlyIncome"
            type="number"
            value={incomeForm.monthlyIncome}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, monthlyIncome: e.target.value })
            }
            min="0"
            required={!noIncome}
            disabled={noIncome}
            className={errors.monthlyIncome ? 'border-red-500' : ''}
          />
          {errors.monthlyIncome && (
            <p className="text-sm text-red-500 mt-1">{errors.monthlyIncome}</p>
          )}
        </div>
        <div>
          <Label htmlFor="source">Источник дохода {!noIncome && '*'}</Label>
          <Input
            id="source"
            value={incomeForm.source}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, source: e.target.value })
            }
            placeholder="заработная плата"
            required={!noIncome}
            disabled={noIncome}
            className={errors.source ? 'border-red-500' : ''}
          />
          {errors.source && (
            <p className="text-sm text-red-500 mt-1">{errors.source}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastYear">Доход за прошлый год (₽) {!noIncome && '*'}</Label>
          <Input
            id="lastYear"
            type="number"
            value={incomeForm.lastYear}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, lastYear: e.target.value })
            }
            min="0"
            required={!noIncome}
            disabled={noIncome}
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