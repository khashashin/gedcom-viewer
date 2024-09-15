import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings } from '@/providers/SettingsProvider';
import { useTheme } from '@/providers/ThemeProvider';

const SettingsForm: React.FC = () => {
  const { settings, setSilhouetteForm, setPathFunc, setOrientation } =
    useSettings();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2">Theme Settings</h3>
        <Select onValueChange={setTheme} defaultValue={theme}>
          <SelectTrigger>
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Theme</SelectLabel>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h3 className="mb-2">Family Tree Settings</h3>
        <Select
          onValueChange={setSilhouetteForm}
          defaultValue={settings.silhouetteForm}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a silhouette form" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Silhouette Form</SelectLabel>
              <SelectItem value="round">Round</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="oval">Oval</SelectItem>
              <SelectItem value="rhombus">Rhombus</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select onValueChange={setPathFunc} defaultValue={settings.pathFunc}>
          <SelectTrigger>
            <SelectValue placeholder="Select a path function" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Path Function</SelectLabel>
              <SelectItem value="diagonal">Diagonal</SelectItem>
              <SelectItem value="elbow">Elbow</SelectItem>
              <SelectItem value="straight">Straight</SelectItem>
              <SelectItem value="step">Step</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          onValueChange={setOrientation}
          defaultValue={settings.orientation}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select orientation" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Orientation</SelectLabel>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SettingsForm;
