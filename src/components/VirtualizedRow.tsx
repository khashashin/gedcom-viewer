import { gedcomNodeSchema } from "@/schemas/gedcomNodeSchema";
import { Control } from "react-hook-form";
import { z } from "zod";
import GedcomNodeField from "./GedcomNodeField";

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

const VirtualizedRow = ({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: ItemData;
}) => {
  const field = data.fields[index];
  return (
    <div style={style}>
      <GedcomNodeField
        key={field.id}
        control={data.control}
        index={index}
        fieldName={`nodes.${index}`}
        removeNode={() => data.removeNode(index)}
      />
    </div>
  );
};

export default VirtualizedRow;
