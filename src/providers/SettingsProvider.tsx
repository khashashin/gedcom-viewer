import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export type Theme = 'dark' | 'light' | 'system';
type SilhouetteForm = 'round' | 'square' | 'oval' | 'rhombus';
type PathFunc = 'diagonal' | 'elbow' | 'straight' | 'step';
type Orientation = 'horizontal' | 'vertical';

interface Settings {
  theme: Theme;
  silhouetteForm: SilhouetteForm;
  pathFunc: PathFunc;
  orientation: Orientation;
}

export const defaultSettings: Settings = {
  theme: 'light',
  silhouetteForm: 'round',
  pathFunc: 'diagonal',
  orientation: 'horizontal',
};

const SettingsContext = createContext<{
  settings: Settings;
  setTheme: (theme: Theme) => void;
  setSilhouetteForm: (form: SilhouetteForm) => void;
  setPathFunc: (pathFunc: PathFunc) => void;
  setOrientation: (orientation: Orientation) => void;
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

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setTheme,
        setSilhouetteForm,
        setPathFunc,
        setOrientation,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
