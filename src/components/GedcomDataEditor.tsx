import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gedcomNodeSchema } from "@/schemas/gedcomNodeSchema";
import { z } from "zod";
import { FixedSizeList as List } from "react-window";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Save, Download } from "lucide-react";
import { exportGedcomData } from "@/lib/utils";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    onDataChange(watchedNodes);
  }, [watchedNodes, onDataChange]);

  const listRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    console.log("List height changed:", listHeight);
  }, [listHeight]);

  useEffect(() => {
    const updateHeight = () => {
      if (listRef.current) {
        console.log(
          "listRef.current.clientHeight:",
          listRef.current.clientHeight,
        );
        setListHeight(listRef.current.clientHeight);
      } else {
        console.log("listRef.current is null");
      }
    };

    if (isDrawerOpen) {
      // Delay the update to ensure the DOM is rendered
      setTimeout(() => {
        updateHeight();
      }, 0);

      window.addEventListener("resize", updateHeight);
    } else {
      window.removeEventListener("resize", updateHeight);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [isDrawerOpen]);

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
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary" className="absolute top-4 right-4 z-10">
          Open Editor
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-screen bg-white rounded-b-lg">
        <DrawerHeader>
          <DrawerClose />
          <div className="flex justify-between items-center w-full">
            <DrawerTitle>Edit GEDCOM Data</DrawerTitle>
            <div className="flex items-center space-x-2">
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                aria-label="Save Changes"
              >
                <Save className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={handleDownload}
                type="button"
                size="icon"
                aria-label="Export GEDCOM"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden p-2 flex flex-col">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex-1 flex flex-col space-y-4"
            >
              <div className="flex-1 overflow-auto" ref={listRef}>
                {listHeight > 0 && (
                  <List
                    height={listHeight}
                    itemCount={fields.length}
                    itemSize={70}
                    width={"100%"}
                    itemData={itemData}
                  >
                    {VirtualizedRow}
                  </List>
                )}
              </div>

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
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GedcomDataEditor;
