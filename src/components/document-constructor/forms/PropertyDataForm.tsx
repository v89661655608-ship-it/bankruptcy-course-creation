import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { PropertyData } from "../types";
import { useToast } from "@/hooks/use-toast";

interface ValidationErrors {
  [key: string]: string;
}

interface PropertyDataFormProps {
  onSubmit: (data: PropertyData) => void;
}

export default function PropertyDataForm({ onSubmit }: PropertyDataFormProps) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [noProperty, setNoProperty] = useState(false);
  const [propertyForm, setPropertyForm] = useState({
    propertyType: "",
    address: "",
    cadastralNumber: "",
    value: "",
    area: "",
    landArea: "",
    isSoleResidence: false,
  });

  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    try {
      const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Token 7c3000a82bae1cfe5f3d0d2ca9b8a03b506a370b'
        },
        body: JSON.stringify({ query, count: 5 })
      });

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

  const [vehicleForm, setVehicleForm] = useState({
    type: "",
    brand: "",
    model: "",
    year: "",
    registrationNumber: "",
    vin: "",
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const validateCadastralNumber = (number: string): boolean => {
    return /^\d{2}:\d{2}:\d{6,7}:\d{1,5}$/.test(number);
  };

  const handleAddProperty = () => {
    const newErrors: ValidationErrors = {};

    if (!propertyForm.propertyType || propertyForm.propertyType.length < 2) {
      newErrors.propertyType = 'Укажите тип имущества (минимум 2 символа)';
    }

    if (!propertyForm.address || propertyForm.address.length < 10) {
      newErrors.address = 'Укажите полный адрес (минимум 10 символов)';
    }

    if (propertyForm.cadastralNumber && !validateCadastralNumber(propertyForm.cadastralNumber)) {
      newErrors.cadastralNumber = 'Неверный формат кадастрового номера (XX:XX:XXXXXXX:XXX)';
    }

    if (propertyForm.value && parseFloat(propertyForm.value) < 0) {
      newErrors.value = 'Стоимость не может быть отрицательной';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const newProperty = {
      type: propertyForm.propertyType,
      address: propertyForm.address,
      cadastralNumber: propertyForm.cadastralNumber,
      value: parseFloat(propertyForm.value) || 0,
      area: parseFloat(propertyForm.area) || undefined,
      landArea: parseFloat(propertyForm.landArea) || undefined,
      isSoleResidence: propertyForm.isSoleResidence,
    };

    setProperties([...properties, newProperty]);
    setPropertyForm({
      propertyType: "",
      address: "",
      cadastralNumber: "",
      value: "",
      area: "",
      landArea: "",
      isSoleResidence: false,
    });

    toast({
      title: 'Имущество добавлено',
      description: `${propertyForm.propertyType} по адресу: ${propertyForm.address}`,
    });
  };

  const handleAddVehicle = () => {
    const newErrors: ValidationErrors = {};

    if (!vehicleForm.brand || vehicleForm.brand.length < 2) {
      newErrors.brand = 'Укажите марку автомобиля';
    }

    if (!vehicleForm.model || vehicleForm.model.length < 2) {
      newErrors.model = 'Укажите модель автомобиля';
    }

    if (!vehicleForm.year || parseInt(vehicleForm.year) < 1900 || parseInt(vehicleForm.year) > new Date().getFullYear() + 1) {
      newErrors.year = 'Укажите корректный год выпуска';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const newVehicle = {
      type: vehicleForm.type || 'легковой автомобиль',
      brand: vehicleForm.brand,
      model: vehicleForm.model,
      year: parseInt(vehicleForm.year),
      registrationNumber: vehicleForm.registrationNumber,
      vin: vehicleForm.vin,
    };

    setVehicles([...vehicles, newVehicle]);
    setVehicleForm({
      type: "",
      brand: "",
      model: "",
      year: "",
      registrationNumber: "",
      vin: "",
    });

    toast({
      title: 'ТС добавлено',
      description: `${vehicleForm.brand} ${vehicleForm.model} (${vehicleForm.year} г.)`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: PropertyData = {
      noProperty: noProperty,
      realEstate: properties,
      vehicles: vehicles,
    };
    onSubmit(data);
    toast({
      title: 'Сохранено',
      description: 'Данные об имуществе успешно сохранены',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2 p-4 border rounded-lg bg-background">
        <Checkbox
          id="noProperty"
          checked={noProperty}
          onCheckedChange={(checked) => setNoProperty(checked as boolean)}
        />
        <Label htmlFor="noProperty" className="text-sm font-normal cursor-pointer">
          Имущество отсутствует
        </Label>
      </div>

      {!noProperty && (
      <>
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
          onClick={handleAddProperty}
          variant="outline"
          className="w-full mt-3"
        >
          <Icon name="Plus" className="mr-2" size={18} />
          Добавить имущество
        </Button>
      </div>

      <div className="border rounded-lg p-4 bg-muted/50">
        <h3 className="font-medium mb-3">Добавить транспортное средство</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand">Марка</Label>
            <Input
              id="brand"
              value={vehicleForm.brand}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, brand: e.target.value })
              }
              placeholder="Toyota, BMW, Лада"
              className={errors.brand ? 'border-red-500' : ''}
            />
            {errors.brand && (
              <p className="text-sm text-red-500 mt-1">{errors.brand}</p>
            )}
          </div>
          <div>
            <Label htmlFor="model">Модель</Label>
            <Input
              id="model"
              value={vehicleForm.model}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, model: e.target.value })
              }
              placeholder="Camry, X5, Vesta"
              className={errors.model ? 'border-red-500' : ''}
            />
            {errors.model && (
              <p className="text-sm text-red-500 mt-1">{errors.model}</p>
            )}
          </div>
          <div>
            <Label htmlFor="year">Год выпуска</Label>
            <Input
              id="year"
              type="number"
              value={vehicleForm.year}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, year: e.target.value })
              }
              placeholder="2020"
              className={errors.year ? 'border-red-500' : ''}
            />
            {errors.year && (
              <p className="text-sm text-red-500 mt-1">{errors.year}</p>
            )}
          </div>
          <div>
            <Label htmlFor="registrationNumber">Гос. номер</Label>
            <Input
              id="registrationNumber"
              value={vehicleForm.registrationNumber}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })
              }
              placeholder="А123БВ777"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="vin">VIN номер</Label>
            <Input
              id="vin"
              value={vehicleForm.vin}
              onChange={(e) =>
                setVehicleForm({ ...vehicleForm, vin: e.target.value })
              }
              placeholder="WBAXXXXX00000000"
              maxLength={17}
            />
          </div>
        </div>
        <Button
          type="button"
          onClick={handleAddVehicle}
          variant="outline"
          className="w-full mt-3"
        >
          <Icon name="Car" className="mr-2" size={18} />
          Добавить транспортное средство
        </Button>
      </div>
      </>
      )}

      {properties.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Добавленное имущество:</h3>
          {properties.map((property, idx) => (
            <div key={idx} className="border rounded p-3 bg-background">
              <p className="font-medium capitalize">{property.type}</p>
              <p className="text-sm text-muted-foreground">{property.address}</p>
              <p className="text-sm">
                Стоимость: {property.value.toLocaleString()} ₽
              </p>
              {property.area && (
                <p className="text-sm">Площадь: {property.area} кв. м</p>
              )}
              {property.landArea && (
                <p className="text-sm">Земельный участок: {property.landArea} кв. м</p>
              )}
              {property.isSoleResidence && (
                <p className="text-sm text-green-600">✓ Единственное жилье</p>
              )}
            </div>
          ))}
        </div>
      )}

      {vehicles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Добавленные транспортные средства:</h3>
          {vehicles.map((vehicle, idx) => (
            <div key={idx} className="border rounded p-3 bg-background">
              <p className="font-medium">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
              <p className="text-sm text-muted-foreground">
                Гос. номер: {vehicle.registrationNumber || 'не указан'}
              </p>
              {vehicle.vin && (
                <p className="text-sm">VIN: {vehicle.vin}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Button type="submit" className="w-full">
        <Icon name="Save" className="mr-2" size={18} />
        Сохранить данные об имуществе
      </Button>
    </form>
  );
}