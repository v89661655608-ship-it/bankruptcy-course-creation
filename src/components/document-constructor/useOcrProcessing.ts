import funcUrls from "../../../backend/func2url.json";

export const useOcrProcessing = () => {
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const callOcrApi = async (file: File): Promise<string> => {
    const base64Image = await convertFileToBase64(file);
    
    const response = await fetch(funcUrls["ocr-document"], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        folderId: ''
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'OCR API error');
    }

    const data = await response.json();
    return data.text || '';
  };

  const parseOcrText = async (text: string, documentType: string): Promise<any> => {
    const response = await fetch(funcUrls["parse-ocr-text"], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        documentType
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Parse API error');
    }

    const result = await response.json();
    return result.data || {};
  };

  return {
    callOcrApi,
    parseOcrText
  };
};
