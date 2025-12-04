import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { PersonalData, CreditData, IncomeData, PropertyData, AdditionalFields, BenefitsData, ChildrenData } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalDataForm from "./forms/PersonalDataForm";
import CreditDataForm from "./forms/CreditDataForm";
import IncomeDataForm from "./forms/IncomeDataForm";
import PropertyDataForm from "./forms/PropertyDataForm";
import AdditionalFieldsForm from "./AdditionalFieldsForm";
import BenefitsForm from "./BenefitsForm";
import ChildrenForm from "./ChildrenForm";

interface ManualInputFormProps {
  onPersonalDataSubmit: (data: PersonalData) => void;
  onCreditDataSubmit: (data: CreditData) => void;
  onIncomeDataSubmit: (data: IncomeData) => void;
  onPropertyDataSubmit: (data: PropertyData) => void;
  onAdditionalFieldsSubmit: (data: AdditionalFields) => void;
  onBenefitsSubmit: (data: BenefitsData) => void;
  onChildrenSubmit: (data: ChildrenData) => void;
  additionalFieldsData?: AdditionalFields;
  benefitsData?: BenefitsData;
  childrenData?: ChildrenData;
}

export default function ManualInputForm({
  onPersonalDataSubmit,
  onCreditDataSubmit,
  onIncomeDataSubmit,
  onPropertyDataSubmit,
  onAdditionalFieldsSubmit,
  onBenefitsSubmit,
  onChildrenSubmit,
  additionalFieldsData,
  benefitsData,
  childrenData
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
          <TabsList className="grid w-full grid-cols-7 gap-1">
            <TabsTrigger value="personal">Личные</TabsTrigger>
            <TabsTrigger value="credit">Кредиты</TabsTrigger>
            <TabsTrigger value="income">Доходы</TabsTrigger>
            <TabsTrigger value="property">Имущество</TabsTrigger>
            <TabsTrigger value="contacts">Контакты</TabsTrigger>
            <TabsTrigger value="benefits">Льготы</TabsTrigger>
            <TabsTrigger value="children">Дети</TabsTrigger>
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

          <TabsContent value="contacts">
            <AdditionalFieldsForm
              initialData={additionalFieldsData}
              onSave={(data) => {
                onAdditionalFieldsSubmit(data);
                setActiveTab("benefits");
              }}
              onCancel={() => setActiveTab("property")}
            />
          </TabsContent>

          <TabsContent value="benefits">
            <BenefitsForm
              initialData={benefitsData}
              onSave={(data) => {
                onBenefitsSubmit(data);
                setActiveTab("children");
              }}
              onCancel={() => setActiveTab("contacts")}
            />
          </TabsContent>

          <TabsContent value="children">
            <ChildrenForm
              initialData={childrenData}
              onSave={(data) => {
                onChildrenSubmit(data);
              }}
              onCancel={() => setActiveTab("benefits")}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}