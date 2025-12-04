import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { CreditData } from "../types";

interface CreditDataFormProps {
  onSubmit: (data: CreditData) => void;
}

export default function CreditDataForm({ onSubmit }: CreditDataFormProps) {
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
    if (!creditForm.creditorName || !creditForm.debtAmount) {
      alert("Заполните название кредитора и сумму долга");
      return;
    }

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
            />
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
            />
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
            />
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
