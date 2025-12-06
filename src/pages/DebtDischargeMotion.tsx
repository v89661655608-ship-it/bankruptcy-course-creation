import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import funcUrls from "../../backend/func2url.json";

const STORAGE_KEY = 'debtDischargeMotionData';

interface DebtDischargeMotionData {
  caseNumber: string;
  hearingDate: string;
  propertyStatus: 'not-found' | 'found-and-sold';
  propertySaleAmount?: string;
  noContestableTrans actions: boolean;
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="User" size={20} />
                  Данные из конструктора
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Hash" size={20} />
                Основные данные
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="caseNumber">Номер дела</Label>
                <Input
                  id="caseNumber"
                  value={motionData.caseNumber}
                  onChange={(e) => setMotionData({ ...motionData, caseNumber: e.target.value })}
                  placeholder="Например: А40-123456/2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hearingDate">Дата судебного заседания</Label>
                <Input
                  id="hearingDate"
                  type="date"
                  value={motionData.hearingDate}
                  onChange={(e) => setMotionData({ ...motionData, hearingDate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Дата заседания по рассмотрению отчета финансового управляющего
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalDebt">Общая сумма реестра требований кредиторов (руб.)</Label>
                <Input
                  id="totalDebt"
                  type="number"
                  value={motionData.totalDebt}
                  onChange={(e) => setMotionData({ ...motionData, totalDebt: e.target.value })}
                  placeholder="Например: 850000"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Package" size={20} />
                Имущество конкурсной массы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="property-not-found"
                    name="propertyStatus"
                    checked={motionData.propertyStatus === 'not-found'}
                    onChange={() => setMotionData({ ...motionData, propertyStatus: 'not-found', propertySaleAmount: undefined })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="property-not-found" className="cursor-pointer">
                    Имущество, подлежащее включению в конкурсную массу, не выявлено
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="property-found"
                    name="propertyStatus"
                    checked={motionData.propertyStatus === 'found-and-sold'}
                    onChange={() => setMotionData({ ...motionData, propertyStatus: 'found-and-sold' })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="property-found" className="cursor-pointer">
                    Имущество выявлено, добровольно передано и реализовано на торгах
                  </Label>
                </div>

                {motionData.propertyStatus === 'found-and-sold' && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="propertySaleAmount">Сумма реализации имущества (руб.)</Label>
                    <Input
                      id="propertySaleAmount"
                      type="number"
                      value={motionData.propertySaleAmount || ''}
                      onChange={(e) => setMotionData({ ...motionData, propertySaleAmount: e.target.value })}
                      placeholder="Например: 250000"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileCheck" size={20} />
                Сделки должника
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="noContestablTransactions"
                  checked={motionData.noContestablTransactions}
                  onCheckedChange={(checked) => 
                    setMotionData({ ...motionData, noContestablTransactions: checked as boolean })
                  }
                />
                <Label htmlFor="noContestablTransactions" className="cursor-pointer">
                  Сделок должника, подлежащих оспариванию, не выявлено
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Briefcase" size={20} />
                Трудовая деятельность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasEmployment"
                  checked={motionData.hasEmployment}
                  onCheckedChange={(checked) => 
                    setMotionData({ 
                      ...motionData, 
                      hasEmployment: checked as boolean,
                      employerName: checked ? motionData.employerName : undefined,
                      monthlyIncome: checked ? motionData.monthlyIncome : undefined
                    })
                  }
                />
                <Label htmlFor="hasEmployment" className="cursor-pointer">
                  Должник в настоящее время осуществляет трудовую деятельность
                </Label>
              </div>

              {motionData.hasEmployment && (
                <div className="ml-6 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="employerName">Наименование работодателя</Label>
                    <Input
                      id="employerName"
                      value={motionData.employerName || ''}
                      onChange={(e) => setMotionData({ ...motionData, employerName: e.target.value })}
                      placeholder="Например: ООО Ромашка"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Ежемесячный доход (руб.)</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      value={motionData.monthlyIncome || ''}
                      onChange={(e) => setMotionData({ ...motionData, monthlyIncome: e.target.value })}
                      placeholder="Например: 45000"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Генерация документа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {personalData ? (
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                  <span>Личные данные</span>
                </div>
                <div className="flex items-center gap-2">
                  {motionData.caseNumber ? (
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                  <span>Номер дела</span>
                </div>
                <div className="flex items-center gap-2">
                  {motionData.hearingDate ? (
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                  <span>Дата заседания</span>
                </div>
                <div className="flex items-center gap-2">
                  {motionData.totalDebt ? (
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                  <span>Сумма реестра</span>
                </div>
              </div>

              <Button
                onClick={handleGenerateDocument}
                disabled={!personalData || !motionData.caseNumber || !motionData.hearingDate || !motionData.totalDebt || isGenerating}
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
                    Скачать ходатайство
                  </>
                )}
              </Button>

              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Icon name="AlertCircle" size={16} />
                  Важная информация
                </p>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>• Проверьте все введенные данные</p>
                  <p>• Документ формируется в формате DOCX</p>
                  <p>• Используется после завершения реализации имущества</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
