import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { PersonalData } from "../types";

interface PersonalDataFormProps {
  onSubmit: (data: PersonalData) => void;
}

export default function PersonalDataForm({ onSubmit }: PersonalDataFormProps) {
  const [personalForm, setPersonalForm] = useState({
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    };
    onSubmit(data);
    alert("Персональные данные сохранены");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">ФИО *</Label>
          <Input
            id="fullName"
            value={personalForm.fullName}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, fullName: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="birthDate">Дата рождения *</Label>
          <Input
            id="birthDate"
            type="date"
            value={personalForm.birthDate}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, birthDate: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="birthPlace">Место рождения *</Label>
          <Input
            id="birthPlace"
            value={personalForm.birthPlace}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, birthPlace: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="inn">ИНН *</Label>
          <Input
            id="inn"
            value={personalForm.inn}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, inn: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="snils">СНИЛС *</Label>
          <Input
            id="snils"
            placeholder="123-456-789 00"
            value={personalForm.snils}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, snils: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-medium mb-3">Паспортные данные</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="passportSeries">Серия *</Label>
            <Input
              id="passportSeries"
              value={personalForm.passportSeries}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  passportSeries: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="passportNumber">Номер *</Label>
            <Input
              id="passportNumber"
              value={personalForm.passportNumber}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  passportNumber: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="passportIssueDate">Дата выдачи *</Label>
            <Input
              id="passportIssueDate"
              type="date"
              value={personalForm.passportIssueDate}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  passportIssueDate: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="passportCode">Код подразделения *</Label>
            <Input
              id="passportCode"
              placeholder="770-001"
              value={personalForm.passportCode}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  passportCode: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="passportIssuedBy">Кем выдан *</Label>
            <Input
              id="passportIssuedBy"
              value={personalForm.passportIssuedBy}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  passportIssuedBy: e.target.value,
                })
              }
              required
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-medium mb-3">Адрес регистрации</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="registrationAddress">Адрес *</Label>
            <Input
              id="registrationAddress"
              value={personalForm.registrationAddress}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  registrationAddress: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="registrationDate">Дата регистрации</Label>
            <Input
              id="registrationDate"
              type="date"
              value={personalForm.registrationDate}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  registrationDate: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Icon name="Save" className="mr-2" size={18} />
        Сохранить личные данные
      </Button>
    </form>
  );
}
