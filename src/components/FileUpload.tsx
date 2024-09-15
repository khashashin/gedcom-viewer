import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GedcomNode, parseGedcom } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileLoaded: (individuals: GedcomNode[], rootPersonId: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded }) => {
  const [individuals, setIndividuals] = useState<GedcomNode[]>([]);
  const [selectedRootId, setSelectedRootId] = useState<string | undefined>(
    undefined
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.ged')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const parsedGedcom = parseGedcom(content);

        const individualNodes = parsedGedcom.filter(
          (node) => node.tag === 'INDI'
        );
        setIndividuals(individualNodes);

        if (individualNodes.length > 0) {
          setSelectedRootId(individualNodes[0].pointer);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid GEDCOM (.ged) file.');
    }
  };

  const handleRootSelection = (value: string) => {
    const selectedIndividual = individuals.find((individual) => {
      return (
        individual.children.find((child) => child.tag === 'NAME')?.data ===
        value
      );
    });

    if (selectedIndividual) {
      setSelectedRootId(selectedIndividual.pointer);
    }
    setIsPopoverOpen(false);
  };

  const handleUpload = () => {
    if (!selectedRootId) {
      alert('Please select a root person.');
      return;
    }
    onFileLoaded(individuals, selectedRootId);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="GEDCOM">Upload GEDCOM File</Label>
        <Input id="GEDCOM" type="file" onChange={handleFileChange} />
      </div>

      {individuals.length > 0 && (
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="rootPerson">Select Root Person</Label>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isPopoverOpen}
                className="w-full justify-between"
              >
                {selectedRootId
                  ? individuals
                      .find(
                        (individual) => individual.pointer === selectedRootId
                      )
                      ?.children.find((child) => child.tag === 'NAME')?.data ||
                    'Unnamed'
                  : 'Select a person'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search person..." autoFocus={true} />
                <CommandList>
                  <CommandEmpty>No person found.</CommandEmpty>
                  <CommandGroup>
                    {individuals.map((individual) => {
                      const name =
                        individual.children.find(
                          (child) => child.tag === 'NAME'
                        )?.data || 'Unnamed';
                      return (
                        <CommandItem
                          key={individual.pointer}
                          value={name}
                          onSelect={() => handleRootSelection(name)}
                        >
                          {name}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              individual.pointer === selectedRootId
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <Button onClick={handleUpload} disabled={individuals.length === 0}>
        Process GEDCOM
      </Button>
    </div>
  );
};

export default FileUpload;
