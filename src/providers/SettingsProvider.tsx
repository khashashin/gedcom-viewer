import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export type Theme = 'dark' | 'light' | 'system';
type SilhouetteForm = 'round' | 'square' | 'oval' | 'rhombus' | 'custom';
type PathFunc = 'diagonal' | 'elbow' | 'straight' | 'step';
type Orientation = 'horizontal' | 'vertical';

interface Settings {
  theme: Theme;
  silhouetteForm: SilhouetteForm;
  pathFunc: PathFunc;
  orientation: Orientation;
  showSpouses: boolean;
  backgroundPattern: string;
  customBackgroundUrl: string;
  customSilhouettePath: string;
}

export const defaultSettings: Settings = {
  theme: 'light',
  silhouetteForm: 'round',
  pathFunc: 'diagonal',
  orientation: 'horizontal',
  showSpouses: true,
  backgroundPattern: 'none',
  customBackgroundUrl: '',
  customSilhouettePath: '0,-25 25,0 0,25 -25,0', // Default diamond shape
};

const SettingsContext = createContext<{
  settings: Settings;
  setTheme: (theme: Theme) => void;
  setSilhouetteForm: (form: SilhouetteForm) => void;
  setPathFunc: (pathFunc: PathFunc) => void;
  setOrientation: (orientation: Orientation) => void;
  setShowSpouses: (show: boolean) => void;
  setBackgroundPattern: (pattern: string) => void;
  setCustomBackgroundUrl: (url: string) => void;
  setCustomSilhouettePath: (path: string) => void;
  setCustomSilhouette: (path: string) => void;
}>(null!); // Use `null!` because we'll provide the value in the provider

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const storedSettings = localStorage.getItem('gedcomSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('gedcomSettings', JSON.stringify(updatedSettings));
  };

  const setTheme = (theme: Theme) => updateSettings({ theme });
  const setSilhouetteForm = (form: SilhouetteForm) =>
    updateSettings({ silhouetteForm: form });
  const setPathFunc = (pathFunc: PathFunc) => updateSettings({ pathFunc });
  const setOrientation = (orientation: Orientation) =>
    updateSettings({ orientation });
  const setShowSpouses = (show: boolean) =>
    updateSettings({ showSpouses: show });
  const setBackgroundPattern = (pattern: string) =>
    updateSettings({ backgroundPattern: pattern });
  const setCustomBackgroundUrl = (url: string) =>
    updateSettings({ customBackgroundUrl: url });
  const setCustomSilhouettePath = (path: string) =>
    updateSettings({ customSilhouettePath: path });
  const setCustomSilhouette = (path: string) =>
    updateSettings({ customSilhouettePath: path, silhouetteForm: 'custom' });

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setTheme,
        setSilhouetteForm,
        setPathFunc,
        setOrientation,
        setShowSpouses,
        setBackgroundPattern,
        setCustomBackgroundUrl,
        setCustomSilhouettePath,
        setCustomSilhouette,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
