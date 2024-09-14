import { TreeNode } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import Tree from 'react-d3-tree';


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
    
  return (
    <div ref={treeContainerRef} className="w-full bg-gray-100" style={{ height: "calc(100vh - 56px)" }}>
      <Tree data={data} orientation="vertical" pathFunc={"step"} translate={translate} />
    </div>
  );
};

export default TreeVisualizer;
