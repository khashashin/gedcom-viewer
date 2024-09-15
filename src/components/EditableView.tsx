import React, { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import { parseGedcom, transformGedcomToEditableTree, GedcomNode, EditableTreeNode } from '@/lib/utils';
import EditableTreeVisualizer from './EditableTreeVisualizer';
import { debounce } from 'lodash';
import GedcomDataEditor from './GedcomDataEditor';

const EditableView: React.FC = () => {
  const [gedcomData, setGedcomData] = useState<GedcomNode[] | null>(null);
  const [treeData, setTreeData] = useState<EditableTreeNode | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileLoaded = (content: string) => {
    const gedcomNodes = parseGedcom(content);
    setGedcomData(gedcomNodes);
    const tree = transformGedcomToEditableTree(gedcomNodes);
    setTreeData(tree);
  };

  const validateAndUpdateTree = useCallback(
    debounce((updatedData: GedcomNode[]) => {
      const errors = validateGedcomData(updatedData);
      if (errors.length === 0) {
        const tree = transformGedcomToEditableTree(updatedData);
        setTreeData(tree);
        setValidationErrors([]);
      } else {
        setValidationErrors(errors);
      }
    }, 500),
    []
  );

  const handleGedcomDataChange = (updatedData: GedcomNode[]) => {
    setGedcomData(updatedData);
    validateAndUpdateTree(updatedData);
  };

  const validateGedcomData = (data: GedcomNode[]): string[] => {
    const errors: string[] = [];
    data.forEach((node, index) => {
      if (node.level < 0) {
        errors.push(`Node at index ${index} has an invalid 'level' value.`);
      }
      if (!node.tag) {
        errors.push(`Node at index ${index} is missing a 'tag' value.`);
      }
      // Add more validation rules as needed
    });
    return errors;
  };

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
          <GedcomDataEditor gedcomData={gedcomData!} onDataChange={handleGedcomDataChange} />
          <EditableTreeVisualizer data={treeData} setData={setTreeData} />
        </>
      )}
    </div>
  );
};

export default EditableView;
