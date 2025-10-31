import React, { useState, useCallback, Suspense } from 'react';
import { transformGedcomToTree, GedcomNode, TreeNode } from '@/lib/utils';

const TreeVisualizer = React.lazy(() => import('./TreeVisualizer'));
const FileUpload = React.lazy(() => import('./FileUpload'));

const MainView: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);

  const handleFileLoaded = useCallback(
    (individuals: GedcomNode[], rootPersonId: string) => {
      const tree = transformGedcomToTree(individuals, rootPersonId);
      setTreeData(tree);
    },
    []
  );

  return (
    <div className="EditableView">
      {!treeData ? (
        <Suspense fallback={<div>Loading file upload...</div>}>
          <FileUpload
            onFileLoaded={(individuals, rootPersonId) =>
              handleFileLoaded(individuals, rootPersonId)
            }
          />
        </Suspense>
      ) : (
        <Suspense fallback={<div>Loading tree visualizer...</div>}>
          <TreeVisualizer data={treeData} setData={setTreeData} />
        </Suspense>
      )}
    </div>
  );
};

export default MainView;
