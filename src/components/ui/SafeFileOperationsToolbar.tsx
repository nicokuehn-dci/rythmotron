import React, { useState } from 'react';
import FileRenameDialog from './FileRenameDialog';
import { useSafeChanges } from './SafeChangesErrorHandler';

interface SafeFileOperationsToolbarProps {
  className?: string;
}

const SafeFileOperationsToolbar: React.FC<SafeFileOperationsToolbarProps> = ({ 
  className = '' 
}) => {
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [oldPath, setOldPath] = useState('');
  const [newPath, setNewPath] = useState('');
  const { recordOperationHistory } = useSafeChanges();

  const handleOpenRenameDialog = () => {
    // Standardmäßig im src/components Verzeichnis
    setOldPath('/home/nico-kuehn-dci/Desktop/rythmotron/src/components/');
    setNewPath('/home/nico-kuehn-dci/Desktop/rythmotron/src/components/');
    setShowRenameDialog(true);
  };

  const handleRenameComplete = (success: boolean) => {
    if (success) {
      recordOperationHistory('🎉 Dateiumbenennung erfolgreich abgeschlossen!');
    }
  };

  return (
    <>
      <div className={`bg-zinc-800/70 border border-zinc-700 rounded-md p-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-zinc-300">Sichere Dateioperationen</div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleOpenRenameDialog}
              className="px-3 py-1 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded flex items-center space-x-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Datei umbenennen</span>
            </button>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-zinc-400 italic">
          Operationen werden analysiert, um Risiken zu minimieren und Referenzen zu aktualisieren
        </div>
      </div>
      
      {/* Rename Dialog */}
      <FileRenameDialog
        isOpen={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        onComplete={handleRenameComplete}
        initialOldPath={oldPath}
        initialNewPath={newPath}
      />
    </>
  );
};

export default SafeFileOperationsToolbar;