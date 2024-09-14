import React, { useState } from 'react';
import FileUpload from './FileUpload';
import TreeVisualizer from './TreeVisualizer';
import { parseGedcom, transformGedcomToTree, TreeNode } from '@/lib/utils';

const SimpleView: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNode[] | null>(null);

  const handleFileLoaded = (content: string) => {
    const gedcomNodes = parseGedcom(content);
    console.log(gedcomNodes);
    const tree = transformGedcomToTree(gedcomNodes);
    setTreeData(tree);
  };

  return (
    <div className="SimpleView">
      {!treeData ? (
        <FileUpload onFileLoaded={handleFileLoaded} />
      ) : (
        <TreeVisualizer data={treeData} />
      )}
    </div>
  );
};

export default SimpleView;
