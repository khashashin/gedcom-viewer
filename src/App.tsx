import React, { Suspense } from 'react';
import MainView from '@/components/MainView';
import packageJson from '../package.json';
import { GitHubLogoIcon, GearIcon } from '@radix-ui/react-icons';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const SettingsForm = React.lazy(() => import('@/components/SettingsForm'));

const App: React.FC = () => {
  return (
    <div>
      <MainView />

      <Sheet>
        <SheetTrigger asChild>
          <button className="absolute top-2 left-2 p-2 rounded-full">
            <GearIcon className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <Suspense fallback={<div>Loading settings...</div>}>
            <SettingsForm />
          </Suspense>
        </SheetContent>
      </Sheet>

      <div className="absolute bottom-2 right-2 text-sm flex items-center space-x-2">
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
