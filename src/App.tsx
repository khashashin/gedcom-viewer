import React from "react";
import EditableView from "./components/EditableView";
import packageJson from "../package.json";

const App: React.FC = () => {
  return (
    <div>
      <div className="absolute bottom-2 right-2 text-sm text-gray-700">
        Version {packageJson.version}
      </div>

      <EditableView />
    </div>
  );
};

export default App;
