import React, { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gedcomNodeSchema } from "@/schemas/gedcomNodeSchema";
import { z } from "zod";
import { FixedSizeList as List } from "react-window";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { exportGedcomData } from "@/lib/utils";
import { saveAs } from "file-saver";
import VirtualizedRow from "./VirtualizedRow";

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
  const [isEditorVisible, setIsEditorVisible] = useState(true);

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

  const itemData = useMemo(
    () => ({
      fields,
      control,
      removeNode: remove,
    }),
    [fields, control, remove],
  );

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          variant="secondary"
          onClick={() => setIsEditorVisible(!isEditorVisible)}
          type="button"
        >
          {isEditorVisible ? "Hide Editor" : "Show Editor"}
        </Button>
      </div>

      {isEditorVisible && (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <List
              height={600}
              itemCount={fields.length}
              itemSize={70}
              width={"100%"}
              itemData={itemData}
            >
              {VirtualizedRow}
            </List>

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
              <Button
                variant="secondary"
                onClick={handleDownload}
                type="button"
              >
                Export GEDCOM
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default GedcomDataEditor;
