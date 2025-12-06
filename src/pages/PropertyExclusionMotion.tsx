import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import funcUrls from "../../backend/func2url.json";

const STORAGE_KEY = 'propertyExclusionMotionData';

interface PropertyExclusionMotionData {
  caseNumber: string;
}

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { caseNumber: '' };
  } catch {
    return { caseNumber: '' };
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
        propertyData: data.propertyData || null
      };
    }
    return null;
  } catch {
    return null;
  }
};

export default function PropertyExclusionMotion() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [motionData, setMotionData] = useState<PropertyExclusionMotionData>(loadFromStorage());
  const [isGenerating, setIsGenerating] = useState(false);
  const personalData = loadPersonalData();

  // Проверяем наличие единственного жилья
  const soleResidence = personalData?.propertyData?.realEstate?.find(
    (item: any) => item.isSoleResidence === true
  );

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

    if (!personalData) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо сначала заполнить личные данные в конструкторе документов',
        variant: 'destructive'
      });
      return;
    }

    if (!soleResidence) {
      toast({
        title: 'Ошибка',
        description: 'В разделе "Имущество" конструктора документов необходимо указать недвижимость с отметкой "единственное жилье"',
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
          format: 'property-exclusion-motion',
          personalData: personalData,
          additionalFields: {
            courtName: personalData.courtName,
            courtAddress: personalData.courtAddress
          },
          propertyData: personalData.propertyData,
          propertyExclusionMotionData: motionData
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/attachment-motion')}
          >
            <Icon name="FileStack" size={20} className="mr-2" />
            Ходатайство о приобщении
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/absence-motion')}
          >
            <Icon name="UserX" size={20} className="mr-2" />
            Рассмотрение в отсутствие
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Ходатайство об исключении имущества из конкурсной массы</h1>
        <p className="text-muted-foreground">
          Генерация ходатайства для исключения единственного жилья из конкурсной массы должника
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

          {!soleResidence && personalData && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Icon name="Home" size={20} className="text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">Необходимо указать единственное жилье</p>
                    <p className="text-sm text-orange-700 mt-1">
                      В разделе "Имущество" конструктора документов добавьте недвижимость с отметкой "единственное жилье"
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
              </CardContent>
            </Card>
          )}

          {soleResidence && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Home" size={20} />
                  Единственное жилье
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Тип:</span>
                  <span className="font-medium ml-2">{soleResidence.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Адрес:</span>
                  <span className="font-medium ml-2">{soleResidence.address}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Площадь:</span>
                  <span className="font-medium ml-2">{soleResidence.area} кв. м</span>
                </div>
                {soleResidence.landArea && soleResidence.landArea > 0 && (
                  <div>
                    <span className="text-muted-foreground">Земельный участок:</span>
                    <span className="font-medium ml-2">{soleResidence.landArea} кв. м</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Hash" size={20} />
                Номер дела
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="caseNumber">Номер дела</Label>
                <Input
                  id="caseNumber"
                  value={motionData.caseNumber}
                  onChange={(e) => setMotionData({ ...motionData, caseNumber: e.target.value })}
                  placeholder="Например: А40-123456/2024"
                />
                <p className="text-xs text-muted-foreground">
                  Укажите полный номер дела о банкротстве
                </p>
              </div>
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
                  {soleResidence ? (
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                  <span>Единственное жилье</span>
                </div>
                <div className="flex items-center gap-2">
                  {motionData.caseNumber ? (
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                  <span>Номер дела</span>
                </div>
              </div>

              <Button
                onClick={handleGenerateDocument}
                disabled={!personalData || !soleResidence || !motionData.caseNumber || isGenerating}
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
                  <p>• Проверьте правильность номера дела</p>
                  <p>• Убедитесь, что данные о жилье корректны</p>
                  <p>• Документ формируется в формате DOCX</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
