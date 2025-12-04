import { PersonalData, CreditData, IncomeData, PropertyData } from "./types";
import { useOcrProcessing } from "./useOcrProcessing";

interface UploadedFiles {
  passport?: File;
  bki?: File;
  income?: File;
  property?: File;
  inn?: File;
  snils?: File;
}

interface DocumentProcessorsParams {
  uploadedFiles: UploadedFiles;
  setIsProcessing: (value: boolean) => void;
  onPersonalDataExtracted: (data: PersonalData) => void;
  onCreditDataExtracted: (data: CreditData) => void;
  onIncomeDataExtracted: (data: IncomeData) => void;
  onPropertyDataExtracted: (data: PropertyData) => void;
}

export const useDocumentProcessors = ({
  uploadedFiles,
  setIsProcessing,
  onPersonalDataExtracted,
  onCreditDataExtracted,
  onIncomeDataExtracted,
  onPropertyDataExtracted
}: DocumentProcessorsParams) => {
  const { callOcrApi, parseOcrText } = useOcrProcessing();

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

  return {
    handleProcessPassport,
    handleProcessBki,
    handleProcessIncome,
    handleProcessProperty
  };
};
