import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { PersonalData, CreditData, IncomeData, PropertyData } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const [personalForm, setPersonalForm] = useState({
    fullName: "",
    inn: "",
    snils: "",
    birthDate: "",
    birthPlace: "",
    passportSeries: "",
    passportNumber: "",
    passportIssueDate: "",
    passportIssuedBy: "",
    passportCode: "",
    registrationAddress: "",
    registrationDate: "",
    maritalStatus: "",
    spouseName: "",
    marriageDate: "",
    divorceDate: "",
  });

  const [creditForm, setCreditForm] = useState({
    creditorName: "",
    creditorInn: "",
    contractNumber: "",
    creditAmount: "",
    debtAmount: "",
    contractDate: "",
  });

  const [creditors, setCreditors] = useState<any[]>([]);

  const [incomeForm, setIncomeForm] = useState({
    monthlyIncome: "",
    source: "",
    lastYear: "",
  });

  const [propertyForm, setPropertyForm] = useState({
    propertyType: "",
    address: "",
    cadastralNumber: "",
    value: "",
  });

  const [properties, setProperties] = useState<any[]>([]);

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: PersonalData = {
      fullName: personalForm.fullName,
      inn: personalForm.inn,
      snils: personalForm.snils,
      birthDate: personalForm.birthDate,
      birthPlace: personalForm.birthPlace,
      passport: {
        series: personalForm.passportSeries,
        number: personalForm.passportNumber,
        issueDate: personalForm.passportIssueDate,
        issuedBy: personalForm.passportIssuedBy,
        code: personalForm.passportCode,
      },
      registration: {
        address: personalForm.registrationAddress,
        date: personalForm.registrationDate,
      },
      maritalStatus: {
        status: personalForm.maritalStatus,
        spouseName: personalForm.spouseName || undefined,
        marriageDate: personalForm.marriageDate || undefined,
        divorceDate: personalForm.divorceDate || undefined,
      },
      children: [],
    };
    onPersonalDataSubmit(data);
    alert("Персональные данные сохранены");
  };

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

  const handleCreditSubmit = (e: React.FormEvent) => {
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

    onCreditDataSubmit(data);
    alert("Данные о кредитах сохранены");
  };

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: IncomeData = {
      monthlyIncome: parseFloat(incomeForm.monthlyIncome),
      source: incomeForm.source,
      lastYear: parseFloat(incomeForm.lastYear),
    };
    onIncomeDataSubmit(data);
    alert("Данные о доходах сохранены");
  };

  const handleAddProperty = () => {
    if (!propertyForm.propertyType || !propertyForm.address) {
      alert("Заполните тип и адрес имущества");
      return;
    }

    const newProperty = {
      type: propertyForm.propertyType,
      address: propertyForm.address,
      cadastralNumber: propertyForm.cadastralNumber,
      value: parseFloat(propertyForm.value) || 0,
    };

    setProperties([...properties, newProperty]);
    setPropertyForm({
      propertyType: "",
      address: "",
      cadastralNumber: "",
      value: "",
    });
  };

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: PropertyData = {
      realEstate: properties,
      vehicles: [],
    };
    onPropertyDataSubmit(data);
    alert("Данные об имуществе сохранены");
  };

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
            <form onSubmit={handlePersonalSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">ФИО *</Label>
                  <Input
                    id="fullName"
                    value={personalForm.fullName}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="birthDate">Дата рождения *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={personalForm.birthDate}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, birthDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="birthPlace">Место рождения *</Label>
                  <Input
                    id="birthPlace"
                    value={personalForm.birthPlace}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, birthPlace: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="inn">ИНН *</Label>
                  <Input
                    id="inn"
                    value={personalForm.inn}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, inn: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="snils">СНИЛС *</Label>
                  <Input
                    id="snils"
                    placeholder="123-456-789 00"
                    value={personalForm.snils}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, snils: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">Паспортные данные</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="passportSeries">Серия *</Label>
                    <Input
                      id="passportSeries"
                      value={personalForm.passportSeries}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          passportSeries: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="passportNumber">Номер *</Label>
                    <Input
                      id="passportNumber"
                      value={personalForm.passportNumber}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          passportNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="passportIssueDate">Дата выдачи *</Label>
                    <Input
                      id="passportIssueDate"
                      type="date"
                      value={personalForm.passportIssueDate}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          passportIssueDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="passportCode">Код подразделения *</Label>
                    <Input
                      id="passportCode"
                      placeholder="770-001"
                      value={personalForm.passportCode}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          passportCode: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="passportIssuedBy">Кем выдан *</Label>
                    <Input
                      id="passportIssuedBy"
                      value={personalForm.passportIssuedBy}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          passportIssuedBy: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">Адрес регистрации</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="registrationAddress">Адрес *</Label>
                    <Input
                      id="registrationAddress"
                      value={personalForm.registrationAddress}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          registrationAddress: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="registrationDate">Дата регистрации</Label>
                    <Input
                      id="registrationDate"
                      type="date"
                      value={personalForm.registrationDate}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          registrationDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Icon name="Save" className="mr-2" size={18} />
                Сохранить личные данные
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="credit">
            <form onSubmit={handleCreditSubmit} className="space-y-4">
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
          </TabsContent>

          <TabsContent value="income">
            <form onSubmit={handleIncomeSubmit} className="space-y-4">
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
          </TabsContent>

          <TabsContent value="property">
            <form onSubmit={handlePropertySubmit} className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-medium mb-3">Добавить имущество</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyType">Тип имущества</Label>
                    <Input
                      id="propertyType"
                      value={propertyForm.propertyType}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          propertyType: e.target.value,
                        })
                      }
                      placeholder="квартира, дом, гараж"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cadastralNumber">Кадастровый номер</Label>
                    <Input
                      id="cadastralNumber"
                      value={propertyForm.cadastralNumber}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          cadastralNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Адрес</Label>
                    <Input
                      id="address"
                      value={propertyForm.address}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, address: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Стоимость (₽)</Label>
                    <Input
                      id="value"
                      type="number"
                      value={propertyForm.value}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, value: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleAddProperty}
                  variant="outline"
                  className="w-full mt-3"
                >
                  <Icon name="Plus" className="mr-2" size={18} />
                  Добавить имущество
                </Button>
              </div>

              {properties.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Добавленное имущество:</h3>
                  {properties.map((property, idx) => (
                    <div key={idx} className="border rounded p-3 bg-background">
                      <p className="font-medium capitalize">{property.type}</p>
                      <p className="text-sm text-muted-foreground">{property.address}</p>
                      <p className="text-sm">
                        Стоимость: {property.value.toLocaleString()} ₽
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <Button type="submit" className="w-full">
                <Icon name="Save" className="mr-2" size={18} />
                Сохранить данные об имуществе
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
