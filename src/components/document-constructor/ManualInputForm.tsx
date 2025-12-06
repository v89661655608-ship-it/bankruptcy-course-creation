import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { PersonalData, CreditData, IncomeData, PropertyData, AdditionalFields, BenefitsData, ChildrenData, TransactionsData, DebtReasonData, AppendicesData } from "./types";
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
import AppendicesForm from "./AppendicesForm";

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
  onAppendicesSubmit: (data: AppendicesData) => void;
  additionalFieldsData?: AdditionalFields;
  benefitsData?: BenefitsData;
  childrenData?: ChildrenData;
  transactionsData?: TransactionsData;
  debtReasonData?: DebtReasonData;
  appendicesData?: AppendicesData;
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
  onAppendicesSubmit,
  additionalFieldsData,
  benefitsData,
  childrenData,
  transactionsData,
  debtReasonData,
  appendicesData
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
          <TabsList className="grid w-full grid-cols-10 gap-1 text-xs">
            <TabsTrigger value="personal" className="text-xs px-2">Личные</TabsTrigger>
            <TabsTrigger value="credit" className="text-xs px-2">Кредиты</TabsTrigger>
            <TabsTrigger value="income" className="text-xs px-2">Доходы</TabsTrigger>
            <TabsTrigger value="property" className="text-xs px-2">Имущество</TabsTrigger>
            <TabsTrigger value="contacts" className="text-xs px-2">Суд</TabsTrigger>
            <TabsTrigger value="benefits" className="text-xs px-2">Льготы</TabsTrigger>
            <TabsTrigger value="children" className="text-xs px-2">Дети</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs px-2">Сделки</TabsTrigger>
            <TabsTrigger value="debt-reason" className="text-xs px-2">Причина</TabsTrigger>
            <TabsTrigger value="appendices" className="text-xs px-2">Приложения</TabsTrigger>
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
                setActiveTab("appendices");
              }}
            />
          </TabsContent>

          <TabsContent value="appendices">
            <AppendicesForm
              initialData={appendicesData}
              onSubmit={(data) => {
                onAppendicesSubmit(data);
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}