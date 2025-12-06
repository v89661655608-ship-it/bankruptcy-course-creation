import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

interface ValidationErrors {
  [key: string]: string;
}

interface VehicleFormData {
  type: string;
  brand: string;
  model: string;
  year: string;
  registrationNumber: string;
  vin: string;
}

interface AddVehicleFormProps {
  vehicleForm: VehicleFormData;
  setVehicleForm: (form: VehicleFormData) => void;
  errors: ValidationErrors;
  onAddVehicle: () => void;
}

export default function AddVehicleForm({ 
  vehicleForm, 
  setVehicleForm, 
  errors, 
  onAddVehicle 
}: AddVehicleFormProps) {
  return (
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
        onClick={onAddVehicle}
        variant="outline"
        className="w-full mt-3"
      >
        <Icon name="Car" className="mr-2" size={18} />
        Добавить транспортное средство
      </Button>
    </div>
  );
}
