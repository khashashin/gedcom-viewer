import React from "react";
import EditableView from "./components/EditableView";
import packageJson from "../package.json";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

const App: React.FC = () => {
  return (
    <div>
      <EditableView />
      <div className="absolute bottom-2 right-2 text-sm text-gray-700 flex items-center space-x-2">
        <a
          href="https://github.com/khashashin/gedcom-viewer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <GitHubLogoIcon className="text-xl mr-1" />
        </a>
        <span>Version {packageJson.version}</span>
      </div>
    </div>
  );
};

export default App;
