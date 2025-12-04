import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { PropertyData } from "../types";

interface PropertyDataFormProps {
  onSubmit: (data: PropertyData) => void;
}

export default function PropertyDataForm({ onSubmit }: PropertyDataFormProps) {
  const [propertyForm, setPropertyForm] = useState({
    propertyType: "",
    address: "",
    cadastralNumber: "",
    value: "",
  });

  const [properties, setProperties] = useState<any[]>([]);

  const handleAddProperty = () => {
    if (!propertyForm.propertyType || !propertyForm.address) {
      alert("Заполните тип и адрес имущества");
      return;
    }

    const newProperty = {
      type: propertyForm.propertyType,
      address: propertyForm.address,
      cadastralNumber: propertyForm.cadastralNumber,
      value: parseFloat(propertyForm.value) || 0,
    };

    setProperties([...properties, newProperty]);
    setPropertyForm({
      propertyType: "",
      address: "",
      cadastralNumber: "",
      value: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: PropertyData = {
      realEstate: properties,
      vehicles: [],
    };
    onSubmit(data);
    alert("Данные об имуществе сохранены");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            />
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
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              value={propertyForm.address}
              onChange={(e) =>
                setPropertyForm({ ...propertyForm, address: e.target.value })
              }
            />
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
            />
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
