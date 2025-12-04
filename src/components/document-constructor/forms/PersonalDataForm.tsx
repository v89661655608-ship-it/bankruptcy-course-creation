import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { PersonalData } from "../types";

interface ValidationErrors {
  [key: string]: string;
}

interface PersonalDataFormProps {
  onSubmit: (data: PersonalData) => void;
}

export default function PersonalDataForm({ onSubmit }: PersonalDataFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [personalForm, setPersonalForm] = useState({
    fullName: "",
    inn: "",
    snils: "",
    birthDate: "",
    birthPlace: "",
    passportSeries: "",
    passportNumber: "",
    passportIssueDate: "",
    passportIssuedBy: "",
    passportCode: "",
    registrationAddress: "",
    registrationDate: "",
    maritalStatus: "",
    spouseName: "",
    marriageDate: "",
    divorceDate: "",
  });

  const validateInn = (inn: string): boolean => {
    if (!/^\d{12}$/.test(inn)) return false;
    const coefficients = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(inn[i]) * coefficients[i];
    }
    const checksum = (sum % 11) % 10;
    return checksum === parseInt(inn[10]);
  };

  const validateSnils = (snils: string): boolean => {
    const cleaned = snils.replace(/[^\d]/g, '');
    return /^\d{11}$/.test(cleaned);
  };

  const validatePassportSeries = (series: string): boolean => {
    const cleaned = series.replace(/\s/g, '');
    return /^\d{4}$/.test(cleaned);
  };

  const validatePassportNumber = (number: string): boolean => {
    return /^\d{6}$/.test(number);
  };

  const validatePassportCode = (code: string): boolean => {
    return /^\d{3}-?\d{3}$/.test(code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: ValidationErrors = {};

    if (!personalForm.fullName || personalForm.fullName.length < 5) {
      newErrors.fullName = 'Введите полное ФИО (минимум 5 символов)';
    }

    if (personalForm.inn && !validateInn(personalForm.inn)) {
      newErrors.inn = 'Неверный формат ИНН (12 цифр с контрольной суммой)';
    }

    if (personalForm.snils && !validateSnils(personalForm.snils)) {
      newErrors.snils = 'Неверный формат СНИЛС (11 цифр)';
    }

    if (!personalForm.passportSeries || !validatePassportSeries(personalForm.passportSeries)) {
      newErrors.passportSeries = 'Серия паспорта: 4 цифры';
    }

    if (!personalForm.passportNumber || !validatePassportNumber(personalForm.passportNumber)) {
      newErrors.passportNumber = 'Номер паспорта: 6 цифр';
    }

    if (personalForm.passportCode && !validatePassportCode(personalForm.passportCode)) {
      newErrors.passportCode = 'Код подразделения: формат XXX-XXX';
    }

    if (!personalForm.registrationAddress || personalForm.registrationAddress.length < 10) {
      newErrors.registrationAddress = 'Введите полный адрес (минимум 10 символов)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setErrors({});
    const data: PersonalData = {
      fullName: personalForm.fullName,
      inn: personalForm.inn,
      snils: personalForm.snils,
      birthDate: personalForm.birthDate,
      birthPlace: personalForm.birthPlace,
      passport: {
        series: personalForm.passportSeries,
        number: personalForm.passportNumber,
        issueDate: personalForm.passportIssueDate,
        issuedBy: personalForm.passportIssuedBy,
        code: personalForm.passportCode,
      },
      registration: {
        address: personalForm.registrationAddress,
        date: personalForm.registrationDate,
      },
      maritalStatus: {
        status: personalForm.maritalStatus,
        spouseName: personalForm.spouseName || undefined,
        marriageDate: personalForm.marriageDate || undefined,
        divorceDate: personalForm.divorceDate || undefined,
      },
      children: [],
    };
    onSubmit(data);
    alert("Персональные данные сохранены");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">ФИО *</Label>
          <Input
            id="fullName"
            value={personalForm.fullName}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, fullName: e.target.value })
            }
            required
            className={errors.fullName ? 'border-red-500' : ''}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
          )}
        </div>
        <div>
          <Label htmlFor="birthDate">Дата рождения *</Label>
          <Input
            id="birthDate"
            type="date"
            value={personalForm.birthDate}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, birthDate: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="birthPlace">Место рождения *</Label>
          <Input
            id="birthPlace"
            value={personalForm.birthPlace}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, birthPlace: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="inn">ИНН *</Label>
          <Input
            id="inn"
            value={personalForm.inn}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, inn: e.target.value })
            }
            placeholder="12 цифр"
            maxLength={12}
            required
            className={errors.inn ? 'border-red-500' : ''}
          />
          {errors.inn && (
            <p className="text-sm text-red-500 mt-1">{errors.inn}</p>
          )}
        </div>
        <div>
          <Label htmlFor="snils">СНИЛС *</Label>
          <Input
            id="snils"
            placeholder="123-456-789 00"
            value={personalForm.snils}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, snils: e.target.value })
            }
            required
            className={errors.snils ? 'border-red-500' : ''}
          />
          {errors.snils && (
            <p className="text-sm text-red-500 mt-1">{errors.snils}</p>
          )}
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-medium mb-3">Паспортные данные</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="passportSeries">Серия *</Label>
            <Input
              id="passportSeries"
              value={personalForm.passportSeries}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  passportSeries: e.target.value,
                })
              }
              placeholder="45 18"
              maxLength={5}
              required
              className={errors.passportSeries ? 'border-red-500' : ''}
            />
            {errors.passportSeries && (
              <p className="text-sm text-red-500 mt-1">{errors.passportSeries}</p>
            )}
          </div>
          <div>
            <Label htmlFor="passportNumber">Номер *</Label>
            <Input
              id="passportNumber"
              value={personalForm.passportNumber}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  passportNumber: e.target.value,
                })
              }
              placeholder="123456"
              maxLength={6}
              required
              className={errors.passportNumber ? 'border-red-500' : ''}
            />
            {errors.passportNumber && (
              <p className="text-sm text-red-500 mt-1">{errors.passportNumber}</p>
            )}
          </div>
          <div>
            <Label htmlFor="passportIssueDate">Дата выдачи *</Label>
            <Input
              id="passportIssueDate"
              type="date"
              value={personalForm.passportIssueDate}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  passportIssueDate: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="passportCode">Код подразделения *</Label>
            <Input
              id="passportCode"
              placeholder="770-001"
              value={personalForm.passportCode}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  passportCode: e.target.value,
                })
              }
              maxLength={7}
              required
              className={errors.passportCode ? 'border-red-500' : ''}
            />
            {errors.passportCode && (
              <p className="text-sm text-red-500 mt-1">{errors.passportCode}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="passportIssuedBy">Кем выдан *</Label>
            <Input
              id="passportIssuedBy"
              value={personalForm.passportIssuedBy}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  passportIssuedBy: e.target.value,
                })
              }
              required
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-medium mb-3">Адрес регистрации</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="registrationAddress">Адрес *</Label>
            <Input
              id="registrationAddress"
              value={personalForm.registrationAddress}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  registrationAddress: e.target.value,
                })
              }
              required
              className={errors.registrationAddress ? 'border-red-500' : ''}
            />
            {errors.registrationAddress && (
              <p className="text-sm text-red-500 mt-1">{errors.registrationAddress}</p>
            )}
          </div>
          <div>
            <Label htmlFor="registrationDate">Дата регистрации</Label>
            <Input
              id="registrationDate"
              type="date"
              value={personalForm.registrationDate}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  registrationDate: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Icon name="Save" className="mr-2" size={18} />
        Сохранить личные данные
      </Button>
    </form>
  );
}