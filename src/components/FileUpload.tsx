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
  const [allGedcomNodes, setAllGedcomNodes] = useState<GedcomNode[]>([]);
  const [individuals, setIndividuals] = useState<GedcomNode[]>([]);
  const [selectedRootId, setSelectedRootId] = useState<string | undefined>(
    undefined
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const findBestRootPerson = (
    gedcomNodes: GedcomNode[]
  ): string | undefined => {
    // Build a map of all individuals who are children (have parents in the file)
    const childrenIds = new Set<string>();
    const individualNodes = gedcomNodes.filter((node) => node.tag === 'INDI');

    // Mark everyone who appears as a child in any family
    gedcomNodes
      .filter((node) => node.tag === 'FAM')
      .forEach((famNode) => {
        famNode.children.forEach((child) => {
          if (child.tag === 'CHIL') {
            const childId = child.data?.replace(/@/g, '');
            if (childId) {
              childrenIds.add(childId);
            }
          }
        });
      });

    // Find root candidates (people with no parents in the file)
    const rootCandidates = individualNodes.filter(
      (node) => node.pointer && !childrenIds.has(node.pointer)
    );

    if (rootCandidates.length === 0) {
      // Fallback: if everyone has parents, just return the first person
      return individualNodes[0]?.pointer;
    }

    // Count ALL descendants recursively for each candidate
    const countAllDescendants = (
      personId: string,
      visited = new Set<string>()
    ): number => {
      if (visited.has(personId)) return 0;
      visited.add(personId);

      let count = 0;
      // Find all families where this person is a parent
      gedcomNodes
        .filter((node) => node.tag === 'FAM')
        .forEach((famNode) => {
          const isParent = famNode.children.some(
            (child) =>
              (child.tag === 'HUSB' || child.tag === 'WIFE') &&
              child.data?.replace(/@/g, '') === personId
          );

          if (isParent) {
            // Count direct children and their descendants
            famNode.children.forEach((child) => {
              if (child.tag === 'CHIL') {
                const childId = child.data?.replace(/@/g, '');
                if (childId) {
                  count += 1 + countAllDescendants(childId, visited);
                }
              }
            });
          }
        });

      return count;
    };

    // Score each root candidate
    const scoredCandidates = rootCandidates.map((node) => {
      const descendants = countAllDescendants(node.pointer!);
      const sexNode = node.children.find((child) => child.tag === 'SEX');
      const isMale = sexNode?.data === 'M';
      const birthNode = node.children.find((child) => child.tag === 'BIRT');
      const birthDateNode = birthNode?.children?.find(
        (child) => child.tag === 'DATE'
      );
      const birthYear = birthDateNode?.data
        ? parseInt(birthDateNode.data.match(/\d{4}/)?.[0] || '9999')
        : 9999;

      return {
        pointer: node.pointer!,
        descendants,
        isMale,
        birthYear,
        // Scoring: prioritize by descendants, then male, then older birth year
        score:
          descendants * 1000 +
          (isMale ? 100 : 0) -
          (birthYear < 9999 ? (9999 - birthYear) / 10 : 0),
      };
    });

    // Sort by score (highest first)
    scoredCandidates.sort((a, b) => b.score - a.score);

    return scoredCandidates[0]?.pointer || rootCandidates[0]?.pointer;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.name.endsWith('.ged') || file.name.endsWith('.gdz'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const parsedGedcom = parseGedcom(content);

        // Store all nodes (INDI + FAM) for tree building
        setAllGedcomNodes(parsedGedcom);

        // Filter individuals for the selection dropdown
        const individualNodes = parsedGedcom.filter(
          (node) => node.tag === 'INDI'
        );
        setIndividuals(individualNodes);

        if (individualNodes.length > 0) {
          // Automatically select the best root person
          const bestRootId = findBestRootPerson(parsedGedcom);
          setSelectedRootId(bestRootId || individualNodes[0].pointer);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid GEDCOM (.ged or .gdz) file.');
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
    onFileLoaded(allGedcomNodes, selectedRootId);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="GEDCOM">Upload GEDCOM File</Label>
        <Input
          id="GEDCOM"
          type="file"
          accept=".ged,.gdz,application/x-gedcom,text/x-gedcom"
          onChange={handleFileChange}
        />
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
