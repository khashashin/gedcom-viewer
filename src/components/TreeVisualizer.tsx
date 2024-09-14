import { TreeNode } from '@/lib/utils';
import React from 'react';
import Tree from 'react-d3-tree';


interface TreeVisualizerProps {
  data: TreeNode[];
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ data }) => {
  return (
    <div className="w-full h-full p-4 bg-gray-100">
      <Tree data={data} orientation="vertical" pathFunc={"step"} />
    </div>
  );
};

export default TreeVisualizer;
