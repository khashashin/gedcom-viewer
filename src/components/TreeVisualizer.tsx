import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Suspense,
  useMemo,
} from 'react';
import Tree, { CustomNodeElementProps } from 'react-d3-tree';
import { TreeNode } from '@/lib/utils';
import { useSettings } from '@/providers/SettingsProvider';

const NodeEditModal = React.lazy(() => import('./NodeEditModal'));

interface EditableTreeVisualizerProps {
  data: TreeNode;
  setData: React.Dispatch<React.SetStateAction<TreeNode | null>>;
}

const TreeVisualizer: React.FC<EditableTreeVisualizerProps> = ({
  data,
  setData,
}) => {
  const { settings } = useSettings();
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const treeContainerRef = useRef<HTMLDivElement>(null);

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

  // Separation object for react-d3-tree (siblings = same parent, nonSiblings = cousins)
  const separation = useMemo(() => {
    return {
      siblings: 1, // Tighter spacing for siblings
      nonSiblings: 2, // Wider spacing for cousins
    };
  }, []);

  // nodeSize with padding to prevent text overlap
  const nodeSize = useMemo(() => {
    // Base dimensions for node content
    const nodeWidth = 100; // Width for avatar + name
    const nodeHeight = 80; // Height for avatar + name

    // Add generous padding to prevent text overlap, especially for leaf nodes
    const horizontalPadding = settings.showSpouses ? 200 : 150;
    const verticalPadding = 120;

    return settings.orientation === 'horizontal'
      ? { x: nodeWidth + horizontalPadding, y: nodeHeight + verticalPadding }
      : { x: nodeHeight + verticalPadding, y: nodeWidth + horizontalPadding };
  }, [settings.showSpouses, settings.orientation]);

  const renderNode = useCallback(
    (rd3tProps: CustomNodeElementProps) => {
      const nodeDatum = rd3tProps.nodeDatum as TreeNode;

      // Determine the image based on gender
      let imageHref = '/silhouette_unknown.webp'; // Default image for unknown gender
      if (nodeDatum.gender === 'M') {
        imageHref = '/silhouette_men.webp';
      } else if (nodeDatum.gender === 'F') {
        imageHref = '/silhouette_women.webp';
      }

      const shapeId = `clip-path-${settings.silhouetteForm}-${nodeDatum.id}`;

      return (
        <g onClick={() => handleNodeClick(nodeDatum)}>
          <defs>
            <clipPath id={shapeId}>
              {settings.silhouetteForm === 'round' && (
                <circle cx="0" cy="0" r="25" />
              )}
              {settings.silhouetteForm === 'square' && (
                <rect x="-25" y="-25" width="50" height="50" />
              )}
              {settings.silhouetteForm === 'oval' && (
                <ellipse cx="0" cy="0" rx="20" ry="25" />
              )}
              {settings.silhouetteForm === 'rhombus' && (
                <polygon points="0,-25 25,0 0,25 -25,0" />
              )}
            </clipPath>
          </defs>
          <image
            href={imageHref}
            x="-25"
            y="-25"
            width="50"
            height="50"
            clipPath={`url(#${shapeId})`}
          />
          <text fill="black" strokeWidth="1" x="0" y="40" textAnchor="middle">
            {nodeDatum.name}
          </text>
          {settings.showSpouses && nodeDatum.spouses && (
            <>
              {nodeDatum.spouses.map((spouse, idx) => (
                <text
                  key={idx}
                  fill="gray"
                  strokeWidth="0.5"
                  x="0"
                  y={55 + idx * 12}
                  textAnchor="middle"
                  fontSize="10"
                >
                  {spouse}
                </text>
              ))}
            </>
          )}
        </g>
      );
    },
    [settings.silhouetteForm, settings.showSpouses]
  );

  return (
    <div className="w-full h-screen" ref={treeContainerRef}>
      <Tree
        data={data}
        renderCustomNodeElement={renderNode}
        orientation={settings.orientation}
        pathFunc={settings.pathFunc}
        translate={translate}
        separation={separation}
        nodeSize={nodeSize}
      />
      {selectedNode && (
        <Suspense fallback={'Loading modal...'}>
          <NodeEditModal
            nodeData={selectedNode}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSave={handleNodeSave}
          />
        </Suspense>
      )}
    </div>
  );
};

export default TreeVisualizer;
