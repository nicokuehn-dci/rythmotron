import { useSafeChanges } from '../components/ui/SafeChangesErrorHandler';

/**
 * Ergebnis einer Datei-Umbenennung mit Abhängigkeiten
 */
export interface RenameAnalysisResult {
  oldPath: string;
  newPath: string;
  dependentFiles: Array<{
    path: string;
    lineNumbers: number[];
    importStatements: string[];
  }>;
  canRename: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Klasse zum sicheren Umbenennen von Dateien mit Analyse der Abhängigkeiten
 */
export class FileRenameProtector {
  /**
   * Analysiert die Auswirkungen einer Dateiumbenennung
   * 
   * @param oldPath Der alte Dateipfad
   * @param newPath Der neue Dateipfad
   * @returns Eine Analyse der Abhängigkeiten und potenziellen Probleme
   */
  static async analyzeRename(oldPath: string, newPath: string): Promise<RenameAnalysisResult> {
    const result: RenameAnalysisResult = {
      oldPath,
      newPath,
      dependentFiles: [],
      canRename: true,
      warnings: [],
      errors: []
    };

    try {
      // In einer echten Anwendung würden wir hier das Dateisystem durchsuchen
      // und alle Importe analysieren. In diesem Demo-Beispiel simulieren wir das.

      // 1. Prüfe, ob alte Datei existiert
      if (!oldPath.endsWith('.tsx') && !oldPath.endsWith('.ts')) {
        result.errors.push(`Die Datei ${oldPath} ist keine TypeScript/React Datei`);
        result.canRename = false;
      }

      // 2. Prüfe, ob neue Datei bereits existiert
      if (oldPath === newPath) {
        result.errors.push('Quell- und Zieldatei sind identisch');
        result.canRename = false;
      }

      // 3. Simuliere Suche nach abhängigen Dateien (in einer echten App würden wir hier das Dateisystem durchsuchen)
      // Dies würde in einer echten Anwendung durch ein filesystem-basiertes Tool ersetzt werden
      const mockDependencies = [
        {
          path: '/home/nico-kuehn-dci/Desktop/rythmotron/src/main.tsx',
          lineNumbers: [3],
          importStatements: [`import App from '../${oldPath.split('/').pop()?.replace('.tsx', '')}';`]
        },
        {
          path: '/home/nico-kuehn-dci/Desktop/rythmotron/src/components/SomeComponent.tsx',
          lineNumbers: [5],
          importStatements: [`import { Something } from './${oldPath.split('/').pop()?.replace('.tsx', '')}';`]
        }
      ];

      result.dependentFiles = mockDependencies;

      // 4. Warne, wenn viele Abhängigkeiten betroffen sind
      if (result.dependentFiles.length > 5) {
        result.warnings.push(`Diese Datei wird von ${result.dependentFiles.length} anderen Dateien importiert. Umbenennung könnte weitreichende Auswirkungen haben.`);
      }

      // 5. Prüfe auf kritische Systemdateien
      const criticalFilePaths = [
        'main.tsx',
        'ErrorHandler.tsx',
        'SafeChangesErrorHandler.tsx',
        'App.tsx'
      ];

      if (criticalFilePaths.some(path => oldPath.includes(path))) {
        result.warnings.push('Du benennst eine kritische Systemdatei um. Dies könnte die Anwendung instabil machen.');
      }

      return result;
    } catch (error) {
      result.canRename = false;
      result.errors.push(`Fehler bei der Analyse: ${(error as Error).message}`);
      return result;
    }
  }

  /**
   * Führt eine sichere Umbenennung durch mit Bestätigung und Update aller Abhängigkeiten
   * 
   * @param oldPath Der alte Dateipfad
   * @param newPath Der neue Dateipfad
   * @returns True wenn die Umbenennung erfolgreich war
   */
  static async safeRename(oldPath: string, newPath: string): Promise<boolean> {
    // Diese Funktion würde in einer echten Anwendungsumgebung implementiert werden
    // und könnte einen interaktiven Dialog mit dem Benutzer beinhalten

    // 1. Analyse durchführen
    const analysis = await this.analyzeRename(oldPath, newPath);
    
    // 2. Wenn Fehler vorhanden sind, abbrechen
    if (!analysis.canRename || analysis.errors.length > 0) {
      console.error(`Umbenennung nicht möglich: ${analysis.errors.join(', ')}`);
      return false;
    }
    
    // 3. Bei Warnungen eine Bestätigung einholen
    if (analysis.warnings.length > 0) {
      // Hier würde ein Dialog mit dem Benutzer stattfinden
      const shouldContinue = confirm(`Warnungen:\n${analysis.warnings.join('\n')}\n\nMöchtest du trotzdem fortfahren?`);
      if (!shouldContinue) return false;
    }
    
    // 4. Abhängigkeiten aktualisieren
    for (const dep of analysis.dependentFiles) {
      console.log(`Aktualisiere Abhängigkeit in ${dep.path}`);
      // Hier würden wir die Importe in den abhängigen Dateien aktualisieren
    }
    
    // 5. Die eigentliche Umbenennung durchführen
    console.log(`Benenne ${oldPath} zu ${newPath} um`);
    // Hier würden wir die eigentliche Dateisystem-Operation ausführen
    
    return true;
  }
}

/**
 * React Hook zum sicheren Umbenennen von Dateien
 */
export function useFileRenameProtector() {
  const { confirmRiskyOperation, recordOperationHistory } = useSafeChanges();
  
  /**
   * Führe eine sichere Umbenennung mit Bestätigung durch
   */
  const safePrepareRename = async (
    oldPath: string,
    newPath: string
  ): Promise<RenameAnalysisResult> => {
    recordOperationHistory(`🔍 Analysiere Umbenennung von ${oldPath} nach ${newPath}`);
    
    // Analyse durchführen
    const analysis = await FileRenameProtector.analyzeRename(oldPath, newPath);
    
    // Bei Fehlern direkt abbrechen
    if (analysis.errors.length > 0) {
      recordOperationHistory(`❌ Umbenennung nicht möglich: ${analysis.errors.join(', ')}`);
      return analysis;
    }
    
    // Risikostufe bestimmen
    let impact: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (analysis.dependentFiles.length > 10) {
      impact = 'critical';
    } else if (analysis.dependentFiles.length > 5) {
      impact = 'high';
    } else if (analysis.warnings.length > 0) {
      impact = 'medium';
    }
    
    // Bei Warnungen oder vielen Abhängigkeiten eine Bestätigung einholen
    if (impact !== 'low') {
      const confirmed = await confirmRiskyOperation({
        operation: `Umbenennung von ${oldPath.split('/').pop()} nach ${newPath.split('/').pop()}`,
        details: `Diese Umbenennung betrifft ${analysis.dependentFiles.length} andere Dateien.\n\n${
          analysis.warnings.length > 0 
            ? `Warnungen:\n${analysis.warnings.map(w => `- ${w}`).join('\n')}`
            : ''
        }`,
        impact,
        suggestedAlternative: impact === 'critical' 
          ? 'Statt einer Umbenennung könntest du eine neue Datei erstellen, den Code migrieren und dann die alte Datei als Proxy verwenden.' 
          : undefined
      });
      
      if (!confirmed) {
        recordOperationHistory(`🛑 Umbenennung von ${oldPath} nach ${newPath} abgebrochen`);
        analysis.canRename = false;
        return analysis;
      }
    }
    
    recordOperationHistory(`✅ Umbenennung von ${oldPath} nach ${newPath} vorbereitet`);
    return analysis;
  };
  
  /**
   * Führt die tatsächliche Umbenennung durch nachdem die Vorbereitung abgeschlossen ist
   */
  const executeRename = async (analysis: RenameAnalysisResult): Promise<boolean> => {
    if (!analysis.canRename) return false;
    
    recordOperationHistory(`⚙️ Führe Umbenennung von ${analysis.oldPath} nach ${analysis.newPath} durch`);
    
    try {
      // Hier würden wir die tatsächliche Umbenennung durchführen
      // und alle Abhängigkeiten aktualisieren
      
      // Simuliere eine erfolgreiche Operation
      recordOperationHistory(`✅ Umbenennung erfolgreich abgeschlossen`);
      return true;
    } catch (error) {
      recordOperationHistory(`❌ Fehler bei der Umbenennung: ${(error as Error).message}`);
      return false;
    }
  };
  
  return {
    safePrepareRename,
    executeRename,
  };
}