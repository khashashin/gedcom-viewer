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
  const [renderKey, setRenderKey] = useState(0);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const prevCustomPath = useRef(settings.customSilhouettePath);

  useEffect(() => {
    if (treeContainerRef.current) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 2,
      });
    }
  }, []);

  // Force re-render when custom silhouette path changes
  useEffect(() => {
    if (
      settings.silhouetteForm === 'custom' &&
      prevCustomPath.current !== settings.customSilhouettePath
    ) {
      console.log(
        'Custom path changed, forcing re-render:',
        settings.customSilhouettePath
      );
      prevCustomPath.current = settings.customSilhouettePath;
      setRenderKey((prev) => prev + 1);
    }
  }, [settings.customSilhouettePath, settings.silhouetteForm]);

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

      // Determine which clipPath to use
      let clipPathElement;
      if (settings.silhouetteForm === 'round') {
        clipPathElement = <circle cx="0" cy="0" r="25" />;
      } else if (settings.silhouetteForm === 'square') {
        clipPathElement = <rect x="-25" y="-25" width="50" height="50" />;
      } else if (settings.silhouetteForm === 'oval') {
        clipPathElement = <ellipse cx="0" cy="0" rx="20" ry="25" />;
      } else if (settings.silhouetteForm === 'rhombus') {
        clipPathElement = <polygon points="0,-25 25,0 0,25 -25,0" />;
      } else if (settings.silhouetteForm === 'custom') {
        // Use custom path if available, otherwise fallback to circle
        const customPath = settings.customSilhouettePath;
        console.log('Rendering custom silhouette with path:', customPath);
        if (customPath && customPath.trim().length > 0) {
          clipPathElement = <polygon points={customPath} />;
        } else {
          console.warn(
            'Custom silhouette path is empty, using circle fallback'
          );
          clipPathElement = <circle cx="0" cy="0" r="25" />;
        }
      } else {
        // Default fallback
        clipPathElement = <circle cx="0" cy="0" r="25" />;
      }

      return (
        <g onClick={() => handleNodeClick(nodeDatum)}>
          <defs>
            <clipPath id={shapeId}>{clipPathElement}</clipPath>
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
    [
      settings.silhouetteForm,
      settings.showSpouses,
      settings.customSilhouettePath,
    ]
  );

  // Get background style based on selected pattern
  const getBackgroundStyle = (): React.CSSProperties => {
    const pattern = settings.backgroundPattern;

    if (pattern === 'custom' && settings.customBackgroundUrl) {
      return {
        backgroundImage: `url(${settings.customBackgroundUrl})`,
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      };
    }

    // CSS-based patterns
    switch (pattern) {
      case 'dots':
        return {
          backgroundImage:
            'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        };
      case 'grid':
        return {
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        };
      case 'diagonal':
        return {
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)',
        };
      case 'hexagon':
        return {
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.05) 3px, transparent 3px), radial-gradient(circle at 0% 50%, rgba(0,0,0,0.05) 3px, transparent 3px), radial-gradient(circle at 100% 50%, rgba(0,0,0,0.05) 3px, transparent 3px)',
          backgroundSize: '30px 52px',
          backgroundPosition: '0 0, 0 26px, 15px 13px',
        };

      // Paper Styles
      case 'vintage-paper':
        return {
          backgroundColor: '#f4f1e8',
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(120,100,80,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(120,100,80,0.03) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(80,70,60,0.02) 0%, transparent 50%)',
          backgroundSize: '600px 600px, 800px 800px, 500px 500px',
        };
      case 'papyrus':
        return {
          backgroundColor: '#e8dcc0',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139,119,79,0.08) 2px, rgba(139,119,79,0.08) 4px), repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(139,119,79,0.03) 35px, rgba(139,119,79,0.03) 36px)',
        };
      case 'parchment':
        return {
          backgroundColor: '#f8f4e6',
          backgroundImage:
            'radial-gradient(ellipse at center, transparent 0%, rgba(139,119,79,0.1) 100%), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139,119,79,0.02) 2px, rgba(139,119,79,0.02) 3px)',
          backgroundSize: '100% 100%, 50px 50px',
        };
      case 'lined-paper':
        return {
          backgroundColor: '#ffffff',
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 29px, #e5e5e5 29px, #e5e5e5 31px), linear-gradient(90deg, #ff6b6b 0px, #ff6b6b 2px, transparent 2px)',
          backgroundSize: '100% 31px, 100% 100%',
          backgroundPosition: '0 8px, 0 0',
        };
      case 'graph-paper':
        return {
          backgroundColor: '#ffffff',
          backgroundImage:
            'linear-gradient(rgba(200,200,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,200,255,0.3) 1px, transparent 1px), linear-gradient(rgba(150,150,200,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(150,150,200,0.5) 1px, transparent 1px)',
          backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px',
        };
      case 'canvas':
        return {
          backgroundColor: '#faf9f7',
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px), repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px)',
          backgroundSize: '4px 4px',
        };
      default:
        return {};
    }
  };

  return (
    <div
      className="w-full h-screen"
      ref={treeContainerRef}
      style={getBackgroundStyle()}
    >
      <Tree
        key={`tree-${settings.silhouetteForm}-${renderKey}`}
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
