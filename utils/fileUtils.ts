
export const fileToBase64 = (file: File): Promise<{ base64Data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // The result is a data URL: "data:image/png;base64,iVBORw0KGgo..."
      // We need to extract the base64 part and the mime type.
      const mimeType = result.split(':')[1].split(';')[0];
      const base64Data = result.split(',')[1];
      resolve({ base64Data, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};
