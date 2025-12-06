import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import DataAuthSection from "@/components/document-constructor/DataAuthSection";
import DataDisplayCards from "@/components/document-constructor/DataDisplayCards";
import ProgressSidebar from "@/components/document-constructor/ProgressSidebar";
import ManualInputForm from "@/components/document-constructor/ManualInputForm";

import AdditionalFieldsForm from "@/components/document-constructor/AdditionalFieldsForm";
import { PersonalData, CreditData, IncomeData, PropertyData, AdditionalFields, BenefitsData, ChildrenData, TransactionsData, DebtReasonData, AppendicesData } from "@/components/document-constructor/types";
import funcUrls from "../../backend/func2url.json";

const STORAGE_KEY = 'documentConstructorData';

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export default function DocumentConstructor() {
  const navigate = useNavigate();
  const savedData = useState(() => loadFromStorage())[0];
  
  const [isLoadingEsia] = useState(false);
  const [isLoadingBki] = useState(false);
  const [personalData, setPersonalData] = useState<PersonalData | null>(savedData.personalData || null);
  const [creditData, setCreditData] = useState<CreditData | null>(savedData.creditData || null);
  const [incomeData, setIncomeData] = useState<IncomeData | null>(savedData.incomeData || null);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(savedData.propertyData || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<AdditionalFields | null>(savedData.additionalFields || null);
  const [benefitsData, setBenefitsData] = useState<BenefitsData | null>(savedData.benefitsData || null);
  const [childrenData, setChildrenData] = useState<ChildrenData | null>(savedData.childrenData || null);
  const [transactionsData, setTransactionsData] = useState<TransactionsData | null>(savedData.transactionsData || null);
  const [debtReasonData, setDebtReasonData] = useState<DebtReasonData | null>(savedData.debtReasonData || null);
  const [appendicesData, setAppendicesData] = useState<AppendicesData | null>(savedData.appendicesData || null);

  useEffect(() => {
    const dataToSave = {
      personalData,
      creditData,
      incomeData,
      propertyData,
      additionalFields,
      benefitsData,
      childrenData,
      transactionsData,
      debtReasonData,
      appendicesData,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [personalData, creditData, incomeData, propertyData, additionalFields, benefitsData, childrenData, transactionsData, debtReasonData, appendicesData]);

  const handleEsiaAuth = async () => {
    alert('Интеграция с ЕСИА/Госуслуги в разработке. Требуется регистрация в ЕСИА и получение сертификатов.');
  };

  const handleBkiAuth = async () => {
    alert('Интеграция с БКИ в разработке. Требуется подключение к API Бюро кредитных историй.');
  };

  const handleGenerateDocument = async (format: 'pdf' | 'docx' | 'creditors-list' | 'property-list') => {
    if (!personalData || !creditData) {
      alert('Необходимо загрузить персональные данные и кредитную историю (минимальные требования)');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🏠 Отправка данных на генерацию:', {
        propertyData,
        realEstateCount: propertyData?.realEstate?.length || 0,
        vehiclesCount: propertyData?.vehicles?.length || 0
      });
      
      const response = await fetch(funcUrls["document-generator"], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalData,
          creditData,
          incomeData,
          propertyData,
          additionalFields,
          benefitsData,
          childrenData,
          transactionsData,
          debtReasonData,
          appendicesData,
          format
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка генерации документа');
      }

      const result = await response.json();
      
      if (result.success && result.document) {
        const base64Data = result.document.data;
        const fileName = result.document.fileName;
        
        const mimeType = format === 'pdf' 
          ? 'application/pdf' 
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const blob = base64ToBlob(base64Data, mimeType);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        let docType = 'Заявление';
        if (format === 'creditors-list') docType = 'Приложение №1';
        if (format === 'property-list') docType = 'Приложение №2';
        alert(`${docType} успешно сгенерировано и загружается!`);
      }
    } catch (error) {
      alert(`Ошибка: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };



  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="-ml-2"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад в личный кабинет
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/attachment-motion')}
          >
            <Icon name="FileStack" size={20} className="mr-2" />
            Ходатайство о приобщении
          </Button>
        </div>
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
            onShowManualInput={() => setShowManualInput(true)}
          />

          {showManualInput && (
            <ManualInputForm
              onPersonalDataSubmit={setPersonalData}
              onCreditDataSubmit={setCreditData}
              onIncomeDataSubmit={setIncomeData}
              onPropertyDataSubmit={setPropertyData}
              onAdditionalFieldsSubmit={setAdditionalFields}
              onBenefitsSubmit={setBenefitsData}
              onChildrenSubmit={setChildrenData}
              onTransactionsSubmit={setTransactionsData}
              onDebtReasonSubmit={setDebtReasonData}
              onAppendicesSubmit={setAppendicesData}
              additionalFieldsData={additionalFields || undefined}
              benefitsData={benefitsData || undefined}
              childrenData={childrenData || undefined}
              transactionsData={transactionsData || undefined}
              debtReasonData={debtReasonData || undefined}
              appendicesData={appendicesData || undefined}
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