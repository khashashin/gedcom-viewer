import React, { useState } from 'react';
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

  const handleSave = () => {
    const updatedNode = { ...nodeData, name };
    onSave(updatedNode);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
          <DialogDescription>
            Modify the details of the selected node.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Label htmlFor="node-name">Name:</Label>
          <Input
            id="node-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {/* Add more fields as necessary */}
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NodeEditModal;
