import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import LED from './ui/led';
import withErrorBoundary from './ui/withErrorBoundary';

interface ComponentDescriptionProps {
  hardwareName: string;
  rythmotronName: string;
  function: string;
  type: 'knob' | 'button' | 'pad' | 'led' | 'display' | 'other';
  section?: 'main' | 'sampling' | 'perf' | 'sequencer' | 'transport' | 'tracks' | 'navigation' | 'other';
  color?: string;
}

const ComponentCard: React.FC<ComponentDescriptionProps> = ({
  hardwareName,
  rythmotronName,
  function: description,
  type,
  section = 'other',
  color = '#a855f7'
}) => {
  return (
    <Card className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden hover:border-zinc-600 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-medium text-zinc-200">{hardwareName}</h3>
            <p className="text-xs text-zinc-400">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
          </div>
          {type === 'knob' && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600 flex items-center justify-center">
              <div className="w-1 h-4 bg-zinc-400 rounded-full transform -translate-y-1"></div>
            </div>
          )}
          {type === 'button' && (
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white !rounded-button whitespace-nowrap"
            >
              {hardwareName.replace(/[\[\]]/g, '')}
            </Button>
          )}
          {type === 'led' && <LED active={true} color={color} />}
          {type === 'pad' && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600 flex items-center justify-center">
              <LED active={true} color={color} />
            </div>
          )}
          {type === 'display' && (
            <div className="w-16 h-10 rounded-sm bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600 flex items-center justify-center">
              <div className="text-xs text-zinc-400">OLED</div>
            </div>
          )}
        </div>
        <div className="mb-2">
          <h4 className="text-xs font-medium text-zinc-300">Rythmotron Name:</h4>
          <p className="text-xs italic text-zinc-400">{rythmotronName}</p>
        </div>
        <div>
          <h4 className="text-xs font-medium text-zinc-300">Function:</h4>
          <p className="text-xs text-zinc-400">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Basiskomponente ohne ErrorBoundary
export const RythmotronComponentsGuideBase: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('all');

  const components: ComponentDescriptionProps[] = [
    {
      hardwareName: "MAIN VOLUME",
      rythmotronName: "Master Output Level",
      function: "Stellt die physische Lautstärke der Haupt- und Kopfhörerausgänge ein. Wird von Rythmotron nicht direkt gesteuert, beeinflusst aber das hörbare Ergebnis der von Rythmotron manipulierten Sounds.",
      type: "knob",
      section: "main",
      color: "#f97316" // orange
    },
    {
      hardwareName: "[SAMPLING]",
      rythmotronName: "Hardware Sampling Trigger",
      function: "Öffnet das Hardware-Sampling-Menü / Startet Direct Sampling. Rythmotron interagiert nicht direkt mit der Sampling-Funktion, aber die resultierenden Samples könnten im Kit visualisiert werden.",
      type: "button",
      section: "sampling",
      color: "#f97316" // orange
    },
    {
      hardwareName: "[QPER]",
      rythmotronName: "Macro Select / Mute (Hardware)",
      function: "Wählt das Hardware-Performance-Makro für den QUICK PERF AMOUNT-Knopf aus / Stummschaltet die Makros. Diese spezifischen Hardware-Modi werden von Rythmotron weniger fokussiert als die Kit/Sound-Datenstruktur.",
      type: "button",
      section: "perf",
      color: "#4ade80" // green
    },
    {
      hardwareName: "QUICK PERF AMOUNT",
      rythmotronName: "Macro Intensity Control (Hardware)",
      function: "Steuert die Intensität des ausgewählten Hardware-Performance-Makros. Siehe [QPER].",
      type: "knob",
      section: "perf",
      color: "#4ade80" // green
    },
    {
      hardwareName: "[FIX]",
      rythmotronName: "Fixed Velocity Pad Mode (Hardware)",
      function: "Schaltet feste Anschlagstärke für die Pads ein/aus. Beeinflusst das physische Spielgefühl, weniger die Datenvisualisierung in Rythmotron.",
      type: "button",
      section: "perf",
      color: "#4ade80" // green
    },
    {
      hardwareName: "TRACK LEVEL",
      rythmotronName: "Track Level / Browser Control",
      function: "Stellt den Pegel des aktiven Tracks ein (visualisiert in Rythmotron) / Dient zum Scrollen in Hardware-Menüs (z.B. Sound Browser, den Rythmotron ergänzt).",
      type: "knob",
      section: "tracks",
      color: "#a855f7" // purple
    },
    {
      hardwareName: "[TEMPO]",
      rythmotronName: "Tempo Settings (Hardware)",
      function: "Öffnet das Hardware-Tempo-Menü. Rythmotron kann das Tempo ggf. auslesen/visualisieren, aber diese Taste steuert das Hardware-Menü. [FUNC] + [TEMPO] für Tap Tempo.",
      type: "button",
      section: "transport",
      color: "#0ea5e9" // blue
    },
    {
      hardwareName: "[NO]",
      rythmotronName: "Cancel / Reload / Back",
      function: "Hardware-Navigation (Zurück, Abbrechen) / Kombiniert mit Mode-Tasten (32-36) zum Neu laden von Kit/Sound/Track/Pattern/Song (stellt den Zustand wieder her, der in Rythmotron ggf. manipuliert wurde).",
      type: "button",
      section: "navigation",
      color: "#f43f5e" // red
    },
    {
      hardwareName: "[YES]",
      rythmotronName: "Confirm / Save",
      function: "Hardware-Navigation (Bestätigen, Auswählen) / Kombiniert mit Mode-Tasten (32-36) zum Speichern von Kit/Sound/Track/Pattern/Song (sichert den aktuellen Zustand, der in Rythmotron visualisiert oder manipuliert wird).",
      type: "button",
      section: "navigation",
      color: "#4ade80" // green
    },
    {
      hardwareName: "Screen",
      rythmotronName: "Hardware Display",
      function: "Zeigt die internen Informationen des Rytm MKII an. Rythmotron bietet eine alternative, oft detailliertere visuelle Darstellung im Browser.",
      type: "display",
      section: "main",
      color: "#0ea5e9" // blue
    },
    {
      hardwareName: "[ARROW] keys",
      rythmotronName: "Hardware Navigation Arrows",
      function: "Navigation in den Hardware-Menüs.",
      type: "button",
      section: "navigation",
      color: "#0ea5e9" // blue
    },
    {
      hardwareName: "[TRIG]",
      rythmotronName: "Trig Condition Setup",
      function: "Steuert Hardware-Trig-Einstellungen / Öffnet das Quantize-Menü. Rythmotron kann die Parameter Locks auf den Trigs visualisieren.",
      type: "button",
      section: "sequencer",
      color: "#f59e0b" // amber
    },
    {
      hardwareName: "DATA ENTRY knobs A–H",
      rythmotronName: "Parameter Control Knobs A-H",
      function: "Stellen die auf dem Hardware Display (und in Rythmotron) angezeigten Parameter ein. Drücken+Drehen für größere Schritte.",
      type: "knob",
      section: "main",
      color: "#a855f7" // purple
    },
    {
      hardwareName: "[PARAMETER] keys",
      rythmotronName: "Parameter Page Selectors (Synth, Sample, Filter, Amp, LFO)",
      function: "Wählen die Hardware-Parameterseiten aus, deren Werte in Rythmotron visualisiert und über die Parameter Control Knobs verändert werden können. Sekundärfunktionen öffnen relevante Auswahlmenüs (Machine, Sample, Sound Settings).",
      type: "button",
      section: "main",
      color: "#a855f7" // purple
    },
    {
      hardwareName: "[FX]",
      rythmotronName: "FX Track Select / MIDI Config",
      function: "Wählt den FX-Track aus (dessen Parameter ggf. in Rythmotron sichtbar sind) / Öffnet das MIDI Config Menü (relevant für die Rythmotron-Verbindung).",
      type: "button",
      section: "tracks",
      color: "#8b5cf6" // violet
    },
    {
      hardwareName: "[SONG MODE]",
      rythmotronName: "Song Mode Control (Hardware)",
      function: "Aktiviert/deaktiviert den Hardware Song Modus / Öffnet Song Edit. Rythmotron interagiert eher auf Pattern/Kit-Ebene.",
      type: "button",
      section: "transport",
      color: "#0ea5e9" // blue
    },
    {
      hardwareName: "[CHAIN MODE]",
      rythmotronName: "Chain Mode Control (Hardware)",
      function: "Aktiviert/deaktiviert den Hardware Chain Modus / Initiiert neue Chain. Siehe Song Mode.",
      type: "button",
      section: "transport",
      color: "#0ea5e9" // blue
    },
    {
      hardwareName: "[FILL]",
      rythmotronName: "Fill Condition Trigger (Hardware)",
      function: "Aktiviert/Cued den Hardware Fill Modus (beeinflusst Conditional Locks, die Rythmotron ggf. visualisiert).",
      type: "button",
      section: "transport",
      color: "#0ea5e9" // blue
    },
    {
      hardwareName: "<PATTERN PAGE> LEDs",
      rythmotronName: "Pattern Page Indicators (Hardware)",
      function: "Zeigen Struktur und Abspielposition des Hardware-Patterns.",
      type: "led",
      section: "sequencer",
      color: "#a855f7" // purple
    },
    {
      hardwareName: "[PAGE]",
      rythmotronName: "Pattern Page Select / Scale Setup",
      function: "Wählt aktive Pattern-Seite aus / Öffnet das Scale-Menü (beeinflusst Patternstruktur/Timing).",
      type: "button",
      section: "sequencer",
      color: "#f59e0b" // amber
    },
    {
      hardwareName: "[STOP]",
      rythmotronName: "Transport Stop / Paste Command",
      function: "Stoppt den Hardware-Sequenzer / Dient als Hardware-Paste-Befehl.",
      type: "button",
      section: "transport",
      color: "#f43f5e" // red
    },
    {
      hardwareName: "[PLAY]",
      rythmotronName: "Transport Play/Pause / Clear Command",
      function: "Startet/Pausiert den Hardware-Sequenzer / Dient als Hardware-Clear-Befehl.",
      type: "button",
      section: "transport",
      color: "#4ade80" // green
    },
    {
      hardwareName: "[RECORD]",
      rythmotronName: "Record Mode Select / Copy Command",
      function: "Aktiviert Hardware Recording Modi (Grid, Live, Step) / Dient als Hardware-Copy-Befehl.",
      type: "button",
      section: "transport",
      color: "#f43f5e" // red
    },
    {
      hardwareName: "[BANK A–H]",
      rythmotronName: "Bank Selectors (Hardware)",
      function: "Wählen die Hardware-Pattern-Bank (A-H) aus, in Kombination mit den Sequencer Step Keys.",
      type: "button",
      section: "sequencer",
      color: "#0ea5e9" // blue
    },
    {
      hardwareName: "<PATTERN MODE> LEDs",
      rythmotronName: "Pattern Change Mode Indicators (Hardware)",
      function: "Zeigen an, wie Hardware-Pattern-Wechsel erfolgen (Direct Jump, Direct Start, Sequential).",
      type: "led",
      section: "sequencer",
      color: "#f59e0b" // amber
    },
    {
      hardwareName: "[PADS]",
      rythmotronName: "Track Trigger Pads / Visual Feedback",
      function: "Spielen die Sounds der Tracks (deren Parameter Rythmotron visualisiert) / Dienen in verschiedenen Modi (Mute, Chromatic, Scene, Perf) zur Interaktion / Geben visuelles Feedback über Farbe.",
      type: "pad",
      section: "tracks",
      color: "#a855f7" // purple
    },
    {
      hardwareName: "[TRIG] keys",
      rythmotronName: "Sequencer Step Keys / Pattern Selectors",
      function: "Setzen/Löschen von Trigs im Grid Recording Modus (deren P-Locks Rythmotron visualisieren kann) / Wählen Patterns in Kombination mit Bank Selectors aus.",
      type: "button",
      section: "sequencer",
      color: "#f59e0b" // amber
    },
    {
      hardwareName: "[RTRG]",
      rythmotronName: "Retrig Function (Hardware)",
      function: "Aktiviert kontinuierliches Neutriggern von Sounds in Kombination mit den Pads / Öffnet das Click Track Menü.",
      type: "button",
      section: "tracks",
      color: "#a855f7" // purple
    },
    {
      hardwareName: "[TRK]",
      rythmotronName: "Track Select / Kit Save / Global Access",
      function: "Wählt in Kombination mit den Pads den aktiven Track aus (dessen Daten Rythmotron anzeigt) / Sekundärfunktion: Speichert aktuelles Kit / Sekundärfunktion: Öffnet Global Menü (für Projekte, Samples etc.).",
      type: "button",
      section: "tracks",
      color: "#a855f7" // purple
    },
    {
      hardwareName: "[FUNC]",
      rythmotronName: "Function Modifier (Hardware)",
      function: "Aktiviert Sekundärfunktionen anderer Tasten.",
      type: "button",
      section: "navigation",
      color: "#f43f5e" // red
    },
    {
      hardwareName: "[GLOBAL SETTINGS]",
      rythmotronName: "Global Settings Access / Project Management",
      function: "Öffnet das Hauptmenü für globale Einstellungen, Projekt- und Sample-Management / Sekundärfunktion: Project Save/Load.",
      type: "button",
      section: "main",
      color: "#0ea5e9" // blue
    },
    {
      hardwareName: "[PLAY MODE]",
      rythmotronName: "Pad Play Mode / Kit Menu Access",
      function: "Schaltet die Pads in den Sound-Spielmodus / Öffnet das Kit Menü (wo z.B. Daten für Rythmotron geladen/gespeichert werden).",
      type: "button",
      section: "tracks",
      color: "#4ade80" // green
    },
    {
      hardwareName: "[MUTE]",
      rythmotronName: "Track Mute Mode / Sound Menu Access",
      function: "Aktiviert den Track Mute Modus über die Pads / Öffnet das Sound Menü (zum Laden/Speichern/Managen von Sounds, die Rythmotron ggf. manipuliert).",
      type: "button",
      section: "tracks",
      color: "#f43f5e" // red
    },
    {
      hardwareName: "[CHRO]",
      rythmotronName: "Chromatic Pad Mode / Track Menu Access",
      function: "Aktiviert den chromatischen Spielmodus für den aktiven Track über die Pads / Öffnet das Track Menü.",
      type: "button",
      section: "tracks",
      color: "#8b5cf6" // violet
    },
    {
      hardwareName: "[SCNE]",
      rythmotronName: "Scene Mode (Hardware) / Pattern Menu Access",
      function: "Aktiviert den Hardware Scene Modus / Öffnet das Pattern Menü (wo z.B. Patterns für Rythmotron geladen/gespeichert werden).",
      type: "button",
      section: "perf",
      color: "#f59e0b" // amber
    },
    {
      hardwareName: "[PERF]",
      rythmotronName: "Performance Mode (Hardware) / Song Menu Access",
      function: "Aktiviert den Hardware Performance Modus / Öffnet das Song Menü.",
      type: "button",
      section: "perf",
      color: "#4ade80" // green
    }
  ];

  const sections = [
    { id: 'all', name: 'Alle' },
    { id: 'main', name: 'Hauptbedienelemente' },
    { id: 'sampling', name: 'Sampling' },
    { id: 'perf', name: 'Performance' },
    { id: 'sequencer', name: 'Sequencer' },
    { id: 'transport', name: 'Transport' },
    { id: 'tracks', name: 'Tracks' },
    { id: 'navigation', name: 'Navigation' },
    { id: 'other', name: 'Sonstige' }
  ];

  const filteredComponents = activeSection === 'all' 
    ? components 
    : components.filter(comp => comp.section === activeSection);

  return (
    <div className="p-6 bg-zinc-900 text-zinc-100 rounded-xl border border-zinc-800">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Rythmotron - Analog Rytm MKII Komponenten</h2>
        <p className="text-zinc-400 mb-4">
          Dieses Handbuch zeigt die Beziehung zwischen den Hardware-Bedienelementen des Analog Rytm MKII und ihren Funktionen im Kontext der Rythmotron-Web-App.
        </p>
        <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 text-sm text-zinc-300">
          <p>
            <strong className="text-purple-400">Wichtig:</strong> Rythmotron ist eine Web-basierte Companion App, die über WebMIDI mit dem Analog Rytm MKII kommuniziert. 
            Die App ersetzt nicht die Hardware-Steuerung, sondern ergänzt sie durch Visualisierung und spezielle Manipulationsmöglichkeiten wie Randomisierung und Morphing.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="all" onValueChange={setActiveSection}>
          <TabsList className="mb-4 flex flex-wrap gap-2">
            {sections.map(section => (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="!rounded-button whitespace-nowrap bg-zinc-800 hover:bg-zinc-700 px-3 py-1 text-sm"
              >
                {section.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComponents.map((component, index) => (
          <ComponentCard
            key={index}
            hardwareName={component.hardwareName}
            rythmotronName={component.rythmotronName}
            function={component.function}
            type={component.type}
            section={component.section}
            color={component.color}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
        <h3 className="text-lg font-bold mb-2">Interaktionsmethodik</h3>
        <p className="text-zinc-400 mb-2">
          In Rythmotron werden Daten aus dem Analog Rytm MKII visualisiert und bestimmte Manipulationen ermöglicht:
        </p>
        <ul className="list-disc list-inside text-zinc-300 space-y-1 text-sm">
          <li>Visualisierung: Aktuelles Kit, Parameter-Locks, Modulationen werden im Browser angezeigt.</li>
          <li>Manipulation: Kits, Sounds und Patterns können durch Web-UI randomisiert und gemorpht werden.</li>
          <li>Synchronisierung: Änderungen werden über WebMIDI zurück an die Hardware gesendet.</li>
        </ul>
      </div>
    </div>
  );
};

// Mit ErrorBoundary umwickeln
const RythmotronComponentsGuide = withErrorBoundary(RythmotronComponentsGuideBase, 'RythmotronComponentsGuide');
export default RythmotronComponentsGuide;