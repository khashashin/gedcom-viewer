import { TreeNode } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import Tree, { CustomNodeElementProps } from 'react-d3-tree';


interface TreeVisualizerProps {
  data: TreeNode[];
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ data }) => {
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

    const renderNode = (rd3tProps: CustomNodeElementProps) => {
      const nodeDatum = rd3tProps.nodeDatum as TreeNode;
      // Determine the image based on gender
      let imageHref = '/silhouette_unknown.webp'; // Default image for unknown gender
      if (nodeDatum.gender === 'M') {
        imageHref = '/silhouette_men.webp';
      } else if (nodeDatum.gender === 'F') {
        imageHref = '/silhouette_women.webp';
      }
  
      return (
        <g>
          <image
            href={imageHref}
            x={-25}
            y={-25}
            width={50}
            height={50}
          />
          <text fill="black" strokeWidth="1" x="0" y="40" textAnchor="middle">
            {nodeDatum.name}
          </text>
        </g>
      );
    };
    
  return (
    <div ref={treeContainerRef} className="w-full bg-gray-100" style={{ height: "calc(100vh - 56px)" }}>
      <Tree data={data} renderCustomNodeElement={renderNode} orientation="vertical" pathFunc={"step"} translate={translate} />
    </div>
  );
};

export default TreeVisualizer;
