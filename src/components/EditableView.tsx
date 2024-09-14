import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { EditableTreeNode, parseGedcom, transformGedcomToEditableTree } from '@/lib/utils';
import EditableTreeVisualizer from './EditableTreeVisualizer';

const EditableView: React.FC = () => {
  const [treeData, setTreeData] = useState<EditableTreeNode | null>(null);

  const handleFileLoaded = (content: string) => {
    const gedcomNodes = parseGedcom(content);
    const tree = transformGedcomToEditableTree(gedcomNodes);
    setTreeData(tree);
  };

  return (
    <div className="EditableView">
      {!treeData ? (
        <FileUpload onFileLoaded={handleFileLoaded} />
      ) : (
        <EditableTreeVisualizer data={treeData} setData={setTreeData} />
      )}
    </div>
  );
};

export default EditableView;
