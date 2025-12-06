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

const STORAGE_KEY = 'attachmentMotionData';

interface AttachmentMotionData {
  caseNumber: string;
  documents: string[];
}

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { caseNumber: '', documents: [] };
  } catch {
    return { caseNumber: '', documents: [] };
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
        registration: data.personalData?.registration || {}
      };
    }
    return null;
  } catch {
    return null;
  }
};

export default function AttachmentMotion() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [motionData, setMotionData] = useState<AttachmentMotionData>(loadFromStorage());
  const [newDocument, setNewDocument] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const personalData = loadPersonalData();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(motionData));
  }, [motionData]);

  const handleAddDocument = () => {
    if (!newDocument.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название документа',
        variant: 'destructive'
      });
      return;
    }

    setMotionData({
      ...motionData,
      documents: [...motionData.documents, newDocument]
    });
    setNewDocument("");
    
    toast({
      title: 'Добавлено',
      description: 'Документ добавлен в список'
    });
  };

  const handleRemoveDocument = (index: number) => {
    setMotionData({
      ...motionData,
      documents: motionData.documents.filter((_, i) => i !== index)
    });
    toast({
      title: 'Удалено',
      description: 'Документ удален из списка'
    });
  };

  const handleGenerateDocument = async () => {
    if (!motionData.caseNumber) {
      toast({
        title: 'Ошибка',
        description: 'Укажите номер дела',
        variant: 'destructive'
      });
      return;
    }

    if (motionData.documents.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы один документ',
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
          format: 'attachment-motion',
          personalData: personalData,
          additionalFields: {
            courtName: personalData.courtName,
            courtAddress: personalData.courtAddress
          },
          attachmentMotionData: motionData
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
        <h1 className="text-3xl font-bold mb-2">Ходатайство о приобщении документов</h1>
        <p className="text-muted-foreground">
          Генерация ходатайства для приобщения дополнительных документов к делу о банкротстве
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileStack" size={20} />
                Список документов для приобщения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {motionData.documents.length > 0 && (
                <div className="space-y-2">
                  {motionData.documents.map((doc, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded bg-muted/50">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <span className="flex-1 text-sm">{doc}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDocument(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <Label htmlFor="newDocument">Добавить документ</Label>
                <div className="flex gap-2">
                  <Input
                    id="newDocument"
                    value={newDocument}
                    onChange={(e) => setNewDocument(e.target.value)}
                    placeholder="Например: Справка 2-НДФЛ за 2023 год"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDocument();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddDocument}
                    variant="outline"
                  >
                    <Icon name="Plus" size={18} />
                  </Button>
                </div>
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
                  {motionData.caseNumber ? (
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                  <span>Номер дела</span>
                </div>
                <div className="flex items-center gap-2">
                  {motionData.documents.length > 0 ? (
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                  <span>Документы ({motionData.documents.length})</span>
                </div>
              </div>

              <Button
                onClick={handleGenerateDocument}
                disabled={!personalData || !motionData.caseNumber || motionData.documents.length === 0 || isGenerating}
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
                  <p>• Убедитесь, что все документы указаны корректно</p>
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
