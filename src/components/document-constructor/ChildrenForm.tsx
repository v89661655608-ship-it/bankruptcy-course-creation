import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Icon from "@/components/ui/icon";
import { ChildrenData } from "./types";

interface ChildrenFormProps {
  initialData?: ChildrenData;
  onSave: (data: ChildrenData) => void;
  onCancel: () => void;
}

export default function ChildrenForm({ initialData, onSave, onCancel }: ChildrenFormProps) {
  const [formData, setFormData] = useState<ChildrenData>(
    initialData || {
      noChildren: false,
      children: [],
      alimonyInfo: {
        isPayingAlimony: false,
      },
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addChild = () => {
    setFormData({
      ...formData,
      children: [
        ...formData.children,
        { fullName: "", birthDate: "", livesWithDebtor: true },
      ],
    });
  };

  const removeChild = (index: number) => {
    setFormData({
      ...formData,
      children: formData.children.filter((_, i) => i !== index),
    });
  };

  const updateChild = (index: number, field: string, value: any) => {
    const updated = [...formData.children];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, children: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Users" size={20} />
          Несовершеннолетние дети
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="noChildren"
              checked={formData.noChildren}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, noChildren: checked as boolean })
              }
            />
            <Label htmlFor="noChildren" className="text-sm font-normal cursor-pointer">
              Дети на иждивении отсутствуют
            </Label>
          </div>

          {!formData.noChildren && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Список детей</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addChild}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить ребенка
                  </Button>
                </div>

                {formData.children.map((child, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Ребенок {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeChild(index)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>

                        <div>
                          <Label>ФИО ребенка</Label>
                          <Input
                            value={child.fullName}
                            onChange={(e) => updateChild(index, "fullName", e.target.value)}
                            placeholder="Иванов Петр Иванович"
                            required
                          />
                        </div>

                        <div>
                          <Label>Дата рождения</Label>
                          <Input
                            type="date"
                            value={child.birthDate}
                            onChange={(e) => updateChild(index, "birthDate", e.target.value)}
                            required
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`lives-${index}`}
                            checked={child.livesWithDebtor}
                            onCheckedChange={(checked) =>
                              updateChild(index, "livesWithDebtor", checked)
                            }
                          />
                          <Label
                            htmlFor={`lives-${index}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            Проживает вместе с должником
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="isPayingAlimony"
                    checked={formData.alimonyInfo?.isPayingAlimony || false}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        alimonyInfo: {
                          ...formData.alimonyInfo,
                          isPayingAlimony: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label
                    htmlFor="isPayingAlimony"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Должник является плательщиком алиментов
                  </Label>
                </div>

                {formData.alimonyInfo?.isPayingAlimony && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                    <div>
                      <Label>Тип документа</Label>
                      <RadioGroup
                        value={formData.alimonyInfo.documentType || "notarial"}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            alimonyInfo: {
                              ...formData.alimonyInfo!,
                              documentType: value as "notarial" | "court" | "other",
                            },
                          })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="notarial" id="notarial" />
                          <Label htmlFor="notarial" className="font-normal cursor-pointer">
                            Нотариальное соглашение
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="court" id="court" />
                          <Label htmlFor="court" className="font-normal cursor-pointer">
                            Решение суда
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other" className="font-normal cursor-pointer">
                            Иное
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.alimonyInfo.documentType === "notarial" && (
                      <>
                        <div>
                          <Label>Дата удостоверения нотариусом</Label>
                          <Input
                            type="date"
                            value={formData.alimonyInfo.notaryDate || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                alimonyInfo: {
                                  ...formData.alimonyInfo!,
                                  notaryDate: e.target.value,
                                },
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label>ФИО ребенка (получателя алиментов)</Label>
                          <Input
                            value={formData.alimonyInfo.childFullName || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                alimonyInfo: {
                                  ...formData.alimonyInfo!,
                                  childFullName: e.target.value,
                                },
                              })
                            }
                            placeholder="Иванов Петр Иванович"
                          />
                        </div>

                        <div>
                          <Label>Размер алиментов (руб./мес.)</Label>
                          <Input
                            type="number"
                            value={formData.alimonyInfo.monthlyAmount || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                alimonyInfo: {
                                  ...formData.alimonyInfo!,
                                  monthlyAmount: parseFloat(e.target.value),
                                },
                              })
                            }
                            placeholder="10000"
                          />
                        </div>
                      </>
                    )}

                    {formData.alimonyInfo.documentType === "court" && (
                      <div>
                        <Label>Реквизиты решения суда</Label>
                        <Input
                          value={formData.alimonyInfo.documentDetails || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              alimonyInfo: {
                                ...formData.alimonyInfo!,
                                documentDetails: e.target.value,
                              },
                            })
                          }
                          placeholder="Решение суда №... от ..."
                        />
                      </div>
                    )}

                    {formData.alimonyInfo.documentType === "other" && (
                      <div>
                        <Label>Описание</Label>
                        <Input
                          value={formData.alimonyInfo.otherDetails || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              alimonyInfo: {
                                ...formData.alimonyInfo!,
                                otherDetails: e.target.value,
                              },
                            })
                          }
                          placeholder="Укажите детали"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
