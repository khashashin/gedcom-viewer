import { gedcomNodeSchema } from "@/schemas/gedcomNodeSchema";
import { useState } from "react";
import { Control, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  nodes: z.array(gedcomNodeSchema),
});

interface GedcomNodeFieldProps {
  control: Control<z.infer<typeof formSchema>>;
  index: number;
  fieldName: `nodes${string}`;
  removeNode: () => void;
}

const GedcomNodeField: React.FC<GedcomNodeFieldProps> = ({
  control,
  fieldName,
  removeNode,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${fieldName}.children` as `nodes.${string}`,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-4 border rounded-md space-y-4">
      {/* Node Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
          <span className="text-sm text-gray-500">
            ({fields.length} {fields.length === 1 ? "child" : "children"})
          </span>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" type="button">
              Remove Node
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to remove this node?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                node and its children.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={removeNode}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {isExpanded && (
        <>
          {/* Level Field */}
          <FormField
            control={control}
            name={`${fieldName}.level` as `nodes.${number}.level`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tag Field */}
          <FormField
            control={control}
            name={`${fieldName}.tag` as `nodes.${number}.tag`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pointer Field */}
          <FormField
            control={control}
            name={`${fieldName}.pointer` as `nodes.${number}.pointer`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pointer</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data Field */}
          <FormField
            control={control}
            name={`${fieldName}.data` as `nodes.${number}.data`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Children Nodes */}
          {fields.length > 0 && (
            <div className="ml-4">
              {fields.map((childField, childIndex) => (
                <GedcomNodeField
                  key={childField.id}
                  control={control}
                  index={childIndex}
                  fieldName={`${fieldName}.children.${childIndex}`}
                  removeNode={() => remove(childIndex)}
                />
              ))}
            </div>
          )}

          {/* Add Child Node Button */}
          <Button
            variant="secondary"
            onClick={() =>
              append({
                level: 0,
                tag: "",
                pointer: "",
                data: "",
                children: [],
              })
            }
            type="button"
          >
            Add Child Node
          </Button>
        </>
      )}
    </div>
  );
};

export default GedcomNodeField;
