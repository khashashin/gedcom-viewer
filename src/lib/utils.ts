import { clsx, type ClassValue } from 'clsx';
import { TreeNodeDatum } from 'react-d3-tree';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface GedcomNode {
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
        while (
          nodeStack.length > 0 &&
          nodeStack[nodeStack.length - 1].level >= level
        ) {
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

export interface TreeNode extends TreeNodeDatum {
  id: string;
  name: string;
  gender: 'M' | 'F' | 'U';
  attributes?: { [key: string]: string };
  children?: TreeNode[];
}

let nodeIdCounter = 0;

export function transformGedcomToTree(
  gedcomNodes: GedcomNode[],
  rootPersonId?: string
): TreeNode {
  const individuals: { [key: string]: TreeNode } = {};
  const families: {
    [key: string]: { husband?: string; wife?: string; children: string[] };
  } = {};

  for (const node of gedcomNodes) {
    if (node.tag === 'INDI') {
      const nameNode = node.children.find((child) => child.tag === 'NAME');
      const sexNode = node.children.find((child) => child.tag === 'SEX');
      const name = nameNode?.data || 'Unnamed';
      const gender = (sexNode?.data as 'M' | 'F' | 'U') || 'U';
      individuals[node.pointer!] = {
        id: `node-${nodeIdCounter++}`,
        name,
        gender,
        attributes: {},
        __rd3t: {
          id: `node-${nodeIdCounter}`,
          depth: 0,
          collapsed: false,
        },
      };
    } else if (node.tag === 'FAM') {
      const famId = node.pointer!;
      const family = { husband: undefined, wife: undefined, children: [] } as {
        husband?: string;
        wife?: string;
        children: string[];
      };
      for (const child of node.children) {
        if (child.tag === 'HUSB') {
          family.husband = child.data
            ? child.data.replace(/@/g, '')
            : undefined;
        } else if (child.tag === 'WIFE') {
          family.wife = child.data ? child.data.replace(/@/g, '') : undefined;
        } else if (child.tag === 'CHIL') {
          family.children.push(child.data!.replace(/@/g, ''));
        }
      }
      families[famId] = family;
    }
  }

  const rootId = rootPersonId ?? Object.keys(individuals)[0];

  const buildTree = (
    id: string,
    visitedIds: Set<string> = new Set()
  ): TreeNode | null => {
    if (visitedIds.has(id)) {
      return null;
    }
    visitedIds.add(id);

    const node = individuals[id];
    const children: TreeNode[] = [];

    const parentFamilies = Object.entries(families).filter(
      ([, family]) => family.husband === id || family.wife === id
    );

    for (const [, family] of parentFamilies) {
      for (const childId of family.children) {
        if (individuals[childId]) {
          const childNode = buildTree(childId, visitedIds);
          if (childNode) {
            children.push(childNode);
          }
        }
      }
    }

    const spouseId =
      parentFamilies.length > 0
        ? parentFamilies[0][1].husband === id
          ? parentFamilies[0][1].wife
          : parentFamilies[0][1].husband
        : null;
    if (spouseId && individuals[spouseId]) {
      node.attributes = {
        ...node.attributes,
        spouse: individuals[spouseId].name,
      };
    }

    if (children.length > 0) {
      node.children = children;
    }

    return node;
  };

  const rootNode = buildTree(rootId);
  return rootNode!;
}

const formatGedcomNode = (node: GedcomNode, level: number = 0): string => {
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
      line += formatGedcomNode(child, level + 1);
    });
  }
  return line;
};

export const exportGedcomData = (data: GedcomNode[]): string => {
  let gedcomString = '';
  data.forEach((node) => {
    gedcomString += formatGedcomNode(node);
  });
  return gedcomString;
};
