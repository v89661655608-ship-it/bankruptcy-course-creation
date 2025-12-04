import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { PersonalData, CreditData, IncomeData, PropertyData } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalDataForm from "./forms/PersonalDataForm";
import CreditDataForm from "./forms/CreditDataForm";
import IncomeDataForm from "./forms/IncomeDataForm";
import PropertyDataForm from "./forms/PropertyDataForm";

interface ManualInputFormProps {
  onPersonalDataSubmit: (data: PersonalData) => void;
  onCreditDataSubmit: (data: CreditData) => void;
  onIncomeDataSubmit: (data: IncomeData) => void;
  onPropertyDataSubmit: (data: PropertyData) => void;
}

export default function ManualInputForm({
  onPersonalDataSubmit,
  onCreditDataSubmit,
  onIncomeDataSubmit,
  onPropertyDataSubmit
}: ManualInputFormProps) {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Pencil" size={20} />
          Ручной ввод данных
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Личные</TabsTrigger>
            <TabsTrigger value="credit">Кредиты</TabsTrigger>
            <TabsTrigger value="income">Доходы</TabsTrigger>
            <TabsTrigger value="property">Имущество</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalDataForm onSubmit={onPersonalDataSubmit} />
          </TabsContent>

          <TabsContent value="credit">
            <CreditDataForm onSubmit={onCreditDataSubmit} />
          </TabsContent>

          <TabsContent value="income">
            <IncomeDataForm onSubmit={onIncomeDataSubmit} />
          </TabsContent>

          <TabsContent value="property">
            <PropertyDataForm onSubmit={onPropertyDataSubmit} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
