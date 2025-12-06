import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { PropertyData } from "../types";
import { useToast } from "@/hooks/use-toast";
import AddPropertyForm from "./AddPropertyForm";
import AddVehicleForm from "./AddVehicleForm";
import PropertyList from "./PropertyList";

interface ValidationErrors {
  [key: string]: string;
}

interface PropertyDataFormProps {
  onSubmit: (data: PropertyData) => void;
}

export default function PropertyDataForm({ onSubmit }: PropertyDataFormProps) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<ValidationErrors>({});
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

  useEffect(() => {
    const saved = localStorage.getItem('documentConstructorData');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.propertyData) {
        setProperties(data.propertyData.realEstate || []);
        setVehicles(data.propertyData.vehicles || []);
        setNoProperty(data.propertyData.noProperty || false);
      }
    }
  }, []);

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

  const handleRemoveProperty = (index: number) => {
    const newProperties = properties.filter((_, idx) => idx !== index);
    setProperties(newProperties);
    toast({
      title: 'Удалено',
      description: 'Объект недвижимости удален из списка',
    });
  };

  const handleRemoveVehicle = (index: number) => {
    const newVehicles = vehicles.filter((_, idx) => idx !== index);
    setVehicles(newVehicles);
    toast({
      title: 'Удалено',
      description: 'Транспортное средство удалено из списка',
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
      <AddPropertyForm
        propertyForm={propertyForm}
        setPropertyForm={setPropertyForm}
        errors={errors}
        onAddProperty={handleAddProperty}
      />

      <AddVehicleForm
        vehicleForm={vehicleForm}
        setVehicleForm={setVehicleForm}
        errors={errors}
        onAddVehicle={handleAddVehicle}
      />
      </>
      )}

      <PropertyList
        properties={properties}
        vehicles={vehicles}
        onRemoveProperty={handleRemoveProperty}
        onRemoveVehicle={handleRemoveVehicle}
      />

      <Button type="submit" className="w-full">
        <Icon name="Save" className="mr-2" size={18} />
        Сохранить данные об имуществе
      </Button>
    </form>
  );
}
