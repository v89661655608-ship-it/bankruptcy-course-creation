import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import DataAuthSection from "@/components/document-constructor/DataAuthSection";
import DataDisplayCards from "@/components/document-constructor/DataDisplayCards";
import ProgressSidebar from "@/components/document-constructor/ProgressSidebar";
import ManualInputForm from "@/components/document-constructor/ManualInputForm";
import DocumentUpload from "@/components/document-constructor/DocumentUpload";
import { PersonalData, CreditData, IncomeData, PropertyData } from "@/components/document-constructor/types";

export default function DocumentConstructor() {
  const [isLoadingEsia] = useState(false);
  const [isLoadingBki] = useState(false);
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

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
          <DataAuthSection
            isLoadingEsia={isLoadingEsia}
            isLoadingBki={isLoadingBki}
            personalData={personalData}
            creditData={creditData}
            onEsiaAuth={handleEsiaAuth}
            onBkiAuth={handleBkiAuth}
            onLoadTestData={handleLoadTestData}
            onShowManualInput={() => {
              setShowManualInput(true);
              setShowDocumentUpload(false);
            }}
            onShowDocumentUpload={() => {
              setShowDocumentUpload(true);
              setShowManualInput(false);
            }}
          />

          {showManualInput && (
            <ManualInputForm
              onPersonalDataSubmit={setPersonalData}
              onCreditDataSubmit={setCreditData}
              onIncomeDataSubmit={setIncomeData}
              onPropertyDataSubmit={setPropertyData}
            />
          )}

          {showDocumentUpload && (
            <DocumentUpload
              onPersonalDataExtracted={setPersonalData}
              onCreditDataExtracted={setCreditData}
              onIncomeDataExtracted={setIncomeData}
              onPropertyDataExtracted={setPropertyData}
            />
          )}

          <DataDisplayCards
            personalData={personalData}
            creditData={creditData}
            incomeData={incomeData}
            propertyData={propertyData}
          />
        </div>

        <ProgressSidebar
          personalData={personalData}
          creditData={creditData}
          incomeData={incomeData}
          propertyData={propertyData}
          isGenerating={isGenerating}
          onGenerateDocument={handleGenerateDocument}
        />
      </div>
    </div>
  );
}