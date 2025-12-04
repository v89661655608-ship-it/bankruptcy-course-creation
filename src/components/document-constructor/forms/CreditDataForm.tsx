import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { CreditData } from "../types";

interface CompanySuggestion {
  inn: string;
  name: string;
  fullName: string;
  address: string;
  ogrn: string;
  kpp: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface CreditDataFormProps {
  onSubmit: (data: CreditData) => void;
}

export default function CreditDataForm({ onSubmit }: CreditDataFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Загружаем сохраненные данные из localStorage
  const [creditForm, setCreditForm] = useState(() => {
    const saved = localStorage.getItem('creditDataForm');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Ошибка загрузки сохраненных данных:', e);
      }
    }
    return {
      creditorName: "",
      creditorInn: "",
      creditorLegalAddress: "",
      contractNumber: "",
      creditAmount: "",
      debtAmount: "",
      contractDate: "",
    };
  });

  const [creditors, setCreditors] = useState<any[]>(() => {
    const saved = localStorage.getItem('creditorsData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Ошибка загрузки сохраненных кредиторов:', e);
      }
    }
    return [];
  });
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Автосохранение данных формы в localStorage
  useEffect(() => {
    localStorage.setItem('creditDataForm', JSON.stringify(creditForm));
  }, [creditForm]);

  // Автосохранение списка кредиторов
  useEffect(() => {
    localStorage.setItem('creditorsData', JSON.stringify(creditors));
  }, [creditors]);

  // Закрытие подсказок при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Поиск организаций через backend функцию с DaData API
  const searchCompany = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(`https://functions.poehali.dev/e70430d4-8e99-429d-bbad-1362dfe63771?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const results: CompanySuggestion[] = data.suggestions || [];

      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      
      if (results.length === 0) {
        setSuggestions([{
          inn: '',
          name: '❌ Ничего не найдено. Попробуйте другой запрос или введите вручную.',
          fullName: '',
          address: '',
          ogrn: '',
          kpp: ''
        }]);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Ошибка поиска организации:', error);
      setSuggestions([{
        inn: '',
        name: '⚠️ Ошибка сервиса поиска. Введите данные вручную.',
        fullName: '',
        address: '',
        ogrn: '',
        kpp: ''
      }]);
      setShowSuggestions(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Обработчик изменения поля поиска
  const handleSearchChange = (value: string, field: 'name' | 'inn') => {
    setSearchQuery(value);
    
    if (field === 'name') {
      setCreditForm({ ...creditForm, creditorName: value });
    } else {
      setCreditForm({ ...creditForm, creditorInn: value });
    }

    // Дебаунс для поиска
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchCompany(value);
    }, 500);
  };

  // Выбор организации из подсказок
  const selectSuggestion = (suggestion: CompanySuggestion) => {
    // Не выбираем сообщение об ошибке
    if (!suggestion.inn) {
      setShowSuggestions(false);
      return;
    }
    
    setCreditForm({
      ...creditForm,
      creditorName: suggestion.name,
      creditorInn: suggestion.inn,
      creditorLegalAddress: suggestion.address
    });
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleAddCreditor = () => {
    const newErrors: ValidationErrors = {};

    if (!creditForm.creditorName || creditForm.creditorName.length < 3) {
      newErrors.creditorName = 'Введите название кредитора (минимум 3 символа)';
    }

    if (!creditForm.debtAmount || parseFloat(creditForm.debtAmount) <= 0) {
      newErrors.debtAmount = 'Укажите сумму долга (больше 0)';
    }

    if (creditForm.creditAmount && parseFloat(creditForm.creditAmount) < 0) {
      newErrors.creditAmount = 'Сумма кредита не может быть отрицательной';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const newCreditor = {
      name: creditForm.creditorName,
      inn: creditForm.creditorInn,
      legalAddress: creditForm.creditorLegalAddress,
      credits: [
        {
          contractNumber: creditForm.contractNumber,
          amount: parseFloat(creditForm.creditAmount) || 0,
          debt: parseFloat(creditForm.debtAmount),
          date: creditForm.contractDate,
        },
      ],
    };

    setCreditors([...creditors, newCreditor]);
    setCreditForm({
      creditorName: "",
      creditorInn: "",
      creditorLegalAddress: "",
      contractNumber: "",
      creditAmount: "",
      debtAmount: "",
      contractDate: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (creditors.length === 0) {
      alert("Добавьте хотя бы одного кредитора");
      return;
    }

    const totalDebt = creditors.reduce(
      (sum, creditor) =>
        sum + creditor.credits.reduce((s: number, c: any) => s + c.debt, 0),
      0
    );

    const data: CreditData = {
      creditors,
      totalDebt,
      executiveDocuments: [],
    };

    onSubmit(data);
    alert("Данные о кредитах сохранены");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-lg p-4 bg-muted/50">
        <h3 className="font-medium mb-3">Добавить кредитора</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="relative">
            <Label htmlFor="creditorName">Название кредитора</Label>
            <div className="relative">
              <Input
                id="creditorName"
                value={creditForm.creditorName}
                onChange={(e) => handleSearchChange(e.target.value, 'name')}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="ПАО Сбербанк"
                className={errors.creditorName ? 'border-red-500' : ''}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            {errors.creditorName && (
              <p className="text-sm text-red-500 mt-1">{errors.creditorName}</p>
            )}
            
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectSuggestion(suggestion)}
                    className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                  >
                    <p className="font-medium text-sm">{suggestion.name}</p>
                    <p className="text-xs text-muted-foreground">ИНН: {suggestion.inn}</p>
                    {suggestion.address && (
                      <p className="text-xs text-muted-foreground truncate">{suggestion.address}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="creditorInn">ИНН кредитора</Label>
            <Input
              id="creditorInn"
              value={creditForm.creditorInn}
              onChange={(e) => handleSearchChange(e.target.value, 'inn')}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="7707083893"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="creditorLegalAddress">Юридический адрес кредитора</Label>
            <Input
              id="creditorLegalAddress"
              value={creditForm.creditorLegalAddress}
              onChange={(e) =>
                setCreditForm({ ...creditForm, creditorLegalAddress: e.target.value })
              }
              placeholder="г. Москва, ул. Вавилова, д. 19"
            />
          </div>
          <div>
            <Label htmlFor="contractNumber">Номер договора</Label>
            <Input
              id="contractNumber"
              value={creditForm.contractNumber}
              onChange={(e) =>
                setCreditForm({
                  ...creditForm,
                  contractNumber: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="contractDate">Дата договора</Label>
            <Input
              id="contractDate"
              type="date"
              value={creditForm.contractDate}
              onChange={(e) =>
                setCreditForm({ ...creditForm, contractDate: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="creditAmount">Сумма кредита (₽)</Label>
            <Input
              id="creditAmount"
              type="number"
              value={creditForm.creditAmount}
              onChange={(e) =>
                setCreditForm({ ...creditForm, creditAmount: e.target.value })
              }
              min="0"
              className={errors.creditAmount ? 'border-red-500' : ''}
            />
            {errors.creditAmount && (
              <p className="text-sm text-red-500 mt-1">{errors.creditAmount}</p>
            )}
          </div>
          <div>
            <Label htmlFor="debtAmount">Сумма долга (₽)</Label>
            <Input
              id="debtAmount"
              type="number"
              value={creditForm.debtAmount}
              onChange={(e) =>
                setCreditForm({ ...creditForm, debtAmount: e.target.value })
              }
              min="0"
              className={errors.debtAmount ? 'border-red-500' : ''}
            />
            {errors.debtAmount && (
              <p className="text-sm text-red-500 mt-1">{errors.debtAmount}</p>
            )}
          </div>
        </div>
        <Button
          type="button"
          onClick={handleAddCreditor}
          variant="outline"
          className="w-full mt-3"
        >
          <Icon name="Plus" className="mr-2" size={18} />
          Добавить кредитора
        </Button>
      </div>

      {creditors.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Добавленные кредиторы:</h3>
          {creditors.map((creditor, idx) => (
            <div key={idx} className="border rounded p-3 bg-background">
              <p className="font-medium">{creditor.name}</p>
              {creditor.legalAddress && (
                <p className="text-sm text-muted-foreground">
                  Адрес: {creditor.legalAddress}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Долг: {creditor.credits[0].debt.toLocaleString()} ₽
              </p>
            </div>
          ))}
        </div>
      )}

      <Button type="submit" className="w-full">
        <Icon name="Save" className="mr-2" size={18} />
        Сохранить данные о кредитах
      </Button>
    </form>
  );
}