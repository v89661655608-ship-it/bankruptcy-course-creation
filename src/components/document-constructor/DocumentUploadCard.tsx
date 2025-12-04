import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface DocumentUploadCardProps {
  title: string;
  description: string;
  iconName: string;
  file?: File;
  isProcessing: boolean;
  onFileSelect: (file: File) => void;
  onProcess?: () => void;
  showProcessButton?: boolean;
}

export default function DocumentUploadCard({
  title,
  description,
  iconName,
  file,
  isProcessing,
  onFileSelect,
  onProcess,
  showProcessButton = true
}: DocumentUploadCardProps) {
  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = (e) => {
      const selectedFile = (e.target as HTMLInputElement).files?.[0];
      if (selectedFile) onFileSelect(selectedFile);
    };
    input.click();
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon name={iconName} size={20} className="text-primary" />
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {file && (
          <Icon name="CheckCircle" size={20} className="text-green-500" />
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleFileUpload}
        >
          <Icon name="Upload" className="mr-2" size={16} />
          Загрузить
        </Button>
        {showProcessButton && onProcess && (
          <Button
            onClick={onProcess}
            disabled={!file || isProcessing}
          >
            <Icon name="ScanText" className="mr-2" size={16} />
            Распознать
          </Button>
        )}
      </div>
      {file && (
        <p className="text-xs text-muted-foreground mt-2">
          Загружен: {file.name}
        </p>
      )}
    </div>
  );
}
