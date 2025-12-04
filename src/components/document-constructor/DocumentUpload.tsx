import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { PersonalData, CreditData, IncomeData, PropertyData } from "./types";

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

  const handleProcessPassport = async () => {
    if (!uploadedFiles.passport) {
      alert("Загрузите скан паспорта");
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockData: PersonalData = {
        fullName: "Петров Петр Петрович",
        inn: "987654321012",
        snils: "987-654-321 00",
        birthDate: "15.05.1985",
        birthPlace: "г. Санкт-Петербург",
        passport: {
          series: "4010",
          number: "654321",
          issueDate: "15.05.2015",
          issuedBy: "ОУФМС России по СПб",
          code: "780-002",
        },
        registration: {
          address: "г. Санкт-Петербург, пр. Невский, д. 100, кв. 50",
          date: "15.05.2015",
        },
        maritalStatus: {
          status: "женат",
          spouseName: "Петрова Анна Ивановна",
          marriageDate: "01.07.2010",
        },
        children: [
          {
            name: "Петрова Мария Петровна",
            birthDate: "10.03.2012",
            isMinor: true,
          },
        ],
      };

      onPersonalDataExtracted(mockData);
      alert("Данные из паспорта успешно распознаны!");
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
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockData: CreditData = {
        creditors: [
          {
            name: "ВТБ (ПАО)",
            inn: "7702070139",
            credits: [
              {
                contractNumber: "VTB-2021-12345",
                amount: 800000,
                debt: 950000,
                date: "15.03.2021",
              },
            ],
          },
          {
            name: "АО «Альфа-Банк»",
            inn: "7728168971",
            credits: [
              {
                contractNumber: "ALFA-2020-67890",
                amount: 200000,
                debt: 280000,
                date: "10.08.2020",
              },
            ],
          },
        ],
        totalDebt: 1230000,
        executiveDocuments: [
          {
            number: "98765432/2024",
            date: "15.02.2024",
            amount: 950000,
            creditor: "ВТБ (ПАО)",
          },
        ],
      };

      onCreditDataExtracted(mockData);
      alert("Данные из БКИ успешно распознаны!");
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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockData: IncomeData = {
        monthlyIncome: 45000,
        source: "заработная плата",
        lastYear: 540000,
      };

      onIncomeDataExtracted(mockData);
      alert("Данные о доходах успешно распознаны!");
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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockData: PropertyData = {
        realEstate: [
          {
            type: "квартира",
            address: "г. Санкт-Петербург, пр. Невский, д. 100, кв. 50",
            cadastralNumber: "78:01:0002003:5678",
            value: 12000000,
          },
        ],
        vehicles: [],
      };

      onPropertyDataExtracted(mockData);
      alert("Данные об имуществе успешно распознаны!");
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
