import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import funcUrls from "../../backend/func2url.json";
import DebtDischargeBasicDataForm from "@/components/debt-discharge-motion/DebtDischargeBasicDataForm";
import DebtDischargePropertyForm from "@/components/debt-discharge-motion/DebtDischargePropertyForm";
import DebtDischargeEmploymentForm from "@/components/debt-discharge-motion/DebtDischargeEmploymentForm";
import DebtDischargeSidebar from "@/components/debt-discharge-motion/DebtDischargeSidebar";

const STORAGE_KEY = 'debtDischargeMotionData';

interface DebtDischargeMotionData {
  caseNumber: string;
  hearingDate: string;
  propertyStatus: 'not-found' | 'found-and-sold';
  propertySaleAmount?: string;
  noContestablTransactions: boolean;
  hasEmployment: boolean;
  employerName?: string;
  monthlyIncome?: string;
  totalDebt: string;
}

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { 
      caseNumber: '', 
      hearingDate: '',
      propertyStatus: 'not-found',
      noContestablTransactions: true,
      hasEmployment: false,
      totalDebt: ''
    };
  } catch {
    return { 
      caseNumber: '', 
      hearingDate: '',
      propertyStatus: 'not-found',
      noContestablTransactions: true,
      hasEmployment: false,
      totalDebt: ''
    };
  }
};

const loadPersonalData = () => {
  try {
    const saved = localStorage.getItem('documentConstructorData');
    if (saved) {
      const data = JSON.parse(saved);
      return {
        fullName: data.personalData?.fullName || '',
        courtName: data.additionalFields?.courtName || '',
        courtAddress: data.additionalFields?.courtAddress || '',
        phone: data.personalData?.phone || '',
        email: data.personalData?.email || '',
        passport: data.personalData?.passport || {},
        registration: data.personalData?.registration || {},
        childrenData: data.childrenData || null
      };
    }
    return null;
  } catch {
    return null;
  }
};

export default function DebtDischargeMotion() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [motionData, setMotionData] = useState<DebtDischargeMotionData>(loadFromStorage());
  const [isGenerating, setIsGenerating] = useState(false);
  const personalData = loadPersonalData();

  // Проверяем наличие несовершеннолетних детей
  const hasMinorChildren = personalData?.childrenData && 
    !personalData.childrenData.noChildren && 
    personalData.childrenData.children?.length > 0;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(motionData));
  }, [motionData]);

  const handleGenerateDocument = async () => {
    if (!motionData.caseNumber) {
      toast({
        title: 'Ошибка',
        description: 'Укажите номер дела',
        variant: 'destructive'
      });
      return;
    }

    if (!motionData.hearingDate) {
      toast({
        title: 'Ошибка',
        description: 'Укажите дату судебного заседания',
        variant: 'destructive'
      });
      return;
    }

    if (!motionData.totalDebt) {
      toast({
        title: 'Ошибка',
        description: 'Укажите общую сумму реестра требований кредиторов',
        variant: 'destructive'
      });
      return;
    }

    if (motionData.propertyStatus === 'found-and-sold' && !motionData.propertySaleAmount) {
      toast({
        title: 'Ошибка',
        description: 'Укажите сумму реализации имущества',
        variant: 'destructive'
      });
      return;
    }

    if (motionData.hasEmployment && (!motionData.employerName || !motionData.monthlyIncome)) {
      toast({
        title: 'Ошибка',
        description: 'Укажите данные о работодателе и доходе',
        variant: 'destructive'
      });
      return;
    }

    if (!personalData) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо сначала заполнить личные данные в конструкторе документов',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch(funcUrls["document-generator"], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'debt-discharge-motion',
          personalData: personalData,
          additionalFields: {
            courtName: personalData.courtName,
            courtAddress: personalData.courtAddress
          },
          childrenData: personalData.childrenData,
          debtDischargeMotionData: motionData
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка генерации документа');
      }

      const result = await response.json();
      
      if (result.success && result.document) {
        const base64Data = result.document.data;
        const fileName = result.document.fileName;
        
        const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const blob = base64ToBlob(base64Data, mimeType);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Успешно',
          description: 'Ходатайство успешно сгенерировано и загружается!'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: `Ошибка генерации: ${error}`,
        variant: 'destructive'
      });
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
            onClick={() => navigate('/document-constructor')}
          >
            <Icon name="FileText" size={20} className="mr-2" />
            К заявлению о банкротстве
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Ходатайство об освобождении должника от долгов</h1>
        <p className="text-muted-foreground">
          Генерация ходатайства о списании долгов после завершения процедуры реализации имущества
        </p>
        <Badge variant="outline" className="mt-2">
          <Icon name="TestTube" size={14} className="mr-1" />
          Тестовый режим
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {!personalData && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Icon name="AlertCircle" size={20} className="text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">Необходимы личные данные</p>
                    <p className="text-sm text-orange-700 mt-1">
                      Сначала заполните личные данные в конструкторе заявления о банкротстве
                    </p>
                    <Button
                      onClick={() => navigate('/document-constructor')}
                      variant="outline"
                      size="sm"
                      className="mt-3 border-orange-300 hover:bg-orange-100"
                    >
                      <Icon name="FileText" size={16} className="mr-2" />
                      Перейти к конструктору
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {personalData && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ФИО:</span>
                    <span className="font-medium">{personalData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Суд:</span>
                    <span className="font-medium">{personalData.courtName || 'Не указан'}</span>
                  </div>
                  {hasMinorChildren && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded">
                      <Icon name="Baby" size={16} className="text-blue-500" />
                      <span className="text-xs text-blue-700">
                        Обнаружены данные о несовершеннолетних детях
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <DebtDischargeBasicDataForm 
            motionData={motionData} 
            setMotionData={setMotionData} 
          />

          <DebtDischargePropertyForm 
            motionData={motionData} 
            setMotionData={setMotionData} 
          />

          <DebtDischargeEmploymentForm 
            motionData={motionData} 
            setMotionData={setMotionData} 
          />
        </div>

        <div className="space-y-6">
          <DebtDischargeSidebar 
            personalData={personalData}
            motionData={motionData}
            isGenerating={isGenerating}
            onGenerateDocument={handleGenerateDocument}
          />
        </div>
      </div>
    </div>
  );
}
