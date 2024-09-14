import React from 'react';
import { Button } from './ui/button';

interface FileUploadProps {
  onFileLoaded: (content: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.ged')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoaded(content);
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid GEDCOM (.ged) file.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <input
        type="file"
        accept=".ged"
        onChange={handleFileChange}
        className="mb-4"
      />
      <Button onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}>
        Upload GEDCOM File
      </Button>
    </div>
  );
};

export default FileUpload;
