import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gedcomNodeSchema } from "@/schemas/gedcomNodeSchema";
import { z } from "zod";
import { VariableSizeList as List } from "react-window";
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
  DrawerDescription,
} from "@/components/ui/drawer";
import { saveAs } from "file-saver";
import VirtualizedRow from "./VirtualizedRow";
import { useGedcomNodeField } from "@/providers/GedcomNodeFieldProvider";

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
  const { expandedItems, expandedHeights, listRef } = useGedcomNodeField();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nodes: gedcomData,
    },
    mode: "onChange",
  });

  const { control, handleSubmit } = form;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    const updateListHeight = () => {
      if (containerRef.current) {
        setListHeight(containerRef.current.clientHeight);
      }
    };

    // Set up a MutationObserver to detect changes in the drawer content
    const observer = new MutationObserver(() => {
      updateListHeight();
    });

    if (isDrawerOpen) {
      // Update the height when the drawer is opened
      updateListHeight();
      if (containerRef.current) {
        observer.observe(containerRef.current, {
          childList: true,
          subtree: true,
        });
      }

      window.addEventListener("resize", updateListHeight);
    }

    updateListHeight();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateListHeight);
    };
  }, [isDrawerOpen]);

  const { fields, append, remove } = useFieldArray({ control, name: "nodes" });

  const onSubmit = useCallback(
    (data: z.infer<typeof formSchema>) => {
      onDataChange(data.nodes);
    },
    [onDataChange],
  );

  const handleDownload = useCallback((data: z.infer<typeof formSchema>) => {
    const gedcomString = exportGedcomData(data.nodes);
    const blob = new Blob([gedcomString], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "edited_data.ged");
  }, []);

  const itemData = useMemo(
    () => ({
      fields,
      control,
      removeNode: remove,
    }),
    [fields, control, remove],
  );

  useEffect(() => {
    console.log("Fields:", fields);
    console.log("listHeight:", listHeight);
  }, [fields, listHeight]);

  const getItemSize = useCallback(
    (index: number) => {
      const key = `nodes.${index}`;
      const defaultHeight = 80;
      return expandedItems[key]
        ? expandedHeights[key] || defaultHeight
        : defaultHeight;
    },
    [expandedItems, expandedHeights],
  );

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary" className="absolute top-4 right-4 z-10">
          Open Editor
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className="h-screen bg-white rounded-b-lg"
        aria-describedby="modal-description"
      >
        <DrawerHeader>
          <DrawerClose />
          <div className="flex justify-between items-center w-full">
            <DrawerTitle>Edit GEDCOM Data</DrawerTitle>
            <DrawerDescription />
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
                onClick={() => handleDownload(form.getValues())}
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
              <div className="flex-1 overflow-auto" ref={containerRef}>
                {listHeight > 0 && (
                  <List
                    ref={listRef}
                    height={listHeight}
                    itemCount={fields.length}
                    itemSize={getItemSize}
                    width={"100%"}
                    itemData={itemData}
                  >
                    {({ index, style, data }) => (
                      <VirtualizedRow index={index} style={style} data={data} />
                    )}
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

export default React.memo(GedcomDataEditor);
