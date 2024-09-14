import React, { useState } from 'react';
import SimpleView from './components/SimpleView';
import EditableView from './components/EditableView';
import packageJson from '../package.json';

const App: React.FC = () => {
  const [view, setView] = useState<'simple' | 'editable'>('simple');

  return (
    <div>
      <nav className="p-2 bg-gray-400 flex items-center">
        <div>
          <button
            onClick={() => setView('simple')}
            className={`mr-4 px-4 py-2 rounded ${
              view === 'simple' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Simple View
          </button>
          <button
            onClick={() => setView('editable')}
            className={`px-4 py-2 rounded ${
              view === 'editable' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Editable View
          </button>
        </div>
        <div className="text-sm text-gray-700 mr-4 ml-auto">
          Version {packageJson.version}
        </div>
      </nav>
      {view === 'simple' ? <SimpleView /> : <EditableView />}
    </div>
  );
};

export default App;
