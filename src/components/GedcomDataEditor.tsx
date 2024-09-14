import React, { useEffect } from "react";
import {
  useForm,
  useFieldArray,
  Control,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gedcomNodeSchema } from "@/schemas/gedcomNodeSchema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { exportGedcomData } from "@/lib/utils";
import { saveAs } from "file-saver";

const formSchema = z.object({
  nodes: z.array(gedcomNodeSchema),
});

interface GedcomDataEditorProps {
  gedcomData: z.infer<typeof gedcomNodeSchema>[];
  onDataChange: (updatedData: z.infer<typeof gedcomNodeSchema>[]) => void;
}

const GedcomDataEditor: React.FC<GedcomDataEditorProps> = ({
  gedcomData,
  onDataChange,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nodes: gedcomData,
    },
    mode: "onChange",
  });

  const { control, handleSubmit } = form;

  const watchedNodes = useWatch({
    control,
    name: "nodes",
  });

  useEffect(() => {
    onDataChange(watchedNodes);
  }, [watchedNodes, onDataChange]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "nodes",
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Form submitted:", data);
  };

  const handleDownload = () => {
    const gedcomString = exportGedcomData(watchedNodes);
    const blob = new Blob([gedcomString], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "edited_data.ged");
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field, index) => (
          <GedcomNodeField
            key={field.id}
            control={control}
            index={index}
            fieldName={`nodes.${index}`}
            removeNode={() => remove(index)}
          />
        ))}

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
          Add Node
        </Button>

        <div className="flex space-x-2">
          <Button type="submit">Save Changes</Button>
          <Button variant="secondary" onClick={handleDownload} type="button">
            Export GEDCOM
          </Button>
        </div>
      </form>
    </Form>
  );
};

interface GedcomNodeFieldProps {
  control: Control<z.infer<typeof formSchema>>;
  index: number;
  fieldName: string;
  removeNode: () => void;
}

const GedcomNodeField: React.FC<GedcomNodeFieldProps> = ({
  control,
  fieldName,
  removeNode,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${fieldName}.children`,
  });

  return (
    <div className="p-4 border rounded-md space-y-4">
      {/* Node Fields */}
      <FormField
        control={control}
        name={`${fieldName}.level`}
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
        name={`${fieldName}.tag`}
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
        name={`${fieldName}.pointer`}
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
        name={`${fieldName}.data`}
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

      {/* Remove Node Button */}
      <Button variant="destructive" onClick={removeNode} type="button">
        Remove Node
      </Button>

      {/* Children Nodes */}
      {fields.map((childField, childIndex) => (
        <GedcomNodeField
          key={childField.id}
          control={control}
          index={childIndex}
          fieldName={`${fieldName}.children.${childIndex}`}
          removeNode={() => remove(childIndex)}
        />
      ))}

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
    </div>
  );
};

export default GedcomDataEditor;
