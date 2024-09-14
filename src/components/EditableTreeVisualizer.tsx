import React, { useState } from 'react';
import Tree from 'react-d3-tree';
import NodeEditModal from './NodeEditModal';
import { EditableTreeNode } from '@/lib/utils';

interface EditableTreeVisualizerProps {
  data: EditableTreeNode;
  setData: React.Dispatch<React.SetStateAction<EditableTreeNode | null>>;
}

const EditableTreeVisualizer: React.FC<EditableTreeVisualizerProps> = ({ data, setData }) => {
  const [selectedNode, setSelectedNode] = useState<EditableTreeNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNodeClick = (nodeDatum: EditableTreeNode) => {
    setSelectedNode(nodeDatum);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  const handleNodeSave = (updatedNode: EditableTreeNode) => {
    // Update the tree data with the edited node
    const updateTree = (node: EditableTreeNode): EditableTreeNode => {
      if (node.id === updatedNode.id) {
        return updatedNode;
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateTree),
        };
      }
      return node;
    };

    setData((prevData) => (prevData ? updateTree(prevData) : null));
    handleModalClose();
  };

  const renderNode = ({ nodeDatum }: any) => (
    <g>
      <circle r="15" onClick={() => handleNodeClick(nodeDatum)} />
      <text fill="black" strokeWidth="1" x="20">
        {nodeDatum.name}
      </text>
    </g>
  );

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Tree data={data} renderCustomNodeElement={renderNode} orientation="vertical" />
      {selectedNode && (
        <NodeEditModal
          nodeData={selectedNode}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleNodeSave}
        />
      )}
    </div>
  );
};

export default EditableTreeVisualizer;
