import React, { useState, useCallback } from "react";
import FileUpload from "./FileUpload";
import {
  parseGedcom,
  transformGedcomToEditableTree,
  GedcomNode,
  TreeNode,
} from "@/lib/utils";
import TreeVisualizer from "./TreeVisualizer.tsx";
import { debounce } from "lodash";
import GedcomDataEditor from "./GedcomDataEditor";
import { GedcomNodeFieldProvider } from "@/providers/GedcomNodeFieldProvider.tsx";

const EditableView: React.FC = () => {
  const [gedcomData, setGedcomData] = useState<GedcomNode[] | null>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileLoaded = useCallback((content: string) => {
    const gedcomNodes = parseGedcom(content);
    setGedcomData(gedcomNodes);
    const tree = transformGedcomToEditableTree(gedcomNodes);
    setTreeData(tree);
  }, []);

  const validateAndUpdateTree = useCallback(
    debounce((updatedData: GedcomNode[]) => {
      const errors = validateGedcomData(updatedData);
      if (errors.length === 0) {
        const tree = transformGedcomToEditableTree(updatedData);
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
    [],
  );

  const handleGedcomDataChange = useCallback(
    (updatedData: GedcomNode[]) => {
      if (JSON.stringify(updatedData) !== JSON.stringify(gedcomData)) {
        setGedcomData(updatedData);
        validateAndUpdateTree(updatedData);
      }
    },
    [gedcomData, validateAndUpdateTree],
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
        <FileUpload onFileLoaded={handleFileLoaded} />
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
            <GedcomDataEditor
              gedcomData={gedcomData!}
              onDataChange={handleGedcomDataChange}
            />
          </GedcomNodeFieldProvider>
          <TreeVisualizer data={treeData} setData={setTreeData} />
        </>
      )}
    </div>
  );
};

export default EditableView;
