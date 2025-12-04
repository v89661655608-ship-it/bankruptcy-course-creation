import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { CreditData } from "../types";

interface ValidationErrors {
  [key: string]: string;
}

interface CreditDataFormProps {
  onSubmit: (data: CreditData) => void;
}

export default function CreditDataForm({ onSubmit }: CreditDataFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [creditForm, setCreditForm] = useState({
    creditorName: "",
    creditorInn: "",
    contractNumber: "",
    creditAmount: "",
    debtAmount: "",
    contractDate: "",
  });

  const [creditors, setCreditors] = useState<any[]>([]);

  const handleAddCreditor = () => {
    const newErrors: ValidationErrors = {};

    if (!creditForm.creditorName || creditForm.creditorName.length < 3) {
      newErrors.creditorName = 'Введите название кредитора (минимум 3 символа)';
    }

    if (!creditForm.debtAmount || parseFloat(creditForm.debtAmount) <= 0) {
      newErrors.debtAmount = 'Укажите сумму долга (больше 0)';
    }

    if (creditForm.creditAmount && parseFloat(creditForm.creditAmount) < 0) {
      newErrors.creditAmount = 'Сумма кредита не может быть отрицательной';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const newCreditor = {
      name: creditForm.creditorName,
      inn: creditForm.creditorInn,
      credits: [
        {
          contractNumber: creditForm.contractNumber,
          amount: parseFloat(creditForm.creditAmount) || 0,
          debt: parseFloat(creditForm.debtAmount),
          date: creditForm.contractDate,
        },
      ],
    };

    setCreditors([...creditors, newCreditor]);
    setCreditForm({
      creditorName: "",
      creditorInn: "",
      contractNumber: "",
      creditAmount: "",
      debtAmount: "",
      contractDate: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (creditors.length === 0) {
      alert("Добавьте хотя бы одного кредитора");
      return;
    }

    const totalDebt = creditors.reduce(
      (sum, creditor) =>
        sum + creditor.credits.reduce((s: number, c: any) => s + c.debt, 0),
      0
    );

    const data: CreditData = {
      creditors,
      totalDebt,
      executiveDocuments: [],
    };

    onSubmit(data);
    alert("Данные о кредитах сохранены");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-lg p-4 bg-muted/50">
        <h3 className="font-medium mb-3">Добавить кредитора</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="creditorName">Название кредитора</Label>
            <Input
              id="creditorName"
              value={creditForm.creditorName}
              onChange={(e) =>
                setCreditForm({ ...creditForm, creditorName: e.target.value })
              }
              placeholder="ПАО Сбербанк"
              className={errors.creditorName ? 'border-red-500' : ''}
            />
            {errors.creditorName && (
              <p className="text-sm text-red-500 mt-1">{errors.creditorName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="creditorInn">ИНН кредитора</Label>
            <Input
              id="creditorInn"
              value={creditForm.creditorInn}
              onChange={(e) =>
                setCreditForm({ ...creditForm, creditorInn: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="contractNumber">Номер договора</Label>
            <Input
              id="contractNumber"
              value={creditForm.contractNumber}
              onChange={(e) =>
                setCreditForm({
                  ...creditForm,
                  contractNumber: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="contractDate">Дата договора</Label>
            <Input
              id="contractDate"
              type="date"
              value={creditForm.contractDate}
              onChange={(e) =>
                setCreditForm({ ...creditForm, contractDate: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="creditAmount">Сумма кредита (₽)</Label>
            <Input
              id="creditAmount"
              type="number"
              value={creditForm.creditAmount}
              onChange={(e) =>
                setCreditForm({ ...creditForm, creditAmount: e.target.value })
              }
              min="0"
              className={errors.creditAmount ? 'border-red-500' : ''}
            />
            {errors.creditAmount && (
              <p className="text-sm text-red-500 mt-1">{errors.creditAmount}</p>
            )}
          </div>
          <div>
            <Label htmlFor="debtAmount">Сумма долга (₽)</Label>
            <Input
              id="debtAmount"
              type="number"
              value={creditForm.debtAmount}
              onChange={(e) =>
                setCreditForm({ ...creditForm, debtAmount: e.target.value })
              }
              min="0"
              className={errors.debtAmount ? 'border-red-500' : ''}
            />
            {errors.debtAmount && (
              <p className="text-sm text-red-500 mt-1">{errors.debtAmount}</p>
            )}
          </div>
        </div>
        <Button
          type="button"
          onClick={handleAddCreditor}
          variant="outline"
          className="w-full mt-3"
        >
          <Icon name="Plus" className="mr-2" size={18} />
          Добавить кредитора
        </Button>
      </div>

      {creditors.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Добавленные кредиторы:</h3>
          {creditors.map((creditor, idx) => (
            <div key={idx} className="border rounded p-3 bg-background">
              <p className="font-medium">{creditor.name}</p>
              <p className="text-sm text-muted-foreground">
                Долг: {creditor.credits[0].debt.toLocaleString()} ₽
              </p>
            </div>
          ))}
        </div>
      )}

      <Button type="submit" className="w-full">
        <Icon name="Save" className="mr-2" size={18} />
        Сохранить данные о кредитах
      </Button>
    </form>
  );
}