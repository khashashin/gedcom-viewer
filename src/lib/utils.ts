import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface GedcomNode {
  level: number;
  tag: string;
  pointer?: string;
  data?: string;
  children: GedcomNode[];
}

export function parseGedcom(gedcomText: string): GedcomNode[] {
  const lines = gedcomText.split(/\r?\n/);
  const rootNodes: GedcomNode[] = [];
  const nodeStack: GedcomNode[] = [];

  for (const line of lines) {
    const match = line.match(/^(\d+)\s+(@\w+@)?\s*(\w+)(?:\s+(.*))?$/);
    if (match) {
      const [, levelStr, pointer, tag, data] = match;
      const level = parseInt(levelStr, 10);
      const node: GedcomNode = {
        level,
        tag,
        pointer: pointer?.replace(/@/g, ''),
        data,
        children: [],
      };

      if (level === 0) {
        rootNodes.push(node);
        nodeStack.length = 0;
        nodeStack.push(node);
      } else {
        while (nodeStack.length > 0 && nodeStack[nodeStack.length - 1].level >= level) {
          nodeStack.pop();
        }
        if (nodeStack.length > 0) {
          nodeStack[nodeStack.length - 1].children.push(node);
        }
        nodeStack.push(node);
      }
    }
  }

  return rootNodes;
}

export interface TreeNode {
  name: string;
  attributes?: { [key: string]: string };
  children?: TreeNode[];
}

export function transformGedcomToTree(gedcomNodes: GedcomNode[]): TreeNode[] {
  const individuals: { [key: string]: TreeNode } = {};
  const families: { [key: string]: string[] } = {};

  // Populate individuals and families
  for (const node of gedcomNodes) {
    if (node.tag === 'INDI') {
      const nameNode = node.children.find((child) => child.tag === 'NAME');
      const name = nameNode?.data || 'Unnamed';
      individuals[node.pointer!] = { name, attributes: {} };
    } else if (node.tag === 'FAM') {
      const famId = node.pointer!;
      families[famId] = [];
      for (const child of node.children) {
        if (child.tag === 'HUSB' || child.tag === 'WIFE' || child.tag === 'CHIL') {
          families[famId].push(child.data!.replace(/@/g, ''));
        }
      }
    }
  }

  // Build tree starting from a root individual
  const rootId = Object.keys(individuals)[0];

  const buildTree = (id: string, visitedIds: Set<string> = new Set()): TreeNode | null => {
    if (visitedIds.has(id)) {
      // Prevent infinite recursion
      return null;
    }
    visitedIds.add(id);

    const node = individuals[id];
    const childFamilies = Object.entries(families).filter(([, members]) => members.includes(id));
    const children: TreeNode[] = [];

    for (const [, members] of childFamilies) {
      const childIds = members.filter((memberId) => memberId !== id);
      for (const childId of childIds) {
        if (individuals[childId]) {
          const childNode = buildTree(childId, visitedIds);
          if (childNode) {
            children.push(childNode);
          }
        }
      }
    }

    if (children.length > 0) {
      node.children = children;
    }

    return node;
  };

  const rootNode = buildTree(rootId);
  return rootNode ? [rootNode] : [];
}

export interface EditableTreeNode {
  id: string;
  name: string;
  attributes?: { [key: string]: string };
  children?: EditableTreeNode[];
}

let nodeIdCounter = 0;

export function transformGedcomToEditableTree(gedcomNodes: GedcomNode[]): EditableTreeNode {
  const individuals: { [key: string]: EditableTreeNode } = {};
  const families: { [key: string]: string[] } = {};

  // Populate individuals and families, similar to previous function
  // Assign unique IDs to each individual

  for (const node of gedcomNodes) {
    if (node.tag === 'INDI') {
      const nameNode = node.children.find((child) => child.tag === 'NAME');
      const name = nameNode?.data || 'Unnamed';
      individuals[node.pointer!] = { id: `node-${nodeIdCounter++}`, name, attributes: {} };
    } else if (node.tag === 'FAM') {
      // ... (Same as before)
    }
  }

  // Build tree starting from a root individual
  const rootId = Object.keys(individuals)[0];

  const buildTree = (id: string, visitedIds: Set<string> = new Set()): EditableTreeNode | null => {
    if (visitedIds.has(id)) {
      return null;
    }
    visitedIds.add(id);

    const node = individuals[id];
    const childFamilies = Object.entries(families).filter(([, members]) => members.includes(id));
    const children: EditableTreeNode[] = [];

    for (const [, members] of childFamilies) {
      const childIds = members.filter((memberId) => memberId !== id);
      for (const childId of childIds) {
        if (individuals[childId]) {
          const childNode = buildTree(childId, visitedIds);
          if (childNode) {
            children.push(childNode);
          }
        }
      }
    }

    if (children.length > 0) {
      node.children = children;
    }

    return node;
  };

  const rootNode = buildTree(rootId);
  return rootNode!;
}
