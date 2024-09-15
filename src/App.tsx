import React, { useState } from "react";
import SimpleView from "./components/SimpleView";
import EditableView from "./components/EditableView";
import packageJson from "../package.json";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const App: React.FC = () => {
  const [view, setView] = useState<"simple" | "editable">("simple");

  const handleTabChange = (value: string) => {
    setView(value as "simple" | "editable");
  };

  return (
    <div>
      <div className="absolute top-0 left-0">
        <Tabs value={view} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="simple">Simple View</TabsTrigger>
            <TabsTrigger value="editable">Editable View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="absolute top-0 right-0 text-sm text-gray-700 mr-4">
        Version {packageJson.version}
      </div>

      <Tabs value={view} onValueChange={handleTabChange} className="p-4">
        <TabsContent value="simple">
          <SimpleView />
        </TabsContent>
        <TabsContent value="editable">
          <EditableView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default App;
