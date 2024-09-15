import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="GEDCOM">Upload GEDCOM File</Label>
        <Input id="GEDCOM" type="file" onChange={handleFileChange} />
      </div>
    </div>
  );
};

export default FileUpload;
