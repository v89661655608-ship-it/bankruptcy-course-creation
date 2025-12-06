import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface PropertyListProps {
  properties: any[];
  vehicles: any[];
  onRemoveProperty: (index: number) => void;
  onRemoveVehicle: (index: number) => void;
}

export default function PropertyList({
  properties,
  vehicles,
  onRemoveProperty,
  onRemoveVehicle,
}: PropertyListProps) {
  return (
    <>
      {properties.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Добавленное имущество:</h3>
          {properties.map((property, idx) => (
            <div key={idx} className="border rounded p-3 bg-background relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveProperty(idx)}
                className="absolute top-2 right-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Icon name="X" size={16} />
              </Button>
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
            <div key={idx} className="border rounded p-3 bg-background relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveVehicle(idx)}
                className="absolute top-2 right-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Icon name="X" size={16} />
              </Button>
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
    </>
  );
}
