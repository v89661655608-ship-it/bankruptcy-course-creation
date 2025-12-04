import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";

interface PersonalData {
  fullName: string;
  inn: string;
  snils: string;
  birthDate: string;
  birthPlace: string;
  passport: {
    series: string;
    number: string;
    issueDate: string;
    issuedBy: string;
    code: string;
  };
  registration: {
    address: string;
    date: string;
  };
  maritalStatus: {
    status: string;
    spouseName?: string;
    marriageDate?: string;
    divorceDate?: string;
  };
  children: Array<{
    name: string;
    birthDate: string;
    isMinor: boolean;
  }>;
}

interface CreditData {
  creditors: Array<{
    name: string;
    inn: string;
    credits: Array<{
      contractNumber: string;
      amount: number;
      debt: number;
      date: string;
    }>;
  }>;
  totalDebt: number;
  executiveDocuments: Array<{
    number: string;
    date: string;
    amount: number;
    creditor: string;
  }>;
}

interface IncomeData {
  monthlyIncome: number;
  source: string;
  lastYear: number;
}

interface PropertyData {
  realEstate: Array<{
    type: string;
    address: string;
    cadastralNumber: string;
    value: number;
  }>;
  vehicles: Array<{
    type: string;
    model: string;
    year: number;
    registrationNumber: string;
  }>;
}

export default function DocumentConstructor() {
  const [isLoadingEsia] = useState(false);
  const [isLoadingBki] = useState(false);
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleEsiaAuth = async () => {
    alert('Интеграция с ЕСИА/Госуслуги в разработке. Требуется регистрация в ЕСИА и получение сертификатов.');
  };

  const handleBkiAuth = async () => {
    alert('Интеграция с БКИ в разработке. Требуется подключение к API Бюро кредитных историй.');
  };

  const handleGenerateDocument = async () => {
    if (!personalData || !creditData) {
      alert('Необходимо загрузить данные из ЕСИА и БКИ');
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Заявление о банкротстве будет сгенерировано после подключения API');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadTestData = () => {
    setPersonalData({
      fullName: "Иванов Иван Иванович",
      inn: "123456789012",
      snils: "123-456-789 00",
      birthDate: "01.01.1980",
      birthPlace: "г. Москва",
      passport: {
        series: "4509",
        number: "123456",
        issueDate: "01.01.2010",
        issuedBy: "ОВД Района Хамовники г. Москвы",
        code: "770-001"
      },
      registration: {
        address: "г. Москва, ул. Ленина, д. 1, кв. 1",
        date: "01.01.2000"
      },
      maritalStatus: {
        status: "в разводе",
        spouseName: "Иванова Мария Петровна",
        marriageDate: "01.01.2005",
        divorceDate: "01.01.2020"
      },
      children: [
        {
          name: "Иванов Петр Иванович",
          birthDate: "01.01.2015",
          isMinor: true
        }
      ]
    });

    setCreditData({
      creditors: [
        {
          name: "ПАО Сбербанк",
          inn: "7707083893",
          credits: [
            {
              contractNumber: "12345/2020",
              amount: 500000,
              debt: 650000,
              date: "01.01.2020"
            }
          ]
        },
        {
          name: "ВТБ (ПАО)",
          inn: "7702070139",
          credits: [
            {
              contractNumber: "67890/2019",
              amount: 300000,
              debt: 400000,
              date: "01.06.2019"
            }
          ]
        }
      ],
      totalDebt: 1050000,
      executiveDocuments: [
        {
          number: "12345678/2023",
          date: "01.01.2023",
          amount: 650000,
          creditor: "ПАО Сбербанк"
        }
      ]
    });

    setIncomeData({
      monthlyIncome: 35000,
      source: "заработная плата",
      lastYear: 420000
    });

    setPropertyData({
      realEstate: [
        {
          type: "квартира",
          address: "г. Москва, ул. Ленина, д. 1, кв. 1",
          cadastralNumber: "77:01:0001001:1234",
          value: 8000000
        }
      ],
      vehicles: []
    });
  };

  const totalDataLoaded = [personalData, creditData, incomeData, propertyData].filter(Boolean).length;
  const progress = (totalDataLoaded / 4) * 100;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Конструктор судебных документов</h1>
        <p className="text-muted-foreground">
          Автоматическая генерация заявлений о банкротстве на основе данных из государственных реестров
        </p>
        <Badge variant="outline" className="mt-2">
          <Icon name="TestTube" size={14} className="mr-1" />
          Тестовый режим
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Shield" size={20} />
                Авторизация и сбор данных
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <Icon name="Info" size={20} className="text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Для работы конструктора требуется:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Интеграция с ЕСИА (Госуслуги) для получения личных данных</li>
                      <li>Подключение к Бюро кредитных историй для данных о кредитах</li>
                      <li>API интеграции с ФССП для исполнительных производств</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleEsiaAuth}
                  disabled={isLoadingEsia || !!personalData}
                  className="h-auto py-4 flex-col items-start"
                  variant={personalData ? "outline" : "default"}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {personalData ? (
                      <Icon name="CheckCircle" size={20} className="text-green-500" />
                    ) : (
                      <Icon name="ShieldCheck" size={20} />
                    )}
                    <span className="font-semibold">ЕСИА / Госуслуги</span>
                  </div>
                  <span className="text-xs opacity-80">
                    ФИО, паспорт, регистрация, СНИЛС, ИНН
                  </span>
                </Button>

                <Button
                  onClick={handleBkiAuth}
                  disabled={isLoadingBki || !!creditData}
                  className="h-auto py-4 flex-col items-start"
                  variant={creditData ? "outline" : "default"}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {creditData ? (
                      <Icon name="CheckCircle" size={20} className="text-green-500" />
                    ) : (
                      <Icon name="Building2" size={20} />
                    )}
                    <span className="font-semibold">Бюро кредитных историй</span>
                  </div>
                  <span className="text-xs opacity-80">
                    Кредиторы, долги, исполнительные листы
                  </span>
                </Button>
              </div>

              <Separator />

              <Button
                onClick={handleLoadTestData}
                variant="outline"
                className="w-full"
              >
                <Icon name="FlaskConical" className="mr-2" size={18} />
                Загрузить тестовые данные
              </Button>
            </CardContent>
          </Card>

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
        </div>

        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Прогресс сбора данных</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Готовность</span>
                  <span className="font-medium">{totalDataLoaded}/4</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {personalData ? (
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                  <span>Персональные данные</span>
                </div>
                <div className="flex items-center gap-2">
                  {creditData ? (
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                  <span>Кредитная история</span>
                </div>
                <div className="flex items-center gap-2">
                  {incomeData ? (
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                  <span>Сведения о доходах</span>
                </div>
                <div className="flex items-center gap-2">
                  {propertyData ? (
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                  <span>Имущество</span>
                </div>
              </div>

              <Separator />

              <Button
                onClick={handleGenerateDocument}
                disabled={!personalData || !creditData || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Icon name="FileText" className="mr-2" size={18} />
                    Сгенерировать заявление
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground">
                Будет сформировано заявление о признании гражданина банкротом по форме, утвержденной законодательством РФ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="AlertCircle" size={18} />
                Важная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>• Все данные передаются через защищенное соединение</p>
              <p>• Документы формируются в соответствии с действующим законодательством</p>
              <p>• Для подачи в суд требуется электронная подпись</p>
              <p>• Рекомендуем консультацию юриста перед подачей</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
