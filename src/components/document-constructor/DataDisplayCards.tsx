import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { PersonalData, CreditData, IncomeData, PropertyData } from "./types";

interface DataDisplayCardsProps {
  personalData: PersonalData | null;
  creditData: CreditData | null;
  incomeData: IncomeData | null;
  propertyData: PropertyData | null;
}

export default function DataDisplayCards({
  personalData,
  creditData,
  incomeData,
  propertyData
}: DataDisplayCardsProps) {
  return (
    <>
      {personalData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="User" size={20} />
              Персональные данные
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">ФИО</p>
                <p className="font-medium">{personalData.fullName}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Дата рождения</p>
                <p className="font-medium">{personalData.birthDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">ИНН</p>
                <p className="font-medium">{personalData.inn}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">СНИЛС</p>
                <p className="font-medium">{personalData.snils}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground mb-1">Паспорт</p>
                <p className="font-medium">
                  {personalData.passport.series} {personalData.passport.number}, выдан {personalData.passport.issueDate}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground mb-1">Адрес регистрации</p>
                <p className="font-medium">{personalData.registration.address}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Семейное положение</p>
                <p className="font-medium">{personalData.maritalStatus.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Несовершеннолетние дети</p>
                <p className="font-medium">{personalData.children.filter(c => c.isMinor).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {creditData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="CreditCard" size={20} />
              Кредитные обязательства
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-destructive/10 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Общая сумма задолженности</p>
              <p className="text-2xl font-bold">{creditData.totalDebt.toLocaleString()} ₽</p>
            </div>

            <div className="space-y-3">
              <p className="font-medium">Кредиторы:</p>
              {creditData.creditors.map((creditor, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{creditor.name}</p>
                      <p className="text-sm text-muted-foreground">ИНН: {creditor.inn}</p>
                    </div>
                  </div>
                  {creditor.credits.map((credit, creditIdx) => (
                    <div key={creditIdx} className="mt-2 text-sm bg-muted p-2 rounded">
                      <p>Договор: {credit.contractNumber}</p>
                      <p>Сумма кредита: {credit.amount.toLocaleString()} ₽</p>
                      <p className="text-destructive font-medium">Задолженность: {credit.debt.toLocaleString()} ₽</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {creditData.executiveDocuments.length > 0 && (
              <div>
                <p className="font-medium mb-2">Исполнительные производства:</p>
                {creditData.executiveDocuments.map((doc, idx) => (
                  <div key={idx} className="border-l-4 border-destructive pl-3 py-2">
                    <p className="text-sm">№ {doc.number} от {doc.date}</p>
                    <p className="text-sm font-medium">{doc.creditor}: {doc.amount.toLocaleString()} ₽</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {incomeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Wallet" size={20} />
              Доходы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Ежемесячный доход</p>
              <p className="text-xl font-bold">{incomeData.monthlyIncome.toLocaleString()} ₽</p>
              <p className="text-muted-foreground">{incomeData.source}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Доход за прошлый год</p>
              <p className="font-medium">{incomeData.lastYear.toLocaleString()} ₽</p>
            </div>
          </CardContent>
        </Card>
      )}

      {propertyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Home" size={20} />
              Имущество
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {propertyData.realEstate.length > 0 && (
              <div>
                <p className="font-medium mb-2">Недвижимость:</p>
                {propertyData.realEstate.map((item, idx) => (
                  <div key={idx} className="border rounded p-3 mb-2">
                    <p className="font-medium capitalize">{item.type}</p>
                    <p className="text-muted-foreground">{item.address}</p>
                    <p className="text-muted-foreground">Кадастровый номер: {item.cadastralNumber}</p>
                    <p className="mt-1">Стоимость: {item.value.toLocaleString()} ₽</p>
                  </div>
                ))}
              </div>
            )}
            {propertyData.vehicles.length === 0 && propertyData.realEstate.length === 0 && (
              <p className="text-muted-foreground">Имущество не обнаружено</p>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
