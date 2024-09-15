import React, { useState, useCallback, Suspense } from 'react';
import { transformGedcomToTree, GedcomNode, TreeNode } from '@/lib/utils';
import debounce from 'lodash-es/debounce';
import { GedcomNodeFieldProvider } from '@/providers/GedcomNodeFieldProvider.tsx';

const TreeVisualizer = React.lazy(() => import('./TreeVisualizer'));
const GedcomDataEditor = React.lazy(() => import('./GedcomDataEditor'));
const FileUpload = React.lazy(() => import('./FileUpload'));

const MainView: React.FC = () => {
  const [gedcomData, setGedcomData] = useState<GedcomNode[] | null>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileLoaded = useCallback(
    (individuals: GedcomNode[], rootPersonId: string) => {
      setGedcomData(individuals);
      const tree = transformGedcomToTree(individuals, rootPersonId);
      setTreeData(tree);
    },
    []
  );

  const validateAndUpdateTree = useCallback(
    debounce((updatedData: GedcomNode[]) => {
      const errors = validateGedcomData(updatedData);
      if (errors.length === 0) {
        const tree = transformGedcomToTree(updatedData);
        setTreeData((prevTree) => {
          // Only update the tree if it has changed
          const newTree = JSON.stringify(tree);
          const prevTreeString = JSON.stringify(prevTree);
          if (newTree !== prevTreeString) {
            return tree;
          }
          return prevTree;
        });
        setValidationErrors([]);
      } else {
        setValidationErrors(errors);
      }
    }, 500),
    []
  );

  const handleGedcomDataChange = useCallback(
    (updatedData: GedcomNode[]) => {
      if (JSON.stringify(updatedData) !== JSON.stringify(gedcomData)) {
        setGedcomData(updatedData);
        validateAndUpdateTree(updatedData);
      }
    },
    [gedcomData, validateAndUpdateTree]
  );

  const validateGedcomData = useCallback((data: GedcomNode[]): string[] => {
    const errors: string[] = [];
    data.forEach((node, index) => {
      if (node.level < 0) {
        errors.push(`Node at index ${index} has an invalid 'level' value.`);
      }
      if (!node.tag) {
        errors.push(`Node at index ${index} is missing a 'tag' value.`);
      }
      // more validation rules as needed
    });
    return errors;
  }, []);

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
        <>
          {validationErrors.length > 0 && (
            <div className="bg-red-100 text-red-700 p-2">
              <ul>
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <GedcomNodeFieldProvider>
            <Suspense fallback={<div>Loading GEDCOM data editor...</div>}>
              <GedcomDataEditor
                gedcomData={gedcomData!}
                onDataChange={handleGedcomDataChange}
              />
            </Suspense>
          </GedcomNodeFieldProvider>
          <Suspense fallback={<div>Loading tree visualizer...</div>}>
            <TreeVisualizer data={treeData} setData={setTreeData} />
          </Suspense>
        </>
      )}
    </div>
  );
};

export default MainView;
