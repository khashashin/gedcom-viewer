import React from 'react';
import { DownloadIcon } from '@radix-ui/react-icons';

interface ExportControlProps {
  onExportPng: () => void;
  onPrint: () => void;
}

const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="15" height="15" fill="white" />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M4.5 3C4.5 2.44772 4.94772 2 5.5 2H9.5C10.0523 2 10.5 2.44772 10.5 3V4.5H12C12.5523 4.5 13 4.94772 13 5.5V10.5C13 11.0523 12.5523 11.5 12 11.5H11V10.5H12V5.5H9.5H5.5H3V10.5H4V11.5H3C2.44772 11.5 2 11.0523 2 10.5V5.5C2 4.94772 2.44772 4.5 3 4.5H4.5V3ZM9.5 3V4.5H5.5V3H9.5Z"
      fill="black"
    />
    <path
      d="M4 9C4 8.72386 4.22386 8.5 4.5 8.5H10.5C10.7761 8.5 11 8.72386 11 9V12C11 12.2761 10.7761 12.5 10.5 12.5H4.5C4.22386 12.5 4 12.2761 4 12V9Z"
      stroke="black"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M9 10.5L6 10.5" stroke="black" stroke-linecap="round" />
  </svg>
);

const ExportControl: React.FC<ExportControlProps> = ({
  onExportPng,
  onPrint,
}) => {
  return (
    <div className="absolute top-2 right-2 flex space-x-2 no-print">
      <button
        onClick={onExportPng}
        className="p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:bg-background/90 transition-colors"
        title="Export as PNG"
      >
        <DownloadIcon className="w-5 h-5" />
      </button>
      <button
        onClick={onPrint}
        className="p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:bg-background/90 transition-colors"
        title="Print / Export as PDF"
      >
        <PrinterIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ExportControl;
