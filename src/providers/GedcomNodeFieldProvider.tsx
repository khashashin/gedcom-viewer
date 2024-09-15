import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { VariableSizeList as List } from "react-window";

interface GedcomNodeFieldContextType {
  expandedItems: { [key: string]: boolean };
  expandedHeights: { [key: string]: number };
  toggleExpansion: (key: string) => void;
  updateHeight: (key: string, size: number) => void;
  listRef: React.RefObject<List>;
}

const GedcomNodeFieldContext = createContext<
  GedcomNodeFieldContextType | undefined
>(undefined);

export const GedcomNodeFieldProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedHeights, setExpandedHeights] = useState<{
    [key: string]: number;
  }>({});

  const listRef = useRef<List>(null);

  const toggleExpansion = useCallback((key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const updateHeight = useCallback((key: string, size: number) => {
    setExpandedHeights((prev) => {
      if (prev[key] !== size) {
        return { ...prev, [key]: size };
      }
      return prev;
    });
    if (listRef.current) {
      const index = Object.keys(expandedHeights).indexOf(key);
      if (index !== -1) {
        listRef.current.resetAfterIndex(index);
      }
    }
  }, []);

  return (
    <GedcomNodeFieldContext.Provider
      value={{
        expandedItems,
        expandedHeights,
        toggleExpansion,
        updateHeight,
        listRef,
      }}
    >
      {children}
    </GedcomNodeFieldContext.Provider>
  );
};

export const useGedcomNodeField = () => {
  const context = useContext(GedcomNodeFieldContext);
  if (!context) {
    throw new Error(
      "useGedcomNodeField must be used within a GedcomNodeFieldProvider",
    );
  }
  return context;
};
