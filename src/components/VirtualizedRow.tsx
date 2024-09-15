import { gedcomNodeSchema } from "@/schemas/gedcomNodeSchema";
import { Control } from "react-hook-form";
import { z } from "zod";
import GedcomNodeField from "./GedcomNodeField";
import { memo, useEffect, useRef } from "react";
import { useGedcomNodeField } from "@/providers/GedcomNodeFieldProvider";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  nodes: z.array(gedcomNodeSchema),
});

interface ItemData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: {
    id: string;
    level: number;
    tag: string;
    pointer: string;
    data: string;
    children: any[];
  }[];
  control: Control<z.infer<typeof formSchema>>;
  removeNode: (index: number) => void;
}

interface VirtualizedRowProps {
  index: number;
  style: React.CSSProperties;
  data: ItemData;
}

const VirtualizedRow: React.FC<VirtualizedRowProps> = memo(
  ({ index, style, data }) => {
    const { expandedItems, toggleExpansion, updateHeight } =
      useGedcomNodeField();
    const field = data.fields[index];
    const rowRef = useRef<HTMLDivElement>(null);
    const key = `nodes.${index}`;

    const isExpanded = expandedItems[key] ?? false;

    useEffect(() => {
      if (rowRef.current) {
        const newHeight = rowRef.current.getBoundingClientRect().height;
        updateHeight(key, newHeight);
      }
    }, [isExpanded, updateHeight, key]);

    if (!field) {
      return null;
    }

    return (
      <div style={style} ref={rowRef}>
        <GedcomNodeField
          key={field.id}
          control={data.control}
          index={index}
          fieldName={`nodes.${index}`}
          removeNode={() => data.removeNode(index)}
          isExpanded={!!expandedItems[key]}
          toggleExpansion={() => toggleExpansion(key)}
        />
      </div>
    );
  },
);

VirtualizedRow.whyDidYouRender = true;

export default VirtualizedRow;
