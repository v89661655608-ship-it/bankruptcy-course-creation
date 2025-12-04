import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { PersonalData, CreditData, IncomeData, PropertyData } from "./types";
import funcUrls from "../../../backend/func2url.json";

interface DocumentUploadProps {
  onPersonalDataExtracted: (data: PersonalData) => void;
  onCreditDataExtracted: (data: CreditData) => void;
  onIncomeDataExtracted: (data: IncomeData) => void;
  onPropertyDataExtracted: (data: PropertyData) => void;
}

export default function DocumentUpload({
  onPersonalDataExtracted,
  onCreditDataExtracted,
  onIncomeDataExtracted,
  onPropertyDataExtracted,
}: DocumentUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    passport?: File;
    bki?: File;
    income?: File;
    property?: File;
  }>({});

  const handleFileUpload = (type: "passport" | "bki" | "income" | "property", file: File) => {
    setUploadedFiles({ ...uploadedFiles, [type]: file });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const callOcrApi = async (file: File): Promise<string> => {
    const base64Image = await convertFileToBase64(file);
    
    const response = await fetch(funcUrls["ocr-document"], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        folderId: ''
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'OCR API error');
    }

    const data = await response.json();
    return data.text || '';
  };

  const parseOcrText = async (text: string, documentType: string): Promise<any> => {
    const response = await fetch(funcUrls["parse-ocr-text"], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        documentType
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Parse API error');
    }

    const result = await response.json();
    return result.data || {};
  };

  const handleProcessPassport = async () => {
    if (!uploadedFiles.passport) {
      alert("Загрузите скан паспорта");
      return;
    }

    setIsProcessing(true);
    try {
      const ocrText = await callOcrApi(uploadedFiles.passport);
      const parsedData = await parseOcrText(ocrText, 'passport');
      
      const personalData: PersonalData = {
        fullName: parsedData.fullName || "Не распознано",
        inn: parsedData.inn || "",
        snils: parsedData.snils || "",
        birthDate: parsedData.birthDate || "",
        birthPlace: parsedData.birthPlace || "",
        passport: {
          series: parsedData.passportSeries || "",
          number: parsedData.passportNumber || "",
          issueDate: parsedData.passportIssueDate || "",
          issuedBy: parsedData.passportIssuedBy || "",
          code: parsedData.passportCode || "",
        },
        registration: {
          address: parsedData.registrationAddress || "",
          date: parsedData.registrationDate || "",
        },
        maritalStatus: {
          status: "",
        },
        children: [],
      };

      onPersonalDataExtracted(personalData);
      alert(`Распознано и автоматически заполнено:\n\nФИО: ${personalData.fullName}\nПаспорт: ${personalData.passport.series} ${personalData.passport.number}\nАдрес: ${personalData.registration.address}`);
    } catch (error) {
      alert(`Ошибка распознавания: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessBki = async () => {
    if (!uploadedFiles.bki) {
      alert("Загрузите выписку из БКИ");
      return;
    }

    setIsProcessing(true);
    try {
      const ocrText = await callOcrApi(uploadedFiles.bki);
      const parsedData = await parseOcrText(ocrText, 'bki');

      const creditData: CreditData = {
        creditors: parsedData.creditors || [],
        totalDebt: parsedData.totalDebt || 0,
        executiveDocuments: [],
      };

      onCreditDataExtracted(creditData);
      const creditorsNames = creditData.creditors.map(c => c.name).join(', ');
      alert(`Распознано и автоматически заполнено:\n\nКредиторы: ${creditorsNames}\nОбщий долг: ${creditData.totalDebt.toLocaleString()} ₽`);
    } catch (error) {
      alert(`Ошибка распознавания: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessIncome = async () => {
    if (!uploadedFiles.income) {
      alert("Загрузите справку о доходах");
      return;
    }

    setIsProcessing(true);
    try {
      const ocrText = await callOcrApi(uploadedFiles.income);
      const parsedData = await parseOcrText(ocrText, 'income');

      const incomeData: IncomeData = {
        monthlyIncome: parsedData.monthlyIncome || 0,
        source: parsedData.source || "заработная плата",
        lastYear: parsedData.lastYear || 0,
      };

      onIncomeDataExtracted(incomeData);
      alert(`Распознано и автоматически заполнено:\n\nЕжемесячный доход: ${incomeData.monthlyIncome.toLocaleString()} ₽\nИсточник: ${incomeData.source}\nЗа год: ${incomeData.lastYear.toLocaleString()} ₽`);
    } catch (error) {
      alert(`Ошибка распознавания: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessProperty = async () => {
    if (!uploadedFiles.property) {
      alert("Загрузите выписку из ЕГРН");
      return;
    }

    setIsProcessing(true);
    try {
      const ocrText = await callOcrApi(uploadedFiles.property);
      const parsedData = await parseOcrText(ocrText, 'property');

      const propertyData: PropertyData = {
        realEstate: parsedData.realEstate || [],
        vehicles: [],
      };

      onPropertyDataExtracted(propertyData);
      const propertySummary = propertyData.realEstate.map(p => `${p.type}: ${p.address}`).join('\n');
      alert(`Распознано и автоматически заполнено:\n\n${propertySummary}`);
    } catch (error) {
      alert(`Ошибка распознавания: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Upload" size={20} />
          Загрузка документов с распознаванием
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">OCR распознавание документов</p>
              <p className="text-muted-foreground">
                Загрузите сканы или фотографии документов, система автоматически
                распознает текст и заполнит данные. Поддерживаются форматы: JPG, PNG,
                PDF.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="IdCard" size={20} className="text-primary" />
                <div>
                  <p className="font-medium">Паспорт РФ</p>
                  <p className="text-xs text-muted-foreground">
                    Страницы 2-3 (фото + прописка)
                  </p>
                </div>
              </div>
              {uploadedFiles.passport && (
                <Icon name="CheckCircle" size={20} className="text-green-500" />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*,.pdf";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileUpload("passport", file);
                  };
                  input.click();
                }}
              >
                <Icon name="Upload" className="mr-2" size={16} />
                Загрузить
              </Button>
              <Button
                onClick={handleProcessPassport}
                disabled={!uploadedFiles.passport || isProcessing}
              >
                <Icon name="ScanText" className="mr-2" size={16} />
                Распознать
              </Button>
            </div>
            {uploadedFiles.passport && (
              <p className="text-xs text-muted-foreground mt-2">
                Загружен: {uploadedFiles.passport.name}
              </p>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="FileText" size={20} className="text-primary" />
                <div>
                  <p className="font-medium">Выписка из БКИ</p>
                  <p className="text-xs text-muted-foreground">
                    Бюро кредитных историй
                  </p>
                </div>
              </div>
              {uploadedFiles.bki && (
                <Icon name="CheckCircle" size={20} className="text-green-500" />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*,.pdf";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileUpload("bki", file);
                  };
                  input.click();
                }}
              >
                <Icon name="Upload" className="mr-2" size={16} />
                Загрузить
              </Button>
              <Button
                onClick={handleProcessBki}
                disabled={!uploadedFiles.bki || isProcessing}
              >
                <Icon name="ScanText" className="mr-2" size={16} />
                Распознать
              </Button>
            </div>
            {uploadedFiles.bki && (
              <p className="text-xs text-muted-foreground mt-2">
                Загружен: {uploadedFiles.bki.name}
              </p>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="Wallet" size={20} className="text-primary" />
                <div>
                  <p className="font-medium">Справка о доходах</p>
                  <p className="text-xs text-muted-foreground">2-НДФЛ или справка с работы</p>
                </div>
              </div>
              {uploadedFiles.income && (
                <Icon name="CheckCircle" size={20} className="text-green-500" />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*,.pdf";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileUpload("income", file);
                  };
                  input.click();
                }}
              >
                <Icon name="Upload" className="mr-2" size={16} />
                Загрузить
              </Button>
              <Button
                onClick={handleProcessIncome}
                disabled={!uploadedFiles.income || isProcessing}
              >
                <Icon name="ScanText" className="mr-2" size={16} />
                Распознать
              </Button>
            </div>
            {uploadedFiles.income && (
              <p className="text-xs text-muted-foreground mt-2">
                Загружен: {uploadedFiles.income.name}
              </p>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="Home" size={20} className="text-primary" />
                <div>
                  <p className="font-medium">Выписка из ЕГРН</p>
                  <p className="text-xs text-muted-foreground">Сведения об имуществе</p>
                </div>
              </div>
              {uploadedFiles.property && (
                <Icon name="CheckCircle" size={20} className="text-green-500" />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*,.pdf";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileUpload("property", file);
                  };
                  input.click();
                }}
              >
                <Icon name="Upload" className="mr-2" size={16} />
                Загрузить
              </Button>
              <Button
                onClick={handleProcessProperty}
                disabled={!uploadedFiles.property || isProcessing}
              >
                <Icon name="ScanText" className="mr-2" size={16} />
                Распознать
              </Button>
            </div>
            {uploadedFiles.property && (
              <p className="text-xs text-muted-foreground mt-2">
                Загружен: {uploadedFiles.property.name}
              </p>
            )}
          </div>
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center gap-3 p-4 bg-primary/10 rounded-lg">
            <Icon name="Loader2" className="animate-spin" size={20} />
            <p className="font-medium">Распознавание документа...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}