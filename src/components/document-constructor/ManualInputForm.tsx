import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { PersonalData, CreditData, IncomeData, PropertyData, AdditionalFields, BenefitsData, ChildrenData, TransactionsData, DebtReasonData } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalDataForm from "./forms/PersonalDataForm";
import CreditDataForm from "./forms/CreditDataForm";
import IncomeDataForm from "./forms/IncomeDataForm";
import PropertyDataForm from "./forms/PropertyDataForm";
import AdditionalFieldsForm from "./AdditionalFieldsForm";
import BenefitsForm from "./BenefitsForm";
import ChildrenForm from "./ChildrenForm";
import TransactionsForm from "./TransactionsForm";
import DebtReasonForm from "./DebtReasonForm";

interface ManualInputFormProps {
  onPersonalDataSubmit: (data: PersonalData) => void;
  onCreditDataSubmit: (data: CreditData) => void;
  onIncomeDataSubmit: (data: IncomeData) => void;
  onPropertyDataSubmit: (data: PropertyData) => void;
  onAdditionalFieldsSubmit: (data: AdditionalFields) => void;
  onBenefitsSubmit: (data: BenefitsData) => void;
  onChildrenSubmit: (data: ChildrenData) => void;
  onTransactionsSubmit: (data: TransactionsData) => void;
  onDebtReasonSubmit: (data: DebtReasonData) => void;
  additionalFieldsData?: AdditionalFields;
  benefitsData?: BenefitsData;
  childrenData?: ChildrenData;
  transactionsData?: TransactionsData;
  debtReasonData?: DebtReasonData;
}

export default function ManualInputForm({
  onPersonalDataSubmit,
  onCreditDataSubmit,
  onIncomeDataSubmit,
  onPropertyDataSubmit,
  onAdditionalFieldsSubmit,
  onBenefitsSubmit,
  onChildrenSubmit,
  onTransactionsSubmit,
  onDebtReasonSubmit,
  additionalFieldsData,
  benefitsData,
  childrenData,
  transactionsData,
  debtReasonData
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
          <TabsList className="grid w-full grid-cols-9 gap-1">
            <TabsTrigger value="personal">Личные</TabsTrigger>
            <TabsTrigger value="credit">Кредиты</TabsTrigger>
            <TabsTrigger value="income">Доходы</TabsTrigger>
            <TabsTrigger value="property">Имущество</TabsTrigger>
            <TabsTrigger value="contacts">Суд</TabsTrigger>
            <TabsTrigger value="benefits">Льготы</TabsTrigger>
            <TabsTrigger value="children">Дети</TabsTrigger>
            <TabsTrigger value="transactions">Сделки</TabsTrigger>
            <TabsTrigger value="debt-reason">Причина долгов</TabsTrigger>
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
                setActiveTab("transactions");
              }}
              onCancel={() => setActiveTab("benefits")}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsForm
              initialData={transactionsData}
              onSave={(data) => {
                onTransactionsSubmit(data);
                setActiveTab("debt-reason");
              }}
              onCancel={() => setActiveTab("children")}
            />
          </TabsContent>

          <TabsContent value="debt-reason">
            <DebtReasonForm
              onSubmit={(data) => {
                onDebtReasonSubmit(data);
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}