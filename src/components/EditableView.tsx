import React, { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import { parseGedcom, transformGedcomToEditableTree, GedcomNode, EditableTreeNode } from '@/lib/utils';
import EditableTreeVisualizer from './EditableTreeVisualizer';
import { debounce } from 'lodash';
import { saveAs } from 'file-saver';
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

  const exportGedcomData = () => {
    if (gedcomData) {
      const gedcomString = generateGedcomString(gedcomData);
      const blob = new Blob([gedcomString], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, 'edited_data.ged');
    }
  };

  const generateGedcomString = (data: GedcomNode[]): string => {
    let gedcomString = '';
    data.forEach((node) => {
      gedcomString += formatGedcomNode(node);
    });
    return gedcomString;
  };

  const formatGedcomNode = (node: GedcomNode, level: number = node.level): string => {
    let line = `${level}`;
    if (node.pointer) {
      line += ` @${node.pointer}@`;
    }
    line += ` ${node.tag}`;
    if (node.data) {
      line += ` ${node.data}`;
    }
    line += '\n';
    if (node.children) {
      node.children.forEach((child) => {
        line += formatGedcomNode(child, child.level);
      });
    }
    return line;
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
          <div className="flex justify-end mb-2">
            <button onClick={exportGedcomData} className="px-4 py-2 bg-blue-500 text-white rounded">
              Export GEDCOM
            </button>
          </div>
          <GedcomDataEditor gedcomData={gedcomData!} onDataChange={handleGedcomDataChange} />
          <EditableTreeVisualizer data={treeData} setData={setTreeData} />
        </>
      )}
    </div>
  );
};

export default EditableView;
