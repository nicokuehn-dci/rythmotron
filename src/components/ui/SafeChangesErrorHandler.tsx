import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorHandler';

// Interface für risikoreiche Vorgänge
interface RiskyOperationProps {
  operation: string;
  details: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  suggestedAlternative?: string;
  onProceed: () => void;
  onCancel: () => void;
}

// Komponente zur Bestätigung risikoreicher Änderungen
const RiskyOperationWarning: React.FC<RiskyOperationProps> = ({
  operation,
  details,
  impact,
  suggestedAlternative,
  onProceed,
  onCancel
}) => {
  const [countdown, setCountdown] = useState<number>(impact === 'critical' ? 5 : 0);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // Farb-Codes für verschiedene Impakt-Stufen
  const impactColors = {
    low: { bg: '#2c4a30', text: '#4ade80', border: '#22633b' },
    medium: { bg: '#4a3c20', text: '#fbbf24', border: '#854d0e' },
    high: { bg: '#4a2c20', text: '#fb923c', border: '#9a3412' },
    critical: { bg: '#4a2020', text: '#f87171', border: '#b91c1c' }
  };

  const currentColor = impactColors[impact];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #2a2a2a, #222222)',
          boxShadow: `0 0 20px rgba(0, 0, 0, 0.6), 0 0 30px ${currentColor.text}33`,
          border: `1px solid ${currentColor.border}`
        }}
      >
        {/* Header */}
        <div 
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: `linear-gradient(145deg, ${currentColor.bg}ee, ${currentColor.bg}aa)`,
            borderBottom: `1px solid ${currentColor.border}`
          }}
        >
          <div className="flex items-center">
            <div 
              className="w-8 h-8 flex items-center justify-center rounded-full mr-3"
              style={{
                background: `linear-gradient(135deg, ${currentColor.text}cc, ${currentColor.text}66)`,
                boxShadow: `inset -1px -1px 3px rgba(0, 0, 0, 0.3), 
                           inset 1px 1px 2px rgba(255, 255, 255, 0.1), 
                           0 0 8px ${currentColor.text}55`
              }}
            >
              <span className="text-white text-lg">⚠</span>
            </div>
            
            <h3 
              className="font-bold text-lg" 
              style={{
                color: currentColor.text,
                textShadow: `0 0 5px ${currentColor.text}33`
              }}
            >
              Riskante Operation: {operation}
            </h3>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <div 
            className="p-4 mb-4 rounded"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.3)'
            }}
          >
            <p className="text-zinc-300 mb-3">{details}</p>
            
            <div className="mb-3">
              <div className="flex items-center mb-1">
                <span className="text-zinc-400 text-sm mr-2">Risiko-Stufe:</span>
                <div className="flex">
                  {['low', 'medium', 'high', 'critical'].map((level) => (
                    <div 
                      key={level}
                      className="h-3 w-6 first:rounded-l last:rounded-r"
                      style={{
                        background: level === impact ? impactColors[level as keyof typeof impactColors].text : 'rgba(255,255,255,0.1)',
                        opacity: level === impact ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
                <span 
                  className="text-xs ml-2" 
                  style={{ color: currentColor.text }}
                >
                  {impact.charAt(0).toUpperCase() + impact.slice(1)}
                </span>
              </div>
            </div>
            
            {suggestedAlternative && (
              <div 
                className="p-3 rounded text-sm"
                style={{
                  background: 'rgba(0, 128, 96, 0.1)',
                  border: '1px solid rgba(0, 200, 150, 0.3)'
                }}
              >
                <div className="font-medium mb-1 text-emerald-400">Empfohlene Alternative:</div>
                <p className="text-emerald-300/90">{suggestedAlternative}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center mb-4">
            <input 
              type="checkbox" 
              id="confirm" 
              className="mr-2 accent-red-500"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <label htmlFor="confirm" className="text-zinc-300 text-sm cursor-pointer">
              Ich bestätige, dass ich die Risiken verstehe und möchte fortfahren
            </label>
          </div>
        </div>
        
        {/* Footer */}
        <div 
          className="px-5 py-4 flex justify-end space-x-4"
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderTop: '1px solid rgba(60, 60, 60, 0.2)'
          }}
        >
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{
              background: 'linear-gradient(145deg, #2d2d2d, #252525)',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 3px rgba(60, 60, 60, 0.1)',
              border: '1px solid rgba(70, 70, 70, 0.4)',
              color: '#e2e2e2'
            }}
          >
            Abbrechen
          </button>
          
          <button
            onClick={onProceed}
            disabled={!confirmed || countdown > 0}
            className="px-4 py-2 rounded text-sm font-medium flex items-center"
            style={{
              background: confirmed && countdown === 0
                ? `linear-gradient(145deg, ${currentColor.bg}dd, ${currentColor.bg}aa)`
                : 'linear-gradient(145deg, #3a3a3a, #303030)',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 3px rgba(60, 60, 60, 0.1)',
              border: `1px solid ${confirmed && countdown === 0 ? currentColor.border : 'rgba(70, 70, 70, 0.4)'}`,
              color: confirmed && countdown === 0 ? currentColor.text : '#717171',
              opacity: !confirmed || countdown > 0 ? 0.7 : 1,
              cursor: !confirmed || countdown > 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {countdown > 0 ? `Fortfahren (${countdown})` : 'Fortfahren'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Kontext für den SafeChanges Handler
interface SafeChangesContextProps {
  confirmRiskyOperation: (options: Omit<RiskyOperationProps, 'onProceed' | 'onCancel'>) => Promise<boolean>;
  recordOperationHistory: (operation: string) => void;
  operationHistory: string[];
}

const SafeChangesContext = React.createContext<SafeChangesContextProps>({
  confirmRiskyOperation: async () => false,
  recordOperationHistory: () => {},
  operationHistory: []
});

// Der SafeChanges Provider für die gesamte Anwendung
export const SafeChangesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingOperation, setPendingOperation] = useState<RiskyOperationProps | null>(null);
  const [operationHistory, setOperationHistory] = useState<string[]>([]);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  // Funktion, um eine riskante Operation zu bestätigen
  const confirmRiskyOperation = (options: Omit<RiskyOperationProps, 'onProceed' | 'onCancel'>) => {
    return new Promise<boolean>((resolve) => {
      setPendingOperation({
        ...options,
        onProceed: () => {
          setPendingOperation(null);
          recordOperationHistory(`✅ BESTÄTIGT: ${options.operation}`);
          resolve(true);
        },
        onCancel: () => {
          setPendingOperation(null);
          recordOperationHistory(`❌ ABGEBROCHEN: ${options.operation}`);
          resolve(false);
        }
      });
      setResolvePromise(() => resolve);
    });
  };

  // Operationsverlauf protokollieren
  const recordOperationHistory = (operation: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setOperationHistory(prev => [...prev, `[${timestamp}] ${operation}`]);
    console.log(`%c Operation `, 'background: #3b82f6; color: white; padding: 2px 5px; border-radius: 3px;', operation);
  };

  // Bereinigung bei Unmount
  useEffect(() => {
    return () => {
      if (resolvePromise) {
        resolvePromise(false);
      }
    };
  }, [resolvePromise]);

  return (
    <SafeChangesContext.Provider value={{ confirmRiskyOperation, recordOperationHistory, operationHistory }}>
      {children}
      {pendingOperation && <RiskyOperationWarning {...pendingOperation} />}
    </SafeChangesContext.Provider>
  );
};

// Hook für die Verwendung des Kontexts
export const useSafeChanges = () => React.useContext(SafeChangesContext);

// SafeChanges ErrorBoundary für sicheres Refactoring
export const SafeChangesErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <SafeChangesProvider>
        {children}
      </SafeChangesProvider>
    </ErrorBoundary>
  );
};

// Komponente zum Überwachen und Protokollieren von Code-Änderungen
export const DevelopmentSafetyNet: React.FC<{
  filename: string;
  onChange?: (content: string) => void;
  children: React.ReactNode;
}> = ({ filename, onChange, children }) => {
  const { recordOperationHistory } = useSafeChanges();

  useEffect(() => {
    recordOperationHistory(`🔍 Überwache Änderungen in: ${filename}`);
    
    // Hier könnten wir eine Funktion implementieren, die tatsächlich die Datei überwacht
    // z.B. über eine Websocket-Verbindung oder ein regelmäßiges API-Polling

    return () => {
      recordOperationHistory(`⏹️ Überwachung beendet für: ${filename}`);
    };
  }, [filename, recordOperationHistory]);

  return <>{children}</>;
};

// Spezielle Wrapper-Komponente für kritische Änderungen
export const ProtectedComponent: React.FC<{
  name: string;
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
  children: React.ReactNode;
}> = ({ name, criticalityLevel, children }) => {
  const { confirmRiskyOperation } = useSafeChanges();
  const [isApproved, setIsApproved] = useState(false);
  
  useEffect(() => {
    const checkApproval = async () => {
      if (criticalityLevel === 'low') {
        setIsApproved(true);
        return;
      }
      
      const approved = await confirmRiskyOperation({
        operation: `Kritische Komponente bearbeiten: ${name}`,
        details: `Du bearbeitest eine kritische Komponente mit Risikostufe "${criticalityLevel}". Inkorrekte Änderungen könnten zu Instabilitäten führen.`,
        impact: criticalityLevel,
        suggestedAlternative: criticalityLevel === 'critical' 
          ? 'Erstelle lieber eine neue Komponente und integriere sie nach gründlichem Testen.' 
          : undefined
      });
      
      setIsApproved(approved);
    };
    
    checkApproval();
  }, [name, criticalityLevel, confirmRiskyOperation]);
  
  if (!isApproved) {
    return (
      <div className="p-4 rounded border border-red-800 bg-red-900/20">
        <p className="text-red-200">Zugriff auf diese kritische Komponente ist gesperrt oder wurde abgelehnt.</p>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default SafeChangesErrorBoundary;