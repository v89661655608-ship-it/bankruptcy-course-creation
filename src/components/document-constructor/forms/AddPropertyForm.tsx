import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import funcUrls from "../../../../backend/func2url.json";

interface ValidationErrors {
  [key: string]: string;
}

interface PropertyFormData {
  propertyType: string;
  address: string;
  cadastralNumber: string;
  value: string;
  area: string;
  landArea: string;
  isSoleResidence: boolean;
}

interface AddPropertyFormProps {
  propertyForm: PropertyFormData;
  setPropertyForm: (form: PropertyFormData) => void;
  errors: ValidationErrors;
  onAddProperty: () => void;
}

export default function AddPropertyForm({ 
  propertyForm, 
  setPropertyForm, 
  errors, 
  onAddProperty 
}: AddPropertyFormProps) {
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`${funcUrls['address-suggest']}?query=${encodeURIComponent(query)}`);

      if (response.ok) {
        const data = await response.json();
        setAddressSuggestions(data.suggestions || []);
        setShowAddressSuggestions(true);
      }
    } catch (error) {
      console.error('Ошибка поиска адреса:', error);
    }
  };

  const handleAddressChange = (value: string) => {
    setPropertyForm({ ...propertyForm, address: value });
    searchAddresses(value);
  };

  const selectAddress = (suggestion: any) => {
    setPropertyForm({ ...propertyForm, address: suggestion.value });
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  return (
    <div className="border rounded-lg p-4 bg-muted/50">
      <h3 className="font-medium mb-3">Добавить имущество</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="propertyType">Тип имущества</Label>
          <Input
            id="propertyType"
            value={propertyForm.propertyType}
            onChange={(e) =>
              setPropertyForm({
                ...propertyForm,
                propertyType: e.target.value,
              })
            }
            placeholder="квартира, дом, гараж"
            className={errors.propertyType ? 'border-red-500' : ''}
          />
          {errors.propertyType && (
            <p className="text-sm text-red-500 mt-1">{errors.propertyType}</p>
          )}
        </div>
        <div>
          <Label htmlFor="cadastralNumber">Кадастровый номер</Label>
          <Input
            id="cadastralNumber"
            value={propertyForm.cadastralNumber}
            onChange={(e) =>
              setPropertyForm({
                ...propertyForm,
                cadastralNumber: e.target.value,
              })
            }
            placeholder="XX:XX:XXXXXXX:XXX"
            className={errors.cadastralNumber ? 'border-red-500' : ''}
          />
          {errors.cadastralNumber && (
            <p className="text-sm text-red-500 mt-1">{errors.cadastralNumber}</p>
          )}
        </div>
        <div className="sm:col-span-2 relative">
          <Label htmlFor="address">Адрес</Label>
          <Input
            ref={addressInputRef}
            id="address"
            value={propertyForm.address}
            onChange={(e) => handleAddressChange(e.target.value)}
            onFocus={() => propertyForm.address.length >= 3 && setShowAddressSuggestions(true)}
            placeholder="Начните вводить адрес..."
            className={errors.address ? 'border-red-500' : ''}
          />
          {showAddressSuggestions && addressSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {addressSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => selectAddress(suggestion)}
                  className="px-4 py-2 hover:bg-purple-50 cursor-pointer border-b last:border-b-0"
                >
                  <p className="text-sm font-medium">{suggestion.value}</p>
                </div>
              ))}
            </div>
          )}
          {errors.address && (
            <p className="text-sm text-red-500 mt-1">{errors.address}</p>
          )}
        </div>
        <div>
          <Label htmlFor="value">Стоимость (₽)</Label>
          <Input
            id="value"
            type="number"
            value={propertyForm.value}
            onChange={(e) =>
              setPropertyForm({ ...propertyForm, value: e.target.value })
            }
            min="0"
            className={errors.value ? 'border-red-500' : ''}
          />
          {errors.value && (
            <p className="text-sm text-red-500 mt-1">{errors.value}</p>
          )}
        </div>
        <div>
          <Label htmlFor="area">Площадь (кв. м)</Label>
          <Input
            id="area"
            type="number"
            value={propertyForm.area}
            onChange={(e) =>
              setPropertyForm({ ...propertyForm, area: e.target.value })
            }
            min="0"
            placeholder="Общая площадь"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="landArea">Площадь земельного участка (кв. м)</Label>
          <Input
            id="landArea"
            type="number"
            value={propertyForm.landArea}
            onChange={(e) =>
              setPropertyForm({ ...propertyForm, landArea: e.target.value })
            }
            min="0"
            placeholder="Если есть земельный участок"
          />
        </div>
        <div className="sm:col-span-2 flex items-center space-x-2">
          <Checkbox
            id="isSoleResidence"
            checked={propertyForm.isSoleResidence}
            onCheckedChange={(checked) =>
              setPropertyForm({ ...propertyForm, isSoleResidence: checked as boolean })
            }
          />
          <Label htmlFor="isSoleResidence" className="text-sm font-normal cursor-pointer">
            Является единственным пригодным для постоянного проживания жильем и не подлежит реализации
          </Label>
        </div>
      </div>
      <Button
        type="button"
        onClick={onAddProperty}
        variant="outline"
        className="w-full mt-3"
      >
        <Icon name="Plus" className="mr-2" size={18} />
        Добавить имущество
      </Button>
    </div>
  );
}
