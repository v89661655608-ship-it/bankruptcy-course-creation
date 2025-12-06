import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { DebtReasonData } from "./types";

interface DebtReasonFormProps {
  onSubmit: (data: DebtReasonData) => void;
}

const DEFAULT_REASON = "Такая ситуация возникла в связи с тем, что Должник не рассчитал свои силы и возможности, кредиты приобретались при рождении детей и тратились на семейные нужды, впоследствии Должником была потеряна работа.";

export default function DebtReasonForm({ onSubmit }: DebtReasonFormProps) {
  const [reason, setReason] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('debtReasonData');
    if (saved) {
      const parsed = JSON.parse(saved);
      setReason(parsed.reason || DEFAULT_REASON);
    } else {
      setReason(DEFAULT_REASON);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('debtReasonData', JSON.stringify({ reason }));
  }, [reason]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ reason });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="CheckCircle" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-900">
                <p className="font-medium">Изменения сохранены!</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-900">
              <p className="font-medium mb-1">Стандартная формулировка</p>
              <p>Вы можете отредактировать текст ниже или оставить предложенную формулировку.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Причина возникновения задолженности</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Укажите причину возникновения задолженности"
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            Опишите обстоятельства, которые привели к образованию задолженности
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            <Icon name="Check" size={16} className="mr-2" />
            Сохранить
          </Button>
        </div>
      </form>
    </Card>
  );
}