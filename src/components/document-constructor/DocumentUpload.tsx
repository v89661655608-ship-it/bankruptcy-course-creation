import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { PersonalData, CreditData, IncomeData, PropertyData } from "./types";
import DocumentUploadCard from "./DocumentUploadCard";
import { useDocumentProcessors } from "./useDocumentProcessors";

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
    inn?: File;
    snils?: File;
  }>({});

  const handleFileUpload = (type: "passport" | "bki" | "income" | "property" | "inn" | "snils", file: File) => {
    setUploadedFiles({ ...uploadedFiles, [type]: file });
  };

  const {
    handleProcessPassport,
    handleProcessBki,
    handleProcessIncome,
    handleProcessProperty
  } = useDocumentProcessors({
    uploadedFiles,
    setIsProcessing,
    onPersonalDataExtracted,
    onCreditDataExtracted,
    onIncomeDataExtracted,
    onPropertyDataExtracted
  });

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
          <DocumentUploadCard
            title="Паспорт РФ"
            description="Страницы 2-3 (фото + прописка)"
            iconName="IdCard"
            file={uploadedFiles.passport}
            isProcessing={isProcessing}
            onFileSelect={(file) => handleFileUpload("passport", file)}
            onProcess={handleProcessPassport}
          />

          <DocumentUploadCard
            title="Выписка из БКИ"
            description="Бюро кредитных историй"
            iconName="FileText"
            file={uploadedFiles.bki}
            isProcessing={isProcessing}
            onFileSelect={(file) => handleFileUpload("bki", file)}
            onProcess={handleProcessBki}
          />

          <DocumentUploadCard
            title="Справка о доходах"
            description="2-НДФЛ или справка с работы (необязательно)"
            iconName="Wallet"
            file={uploadedFiles.income}
            isProcessing={isProcessing}
            onFileSelect={(file) => handleFileUpload("income", file)}
            onProcess={handleProcessIncome}
          />

          <DocumentUploadCard
            title="Выписка из ЕГРН"
            description="Сведения об имуществе (необязательно)"
            iconName="Home"
            file={uploadedFiles.property}
            isProcessing={isProcessing}
            onFileSelect={(file) => handleFileUpload("property", file)}
            onProcess={handleProcessProperty}
          />

          <DocumentUploadCard
            title="Свидетельство ИНН"
            description="Индивидуальный номер налогоплательщика (необязательно)"
            iconName="FileDigit"
            file={uploadedFiles.inn}
            isProcessing={isProcessing}
            onFileSelect={(file) => handleFileUpload("inn", file)}
            showProcessButton={false}
          />

          <DocumentUploadCard
            title="Свидетельство СНИЛС"
            description="Страховой номер индивидуального лицевого счёта (необязательно)"
            iconName="CreditCard"
            file={uploadedFiles.snils}
            isProcessing={isProcessing}
            onFileSelect={(file) => handleFileUpload("snils", file)}
            showProcessButton={false}
          />
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
