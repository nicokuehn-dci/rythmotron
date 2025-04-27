import React, { useState } from 'react';
import { RenameAnalysisResult, useFileRenameProtector } from '../../lib/FileRenameProtector';

interface FileRenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (success: boolean) => void;
  initialOldPath?: string;
  initialNewPath?: string;
}

const FileRenameDialog: React.FC<FileRenameDialogProps> = ({
  isOpen, 
  onClose,
  onComplete,
  initialOldPath = '',
  initialNewPath = ''
}) => {
  const [oldPath, setOldPath] = useState(initialOldPath);
  const [newPath, setNewPath] = useState(initialNewPath);
  const [analysisResult, setAnalysisResult] = useState<RenameAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { safePrepareRename, executeRename } = useFileRenameProtector();
  
  const handleAnalyze = async () => {
    if (!oldPath || !newPath) {
      setError('Bitte beide Pfade angeben');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await safePrepareRename(oldPath, newPath);
      setAnalysisResult(result);
    } catch (err) {
      setError(`Fehler bei der Analyse: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleRename = async () => {
    if (!analysisResult) return;
    
    setIsRenaming(true);
    setError(null);
    
    try {
      const success = await executeRename(analysisResult);
      if (success) {
        onComplete(true);
        onClose();
      } else {
        setError('Umbenennung konnte nicht abgeschlossen werden');
      }
    } catch (err) {
      setError(`Fehler bei der Umbenennung: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsRenaming(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="border-b border-zinc-700 bg-gradient-to-r from-purple-900/30 to-zinc-900 p-4">
          <h2 className="text-xl font-medium text-zinc-100">Datei sicher umbenennen</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {/* Ursprünglicher Pfad */}
            <div>
              <label htmlFor="oldPath" className="block text-sm font-medium text-zinc-300 mb-1">
                Originalpfad
              </label>
              <input
                id="oldPath"
                type="text"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={oldPath}
                onChange={(e) => setOldPath(e.target.value)}
                placeholder="/pfad/zur/originaldatei.tsx"
                disabled={isAnalyzing || isRenaming || !!analysisResult}
              />
            </div>
            
            {/* Neuer Pfad */}
            <div>
              <label htmlFor="newPath" className="block text-sm font-medium text-zinc-300 mb-1">
                Neuer Pfad
              </label>
              <input
                id="newPath"
                type="text"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                placeholder="/pfad/zur/neuendatei.tsx"
                disabled={isAnalyzing || isRenaming || !!analysisResult}
              />
            </div>
            
            {/* Analyse-Ergebnis */}
            {analysisResult && (
              <div className={`mt-4 p-4 rounded-md ${
                analysisResult.canRename 
                  ? 'bg-green-900/20 border border-green-700' 
                  : 'bg-red-900/20 border border-red-700'
              }`}>
                <h3 className="text-lg font-medium mb-2">
                  {analysisResult.canRename 
                    ? '✅ Umbenennung möglich' 
                    : '❌ Umbenennung nicht möglich'}
                </h3>
                
                {/* Warnungen */}
                {analysisResult.warnings.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-amber-400 text-sm font-medium mb-1">Warnungen:</h4>
                    <ul className="list-disc pl-5 text-amber-300 text-sm">
                      {analysisResult.warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Fehler */}
                {analysisResult.errors.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-red-400 text-sm font-medium mb-1">Fehler:</h4>
                    <ul className="list-disc pl-5 text-red-300 text-sm">
                      {analysisResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Betroffene Dateien */}
                {analysisResult.dependentFiles.length > 0 && (
                  <div>
                    <h4 className="text-blue-400 text-sm font-medium mb-1">
                      Betroffene Dateien ({analysisResult.dependentFiles.length}):
                    </h4>
                    <div className="max-h-40 overflow-y-auto bg-zinc-800/50 rounded-md p-2">
                      {analysisResult.dependentFiles.map((file, i) => (
                        <div key={i} className="mb-2 text-xs">
                          <div className="text-zinc-300 font-medium">{file.path}</div>
                          <div className="pl-4 text-zinc-400">
                            Zeilen: {file.lineNumbers.join(', ')}
                          </div>
                          <div className="pl-4 font-mono text-zinc-500 mt-1">
                            {file.importStatements.map((imp, j) => (
                              <div key={j}>{imp}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Fehlermeldung */}
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-md p-3 text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
        
        {/* Aktions-Buttons */}
        <div className="border-t border-zinc-700 bg-zinc-800/50 p-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-md transition-colors"
            disabled={isAnalyzing || isRenaming}
          >
            Abbrechen
          </button>
          
          {!analysisResult ? (
            <button
              type="button"
              onClick={handleAnalyze}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center"
              disabled={isAnalyzing || !oldPath || !newPath}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analysiere...
                </>
              ) : (
                'Analysieren'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRename}
              className={`px-4 py-2 ${
                analysisResult.canRename 
                  ? 'bg-green-700 hover:bg-green-600' 
                  : 'bg-gray-700 cursor-not-allowed'
              } text-white rounded-md transition-colors flex items-center`}
              disabled={isRenaming || !analysisResult.canRename}
            >
              {isRenaming ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Benenne um...
                </>
              ) : (
                'Umbenennen'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileRenameDialog;