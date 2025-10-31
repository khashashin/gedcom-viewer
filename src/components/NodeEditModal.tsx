import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TreeNode } from '@/lib/utils';

interface NodeEditModalProps {
  nodeData: TreeNode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedNode: TreeNode) => void;
}

const NodeEditModal: React.FC<NodeEditModalProps> = ({
  nodeData,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(nodeData.name);
  const [gender, setGender] = useState<'M' | 'F' | 'U'>(nodeData.gender);
  const [birthDate, setBirthDate] = useState(nodeData.birthDate || '');
  const [birthPlace, setBirthPlace] = useState(nodeData.birthPlace || '');
  const [deathDate, setDeathDate] = useState(nodeData.deathDate || '');
  const [deathPlace, setDeathPlace] = useState(nodeData.deathPlace || '');

  // Reset form when nodeData changes
  useEffect(() => {
    setName(nodeData.name);
    setGender(nodeData.gender);
    setBirthDate(nodeData.birthDate || '');
    setBirthPlace(nodeData.birthPlace || '');
    setDeathDate(nodeData.deathDate || '');
    setDeathPlace(nodeData.deathPlace || '');
  }, [nodeData]);

  const handleSave = () => {
    const updatedNode: TreeNode = {
      ...nodeData,
      name,
      gender,
      birthDate,
      birthPlace,
      deathDate,
      deathPlace,
    };
    onSave(updatedNode);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Person</DialogTitle>
          <DialogDescription>
            Modify the details of the selected person.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="node-name">Name</Label>
            <Input
              id="node-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="node-gender">Gender</Label>
            <Select
              value={gender}
              onValueChange={(v) => setGender(v as 'M' | 'F' | 'U')}
            >
              <SelectTrigger id="node-gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
                <SelectItem value="U">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Birth Information */}
          <div className="space-y-2 border-t pt-4">
            <h3 className="font-medium">Birth Information</h3>
            <div className="space-y-2">
              <Label htmlFor="birth-date">Birth Date</Label>
              <Input
                id="birth-date"
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="e.g., 1 OCT 1941"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth-place">Birth Place</Label>
              <Input
                id="birth-place"
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="e.g., London"
              />
            </div>
          </div>

          {/* Death Information */}
          <div className="space-y-2 border-t pt-4">
            <h3 className="font-medium">Death Information</h3>
            <div className="space-y-2">
              <Label htmlFor="death-date">Death Date</Label>
              <Input
                id="death-date"
                type="text"
                value={deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
                placeholder="e.g., 20 AUG 2005"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="death-place">Death Place</Label>
              <Input
                id="death-place"
                type="text"
                value={deathPlace}
                onChange={(e) => setDeathPlace(e.target.value)}
                placeholder="e.g., Berlin"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NodeEditModal;
