import React, { useState } from 'react';
import SimpleView from './components/SimpleView';
import EditableView from './components/EditableView';

const App: React.FC = () => {
  const [view, setView] = useState<'simple' | 'editable'>('simple');

  return (
    <div>
      <nav className="p-4 bg-gray-400">
        <button onClick={() => setView('simple')} className="mr-4">Simple View</button>
        <button onClick={() => setView('editable')}>Editable View</button>
      </nav>
      {view === 'simple' ? <SimpleView /> : <EditableView />}
    </div>
  );
};

export default App;
