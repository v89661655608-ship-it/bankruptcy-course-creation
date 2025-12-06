import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { PersonalData } from "../types";
import BasicInfoSection from "./personal-sections/BasicInfoSection";
import PassportSection from "./personal-sections/PassportSection";
import RegistrationAddressSection from "./personal-sections/RegistrationAddressSection";
import MaritalStatusSection from "./personal-sections/MaritalStatusSection";
import ContactInfoSection from "./personal-sections/ContactInfoSection";

interface AddressSuggestion {
  value: string;
  unrestricted_value: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface PersonalDataFormProps {
  onSubmit: (data: PersonalData) => void;
}

export default function PersonalDataForm({ onSubmit }: PersonalDataFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Загружаем сохраненные данные из localStorage при инициализации
  const [personalForm, setPersonalForm] = useState(() => {
    const saved = localStorage.getItem('personalDataForm');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Ошибка загрузки сохраненных данных:', e);
      }
    }
    return {
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
      phone: "",
      email: "",
    };
  });

  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const addressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const addressSuggestionsRef = useRef<HTMLDivElement>(null);

  // Автосохранение данных формы в localStorage
  useEffect(() => {
    localStorage.setItem('personalDataForm', JSON.stringify(personalForm));
  }, [personalForm]);

  // Закрытие подсказок адресов при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressSuggestionsRef.current && !addressSuggestionsRef.current.contains(event.target as Node)) {
        setShowAddressSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Поиск адресов через backend функцию
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setIsSearchingAddress(true);

    try {
      const response = await fetch(`https://functions.poehali.dev/e70430d4-8e99-429d-bbad-1362dfe63771?query=${encodeURIComponent(query)}&type=address`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const results: AddressSuggestion[] = data.suggestions || [];

      setAddressSuggestions(results);
      setShowAddressSuggestions(results.length > 0);
      
      if (results.length === 0) {
        setAddressSuggestions([{
          value: '❌ Ничего не найдено. Попробуйте другой запрос.',
          unrestricted_value: ''
        }]);
        setShowAddressSuggestions(true);
      }
    } catch (error) {
      console.error('Ошибка поиска адреса:', error);
      setAddressSuggestions([{
        value: '⚠️ Ошибка сервиса поиска. Введите адрес вручную.',
        unrestricted_value: ''
      }]);
      setShowAddressSuggestions(true);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Обработчик изменения поля адреса
  const handleAddressChange = (value: string) => {
    setPersonalForm({ ...personalForm, registrationAddress: value });

    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }

    addressTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 500);
  };

  // Выбор адреса из подсказок
  const selectAddress = (suggestion: AddressSuggestion) => {
    if (!suggestion.unrestricted_value) {
      setShowAddressSuggestions(false);
      return;
    }
    
    setPersonalForm({
      ...personalForm,
      registrationAddress: suggestion.value
    });
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  };

  const handleAddressFocus = () => {
    if (addressSuggestions.length > 0) {
      setShowAddressSuggestions(true);
    }
  };

  // Обработчик изменения полей формы
  const handleFieldChange = (field: string, value: string) => {
    setPersonalForm({ ...personalForm, [field]: value });
  };

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
      phone: personalForm.phone || undefined,
      email: personalForm.email || undefined,
    };
    onSubmit(data);
    alert("Персональные данные сохранены");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BasicInfoSection
        personalForm={{
          fullName: personalForm.fullName,
          inn: personalForm.inn,
          snils: personalForm.snils,
          birthDate: personalForm.birthDate,
          birthPlace: personalForm.birthPlace,
        }}
        errors={errors}
        onChange={handleFieldChange}
      />

      <PassportSection
        personalForm={{
          passportSeries: personalForm.passportSeries,
          passportNumber: personalForm.passportNumber,
          passportIssueDate: personalForm.passportIssueDate,
          passportIssuedBy: personalForm.passportIssuedBy,
          passportCode: personalForm.passportCode,
        }}
        errors={errors}
        onChange={handleFieldChange}
      />

      <RegistrationAddressSection
        personalForm={{
          registrationAddress: personalForm.registrationAddress,
          registrationDate: personalForm.registrationDate,
        }}
        errors={errors}
        addressSuggestions={addressSuggestions}
        showAddressSuggestions={showAddressSuggestions}
        isSearchingAddress={isSearchingAddress}
        addressSuggestionsRef={addressSuggestionsRef}
        onChange={handleFieldChange}
        onAddressChange={handleAddressChange}
        onAddressFocus={handleAddressFocus}
        onSelectAddress={selectAddress}
      />

      <MaritalStatusSection
        personalForm={{
          maritalStatus: personalForm.maritalStatus,
          spouseName: personalForm.spouseName,
          marriageDate: personalForm.marriageDate,
          divorceDate: personalForm.divorceDate,
        }}
        onChange={handleFieldChange}
      />

      <ContactInfoSection
        personalForm={{
          phone: personalForm.phone,
          email: personalForm.email,
        }}
        onChange={handleFieldChange}
      />

      <Button type="submit" className="w-full">
        <Icon name="Save" className="mr-2" size={18} />
        Сохранить личные данные
      </Button>
    </form>
  );
}
