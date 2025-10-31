import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/providers/SettingsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import SilhouetteEditor from './SilhouetteEditor';

const SettingsForm: React.FC = () => {
  const {
    settings,
    setSilhouetteForm,
    setPathFunc,
    setOrientation,
    setShowSpouses,
    setBackgroundPattern,
    setCustomBackgroundUrl,
    setCustomSilhouettePath,
  } = useSettings();
  const { theme, setTheme } = useTheme();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setCustomBackgroundUrl(dataUrl);
        setBackgroundPattern('custom');
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file.');
    }
  };

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
        <div className="space-y-2">
          <Select
            onValueChange={setSilhouetteForm}
            value={settings.silhouetteForm}
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
                <SelectItem value="custom">Custom</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {settings.silhouetteForm === 'custom' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsEditorOpen(true)}
            >
              Edit Custom Shape
            </Button>
          )}
        </div>
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
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="show-spouses" className="flex-1">
            Show Spouses
          </Label>
          <Switch
            id="show-spouses"
            checked={settings.showSpouses}
            onCheckedChange={setShowSpouses}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="mb-2">Background Pattern</h3>
        <Select
          onValueChange={setBackgroundPattern}
          defaultValue={settings.backgroundPattern}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select background pattern" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Geometric Patterns</SelectLabel>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="dots">Dots</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="diagonal">Diagonal Lines</SelectItem>
              <SelectItem value="hexagon">Hexagon</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Paper Styles</SelectLabel>
              <SelectItem value="vintage-paper">Vintage Paper</SelectItem>
              <SelectItem value="papyrus">Papyrus</SelectItem>
              <SelectItem value="parchment">Parchment</SelectItem>
              <SelectItem value="lined-paper">Lined Paper</SelectItem>
              <SelectItem value="graph-paper">Graph Paper</SelectItem>
              <SelectItem value="canvas">Canvas Texture</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Custom</SelectLabel>
              <SelectItem value="custom">Custom (Upload)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {settings.backgroundPattern === 'custom' && (
          <div className="space-y-2 mt-2">
            <Label htmlFor="background-upload">Upload Pattern Image</Label>
            <Input
              id="background-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
            />
            <p className="text-xs text-muted-foreground">
              Upload a seamless tiling texture (recommended: 256x256px or
              512x512px)
            </p>
          </div>
        )}
      </div>

      <SilhouetteEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={(path) => {
          console.log('Saving custom silhouette path:', path);
          setCustomSilhouettePath(path);
          setSilhouetteForm('custom');
        }}
        initialPath={settings.customSilhouettePath}
      />
    </div>
  );
};

export default SettingsForm;
