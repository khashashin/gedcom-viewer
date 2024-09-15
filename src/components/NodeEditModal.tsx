import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditableTreeNode } from "@/lib/utils";

interface NodeEditModalProps {
  nodeData: EditableTreeNode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedNode: EditableTreeNode) => void;
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
          <label className="block">
            <span className="text-gray-700">Name:</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border p-2"
            />
          </label>
          {/* Add more fields as necessary */}
          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NodeEditModal;
