import React, { useState, useRef, useEffect } from "react";
import Tree, { CustomNodeElementProps } from "react-d3-tree";
import NodeEditModal from "./NodeEditModal";
import { TreeNode } from "@/lib/utils";

interface EditableTreeVisualizerProps {
  data: TreeNode;
  setData: React.Dispatch<React.SetStateAction<TreeNode | null>>;
}

const TreeVisualizer: React.FC<EditableTreeVisualizerProps> = ({
  data,
  setData,
}) => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State to hold the translate values
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Calculate the center position on mount
  useEffect(() => {
    if (treeContainerRef.current) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 2,
      });
    }
  }, []);

  const handleNodeClick = (nodeDatum: TreeNode) => {
    setSelectedNode(nodeDatum);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  const handleNodeSave = (updatedNode: TreeNode) => {
    // Update the tree data with the edited node
    const updateTree = (node: TreeNode): TreeNode => {
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

  const renderNode = (rd3tProps: CustomNodeElementProps) => {
    const nodeDatum = rd3tProps.nodeDatum as TreeNode;

    // Determine the image based on gender
    let imageHref = "/silhouette_unknown.webp"; // Default image for unknown gender
    if (nodeDatum.gender === "M") {
      imageHref = "/silhouette_men.webp";
    } else if (nodeDatum.gender === "F") {
      imageHref = "/silhouette_women.webp";
    }

    return (
      <g onClick={() => handleNodeClick(nodeDatum)}>
        <image href={imageHref} x={-25} y={-25} width={50} height={50} />
        <text fill="black" strokeWidth="1" x="0" y="40" textAnchor="middle">
          {nodeDatum.name}
        </text>
      </g>
    );
  };

  return (
    <div
      className="w-full bg-gray-100"
      style={{ height: "calc(100vh - 56px)" }}
      ref={treeContainerRef}
    >
      <Tree
        data={data}
        renderCustomNodeElement={renderNode}
        orientation="vertical"
        pathFunc="step"
        translate={translate}
      />
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

export default TreeVisualizer;
