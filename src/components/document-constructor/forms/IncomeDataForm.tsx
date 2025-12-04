import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { IncomeData } from "../types";

interface IncomeDataFormProps {
  onSubmit: (data: IncomeData) => void;
}

export default function IncomeDataForm({ onSubmit }: IncomeDataFormProps) {
  const [incomeForm, setIncomeForm] = useState({
    monthlyIncome: "",
    source: "",
    lastYear: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: IncomeData = {
      monthlyIncome: parseFloat(incomeForm.monthlyIncome),
      source: incomeForm.source,
      lastYear: parseFloat(incomeForm.lastYear),
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
            required
          />
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
          />
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
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Icon name="Save" className="mr-2" size={18} />
        Сохранить данные о доходах
      </Button>
    </form>
  );
}
