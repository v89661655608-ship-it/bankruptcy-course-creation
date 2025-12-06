import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressSuggestion {
  value: string;
  unrestricted_value: string;
}

interface RegistrationAddressSectionProps {
  personalForm: {
    registrationAddress: string;
    registrationDate: string;
  };
  errors: { [key: string]: string };
  addressSuggestions: AddressSuggestion[];
  showAddressSuggestions: boolean;
  isSearchingAddress: boolean;
  addressSuggestionsRef: React.RefObject<HTMLDivElement>;
  onChange: (field: string, value: string) => void;
  onAddressChange: (value: string) => void;
  onAddressFocus: () => void;
  onSelectAddress: (suggestion: AddressSuggestion) => void;
}

export default function RegistrationAddressSection({
  personalForm,
  errors,
  addressSuggestions,
  showAddressSuggestions,
  isSearchingAddress,
  addressSuggestionsRef,
  onChange,
  onAddressChange,
  onAddressFocus,
  onSelectAddress,
}: RegistrationAddressSectionProps) {
  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="font-medium mb-3">Адрес регистрации</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 relative">
          <Label htmlFor="registrationAddress">Адрес *</Label>
          <div className="relative">
            <Input
              id="registrationAddress"
              value={personalForm.registrationAddress}
              onChange={(e) => onAddressChange(e.target.value)}
              onFocus={onAddressFocus}
              required
              className={errors.registrationAddress ? 'border-red-500' : ''}
              placeholder="г. Москва, ул. Ленина, д. 1, кв. 1"
            />
            {isSearchingAddress && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          {errors.registrationAddress && (
            <p className="text-sm text-red-500 mt-1">{errors.registrationAddress}</p>
          )}
          
          {showAddressSuggestions && addressSuggestions.length > 0 && (
            <div 
              ref={addressSuggestionsRef}
              className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {addressSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectAddress(suggestion)}
                  className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                >
                  <p className="text-sm">{suggestion.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="registrationDate">Дата регистрации</Label>
          <Input
            id="registrationDate"
            type="date"
            value={personalForm.registrationDate}
            onChange={(e) => onChange('registrationDate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
