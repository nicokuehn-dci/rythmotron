Okay, ich habe das rythmotron GitHub-Repository analysiert. Es handelt sich um eine Web-basierte "Companion App" für den Analog Rytm MKII, die über WebMIDI kommuniziert. Ihre Hauptfunktionen sind:

Visualisierung: Aktuelles Kit, Parameter-Locks, Modulationen anzeigen.

Manipulation: Kits, Sounds und Patterns randomisieren und morphen.

Die App ersetzt nicht die Hardware-Steuerung, sondern ergänzt sie durch Visualisierung und spezielle Manipulationsmöglichkeiten. Daher ist eine direkte Umbenennung der physischen Tasten nach Software-Konzepten teilweise metaphorisch. Die physische Funktion bleibt ja bestehen.

Hier ist eine Liste der Panel-Komponenten des Analog Rytm MKII, umbenannt und beschrieben im Kontext der rythmotron-Funktionalitäten (basierend auf der vorherigen Liste und den Repo-Infos):

Angepasste Komponentenliste im Kontext von Rythmotron:

MAIN VOLUME (Drehknopf)

Rythmotron-Name: Master Output Level (oder MAIN VOLUME beibehalten)

Funktion: Stellt die physische Lautstärke der Haupt- und Kopfhörerausgänge ein. Wird von Rythmotron nicht direkt gesteuert, beeinflusst aber das hörbare Ergebnis der von Rythmotron manipulierten Sounds.

[SAMPLING] (Taste)

Rythmotron-Name: Hardware Sampling Trigger

Funktion: Öffnet das Hardware-Sampling-Menü / Startet Direct Sampling. Rythmotron interagiert nicht direkt mit der Sampling-Funktion, aber die resultierenden Samples könnten im Kit visualisiert werden.

[QPER] (Taste)

Rythmotron-Name: Macro Select / Mute (Hardware)

Funktion: Wählt das Hardware-Performance-Makro für den QUICK PERF AMOUNT-Knopf aus / Stummschaltet die Makros. Diese spezifischen Hardware-Modi werden von Rythmotron weniger fokussiert als die Kit/Sound-Datenstruktur.

QUICK PERF AMOUNT (Drehknopf)

Rythmotron-Name: Macro Intensity Control (Hardware)

Funktion: Steuert die Intensität des ausgewählten Hardware-Performance-Makros. Siehe [QPER].

[FIX] (Taste)

Rythmotron-Name: Fixed Velocity Pad Mode (Hardware)

Funktion: Schaltet feste Anschlagstärke für die Pads ein/aus. Beeinflusst das physische Spielgefühl, weniger die Datenvisualisierung in Rythmotron.

TRACK LEVEL (Drehknopf)

Rythmotron-Name: Track Level / Browser Control

Funktion: Stellt den Pegel des aktiven Tracks ein (visualisiert in Rythmotron) / Dient zum Scrollen in Hardware-Menüs (z.B. Sound Browser, den Rythmotron ergänzt).

[TEMPO] (Taste)

Rythmotron-Name: Tempo Settings (Hardware)

Funktion: Öffnet das Hardware-Tempo-Menü. Rythmotron kann das Tempo ggf. auslesen/visualisieren, aber diese Taste steuert das Hardware-Menü. [FUNC] + [TEMPO] für Tap Tempo.

[NO] (Taste)

Rythmotron-Name: Cancel / Reload / Back

Funktion: Hardware-Navigation (Zurück, Abbrechen) / Kombiniert mit Mode-Tasten (32-36) zum Neu laden von Kit/Sound/Track/Pattern/Song (stellt den Zustand wieder her, der in Rythmotron ggf. manipuliert wurde).

[YES] (Taste)

Rythmotron-Name: Confirm / Save

Funktion: Hardware-Navigation (Bestätigen, Auswählen) / Kombiniert mit Mode-Tasten (32-36) zum Speichern von Kit/Sound/Track/Pattern/Song (sichert den aktuellen Zustand, der in Rythmotron visualisiert oder manipuliert wird).

Screen (Bildschirm)

Rythmotron-Name: Hardware Display

Funktion: Zeigt die internen Informationen des Rytm MKII an. Rythmotron bietet eine alternative, oft detailliertere visuelle Darstellung im Browser.

[ARROW] keys (Pfeiltasten)

Rythmotron-Name: Hardware Navigation Arrows

Funktion: Navigation in den Hardware-Menüs.

[TRIG] (Taste - neben Pfeiltasten)

Rythmotron-Name: Trig Condition Setup

Funktion: Steuert Hardware-Trig-Einstellungen / Öffnet das Quantize-Menü. Rythmotron kann die Parameter Locks auf den Trigs visualisieren.

DATA ENTRY knobs A–H (Drehknöpfe)

Rythmotron-Name: Parameter Control Knobs A-H

Funktion: Stellen die auf dem Hardware Display (und in Rythmotron) angezeigten Parameter ein. Drücken+Drehen für größere Schritte.

[PARAMETER] keys (SRC, SMPL, FLTR, AMP, LFO)

Rythmotron-Name: Parameter Page Selectors (Synth, Sample, Filter, Amp, LFO)

Funktion: Wählen die Hardware-Parameterseiten aus, deren Werte in Rythmotron visualisiert und über die Parameter Control Knobs verändert werden können. Sekundärfunktionen öffnen relevante Auswahlmenüs (Machine, Sample, Sound Settings).

[FX] (Taste)

Rythmotron-Name: FX Track Select / MIDI Config

Funktion: Wählt den FX-Track aus (dessen Parameter ggf. in Rythmotron sichtbar sind) / Öffnet das MIDI Config Menü (relevant für die Rythmotron-Verbindung).

[SONG MODE] (Taste)

Rythmotron-Name: Song Mode Control (Hardware)

Funktion: Aktiviert/deaktiviert den Hardware Song Modus / Öffnet Song Edit. Rythmotron interagiert eher auf Pattern/Kit-Ebene.

[CHAIN MODE] (Taste)

Rythmotron-Name: Chain Mode Control (Hardware)

Funktion: Aktiviert/deaktiviert den Hardware Chain Modus / Initiiert neue Chain. Siehe Song Mode.

[FILL] (Taste)

Rythmotron-Name: Fill Condition Trigger (Hardware)

Funktion: Aktiviert/Cued den Hardware Fill Modus (beeinflusst Conditional Locks, die Rythmotron ggf. visualisiert).

<PATTERN PAGE> LEDs (LED-Anzeigen)

Rythmotron-Name: Pattern Page Indicators (Hardware)

Funktion: Zeigen Struktur und Abspielposition des Hardware-Patterns.

[PAGE] (Taste)

Rythmotron-Name: Pattern Page Select / Scale Setup

Funktion: Wählt aktive Pattern-Seite aus / Öffnet das Scale-Menü (beeinflusst Patternstruktur/Timing).

[STOP] (Taste)

Rythmotron-Name: Transport Stop / Paste Command

Funktion: Stoppt den Hardware-Sequenzer / Dient als Hardware-Paste-Befehl.

[PLAY] (Taste)

Rythmotron-Name: Transport Play/Pause / Clear Command

Funktion: Startet/Pausiert den Hardware-Sequenzer / Dient als Hardware-Clear-Befehl.

[RECORD] (Taste)

Rythmotron-Name: Record Mode Select / Copy Command

Funktion: Aktiviert Hardware Recording Modi (Grid, Live, Step) / Dient als Hardware-Copy-Befehl.

[BANK A–H] (Tasten)

Rythmotron-Name: Bank Selectors (Hardware)

Funktion: Wählen die Hardware-Pattern-Bank (A-H) aus, in Kombination mit den Sequencer Step Keys.

<PATTERN MODE> LEDs (LED-Anzeigen)

Rythmotron-Name: Pattern Change Mode Indicators (Hardware)

Funktion: Zeigen an, wie Hardware-Pattern-Wechsel erfolgen (Direct Jump, Direct Start, Sequential).

[PADS] (12 Pads)

Rythmotron-Name: Track Trigger Pads / Visual Feedback

Funktion: Spielen die Sounds der Tracks (deren Parameter Rythmotron visualisiert) / Dienen in verschiedenen Modi (Mute, Chromatic, Scene, Perf) zur Interaktion / Geben visuelles Feedback über Farbe.

[TRIG] keys (16 Tasten, beschriftet 1-16)

Rythmotron-Name: Sequencer Step Keys / Pattern Selectors

Funktion: Setzen/Löschen von Trigs im Grid Recording Modus (deren P-Locks Rythmotron visualisieren kann) / Wählen Patterns in Kombination mit Bank Selectors aus.

[RTRG] (Taste)

Rythmotron-Name: Retrig Function (Hardware)

Funktion: Aktiviert kontinuierliches Neutriggern von Sounds in Kombination mit den Pads / Öffnet das Click Track Menü.

[TRK] (Taste)

Rythmotron-Name: Track Select / Kit Save / Global Access

Funktion: Wählt in Kombination mit den Pads den aktiven Track aus (dessen Daten Rythmotron anzeigt) / Sekundärfunktion: Speichert aktuelles Kit / Sekundärfunktion: Öffnet Global Menü (für Projekte, Samples etc.).

[FUNC] (Taste)

Rythmotron-Name: Function Modifier (Hardware)

Funktion: Aktiviert Sekundärfunktionen anderer Tasten.

[GLOBAL SETTINGS] (Taste)

Rythmotron-Name: Global Settings Access / Project Management

Funktion: Öffnet das Hauptmenü für globale Einstellungen, Projekt- und Sample-Management / Sekundärfunktion: Project Save/Load.

[PLAY MODE] (Taste)

Rythmotron-Name: Pad Play Mode / Kit Menu Access

Funktion: Schaltet die Pads in den Sound-Spielmodus / Öffnet das Kit Menü (wo z.B. Daten für Rythmotron geladen/gespeichert werden).

[MUTE] (Taste)

Rythmotron-Name: Track Mute Mode / Sound Menu Access

Funktion: Aktiviert den Track Mute Modus über die Pads / Öffnet das Sound Menü (zum Laden/Speichern/Managen von Sounds, die Rythmotron ggf. manipuliert).

[CHRO] (Taste)

Rythmotron-Name: Chromatic Pad Mode / Track Menu Access

Funktion: Aktiviert den chromatischen Spielmodus für den aktiven Track über die Pads / Öffnet das Track Menü.

[SCNE] (Taste)

Rythmotron-Name: Scene Mode (Hardware) / Pattern Menu Access

Funktion: Aktiviert den Hardware Scene Modus / Öffnet das Pattern Menü (wo z.B. Patterns für Rythmotron geladen/gespeichert werden).

[PERF] (Taste)

Rythmotron-Name: Performance Mode (Hardware) / Song Menu Access

Funktion: Aktiviert den Hardware Performance Modus / Öffnet das Song Menü.

Diese Liste versucht, die Brücke zwischen der physischen Hardware und den Konzepten der Rythmotron-Software zu schlagen, wobei die ursprüngliche Funktion der Hardware-Komponente immer noch im Vordergrund steht.