import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { AdditionalFields } from "./types";
import funcUrls from '../../../backend/func2url.json';

interface AddressSuggestion {
  value: string;
  unrestricted_value: string;
  data: {
    postal_code?: string;
    country?: string;
    region?: string;
    city?: string;
    street?: string;
    house?: string;
  };
}

interface AdditionalFieldsFormProps {
  initialData?: AdditionalFields;
  onSave: (data: AdditionalFields) => void;
  onCancel: () => void;
}

export default function AdditionalFieldsForm({ initialData, onSave, onCancel }: AdditionalFieldsFormProps) {
  const [formData, setFormData] = useState<AdditionalFields>(
    initialData || {
      courtName: "Арбитражный суд города Москвы",
      courtAddress: "",
      phone: "",
      email: ""
    }
  );

  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const addressSuggestionsRef = useRef<HTMLDivElement>(null);

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    setIsSearchingAddress(true);
    try {
      const response = await fetch(
        `${funcUrls['address-suggest']}?query=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setAddressSuggestions(data.suggestions || []);
        setShowAddressSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleAddressChange = (value: string) => {
    setFormData({ ...formData, courtAddress: value });
    searchAddresses(value);
  };

  const selectAddress = (suggestion: AddressSuggestion) => {
    setFormData({ ...formData, courtAddress: suggestion.value });
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleSave = () => {
    // Поля phone и email теперь в PersonalDataForm, поэтому очищаем их здесь
    const dataToSave = {
      courtName: formData.courtName,
      courtAddress: formData.courtAddress,
      phone: "",
      email: ""
    };
    onSave(dataToSave);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="courtName">Название суда</Label>
          <Input
            id="courtName"
            value={formData.courtName}
            onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
            placeholder="Арбитражный суд города Москвы"
          />
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="courtAddress">Адрес суда</Label>
          <div className="relative">
            <Input
              id="courtAddress"
              value={formData.courtAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="г. Москва, ул. Большая Тульская, д. 17"
            />
            {isSearchingAddress && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Icon name="Loader2" size={16} className="animate-spin text-gray-400" />
              </div>
            )}
          </div>
          {showAddressSuggestions && addressSuggestions.length > 0 && (
            <div
              ref={addressSuggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {addressSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => selectAddress(suggestion)}
                >
                  {suggestion.value}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            <Icon name="Check" size={16} className="mr-2" />
            Сохранить
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            <Icon name="X" size={16} className="mr-2" />
            Отмена
          </Button>
        </div>
      </form>
    </Card>
  );
}