import { clsx, type ClassValue } from "clsx";
import { TreeNodeDatum } from "react-d3-tree";
import { twMerge } from "tailwind-merge";

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
        pointer: pointer?.replace(/@/g, ""),
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
  gender: "M" | "F" | "U";
  attributes?: { [key: string]: string };
  children?: TreeNode[];
}

let nodeIdCounter = 0;

export function transformGedcomToEditableTree(
  gedcomNodes: GedcomNode[],
): TreeNode {
  const individuals: { [key: string]: TreeNode } = {};
  const families: { [key: string]: string[] } = {};

  for (const node of gedcomNodes) {
    if (node.tag === "INDI") {
      const nameNode = node.children.find((child) => child.tag === "NAME");
      const sexNode = node.children.find((child) => child.tag === "SEX");
      const name = nameNode?.data || "Unnamed";
      const gender = (sexNode?.data as "M" | "F" | "U") || "U";
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
    } else if (node.tag === "FAM") {
      const famId = node.pointer!;
      families[famId] = [];
      for (const child of node.children) {
        if (
          child.tag === "HUSB" ||
          child.tag === "WIFE" ||
          child.tag === "CHIL"
        ) {
          families[famId].push(child.data!.replace(/@/g, ""));
        }
      }
    }
  }

  // Build tree starting from a root individual
  const rootId = Object.keys(individuals)[0];

  const buildTree = (
    id: string,
    visitedIds: Set<string> = new Set(),
  ): TreeNode | null => {
    if (visitedIds.has(id)) {
      return null;
    }
    visitedIds.add(id);

    const node = individuals[id];
    const childFamilies = Object.entries(families).filter(([, members]) =>
      members.includes(id),
    );
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
  line += "\n";
  if (node.children) {
    node.children.forEach((child) => {
      line += formatGedcomNode(child, level + 1);
    });
  }
  return line;
};

export const exportGedcomData = (data: GedcomNode[]): string => {
  // Implement a function to convert GedcomNode[] back to GEDCOM string format
  let gedcomString = "";
  data.forEach((node) => {
    gedcomString += formatGedcomNode(node);
  });
  return gedcomString;
};
