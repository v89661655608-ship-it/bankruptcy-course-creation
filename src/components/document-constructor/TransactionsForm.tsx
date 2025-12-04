import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { TransactionsData } from "./types";

interface TransactionsFormProps {
  initialData?: TransactionsData;
  onSave: (data: TransactionsData) => void;
  onCancel: () => void;
}

export default function TransactionsForm({ initialData, onSave, onCancel }: TransactionsFormProps) {
  const [formData, setFormData] = useState<TransactionsData>(
    initialData || {
      noTransactions: false,
      transactions: [],
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
    alert("Данные о сделках сохранены");
  };

  const addTransaction = () => {
    setFormData({
      ...formData,
      transactions: [
        ...formData.transactions,
        { date: "", type: "", description: "", amount: 0, counterparty: "" },
      ],
    });
  };

  const removeTransaction = (index: number) => {
    setFormData({
      ...formData,
      transactions: formData.transactions.filter((_, i) => i !== index),
    });
  };

  const updateTransaction = (index: number, field: string, value: any) => {
    const updated = [...formData.transactions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, transactions: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="FileText" size={20} />
          Сделки с имуществом
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="noTransactions"
              checked={formData.noTransactions}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, noTransactions: checked as boolean })
              }
            />
            <Label htmlFor="noTransactions" className="text-sm font-normal cursor-pointer">
              Сделки с имуществом за последние 3 года не совершались
            </Label>
          </div>

          {!formData.noTransactions && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Список сделок</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTransaction}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить сделку
                  </Button>
                </div>

                {formData.transactions.map((transaction, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Сделка {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTransaction(index)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Дата сделки</Label>
                            <Input
                              type="date"
                              value={transaction.date}
                              onChange={(e) => updateTransaction(index, "date", e.target.value)}
                              required
                            />
                          </div>

                          <div>
                            <Label>Тип сделки</Label>
                            <Input
                              value={transaction.type}
                              onChange={(e) => updateTransaction(index, "type", e.target.value)}
                              placeholder="Купля-продажа, дарение и т.д."
                              required
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <Label>Описание</Label>
                            <Input
                              value={transaction.description}
                              onChange={(e) => updateTransaction(index, "description", e.target.value)}
                              placeholder="Продажа автомобиля, покупка квартиры и т.д."
                              required
                            />
                          </div>

                          <div>
                            <Label>Сумма сделки (₽)</Label>
                            <Input
                              type="number"
                              value={transaction.amount}
                              onChange={(e) =>
                                updateTransaction(index, "amount", parseFloat(e.target.value))
                              }
                              placeholder="100000"
                              required
                            />
                          </div>

                          <div>
                            <Label>Контрагент</Label>
                            <Input
                              value={transaction.counterparty}
                              onChange={(e) =>
                                updateTransaction(index, "counterparty", e.target.value)
                              }
                              placeholder="ФИО или наименование организации"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

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