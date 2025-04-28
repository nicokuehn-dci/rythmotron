import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { PlusCircle, Play, Square, Settings, Copy, Clipboard, Trash2, Edit } from 'lucide-react';
import SequencerGrid from './SequencerGrid';
import Sequencer from '../lib/services/Sequencer';
import { SequencerPattern } from '../lib/services/Sequencer';
import TransportControls from './TransportControls';

interface SequencerTabProps {
  className?: string;
}

const SequencerTab: React.FC<SequencerTabProps> = ({ className = '' }) => {
  const [patterns, setPatterns] = useState<SequencerPattern[]>([]);
  const [currentPatternId, setCurrentPatternId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tempo, setTempo] = useState<number>(120);
  const [copiedPattern, setCopiedPattern] = useState<SequencerPattern | null>(null);
  const [isEditingPatternName, setIsEditingPatternName] = useState<string | null>(null);
  const [newPatternName, setNewPatternName] = useState<string>('');
  
  // Load patterns and set current pattern on initial render
  useEffect(() => {
    let loadedPatterns = Sequencer.getPatterns();
    
    // Create a default pattern if no patterns exist
    if (loadedPatterns.length === 0) {
      const defaultPatternId = "default-pattern";
      Sequencer.createPattern(defaultPatternId, "Pattern 1");
      loadedPatterns = Sequencer.getPatterns();
    }
    
    setPatterns(loadedPatterns);
    
    const currentPattern = Sequencer.getCurrentPattern();
    if (currentPattern) {
      setCurrentPatternId(currentPattern.id);
    } else if (loadedPatterns.length > 0) {
      // Set the first pattern as current if no current pattern is set
      Sequencer.setCurrentPattern(loadedPatterns[0].id);
      setCurrentPatternId(loadedPatterns[0].id);
    }

    // Set initial play state
    setIsPlaying(false);

    // Subscribe to playStateChange events
    const handlePlayStateChange = (data: boolean) => {
      setIsPlaying(data);
    };
    
    Sequencer.on('playStateChange', handlePlayStateChange);
    
    // Cleanup event listeners
    return () => {
      Sequencer.off('playStateChange', handlePlayStateChange);
    };
  }, []);

  // Handle pattern change
  const handlePatternChange = (patternId: string) => {
    if (Sequencer.setCurrentPattern(patternId)) {
      setCurrentPatternId(patternId);
    }
  };

  // Create a new pattern
  const createNewPattern = () => {
    const newPatternId = `pattern-${Date.now()}`;
    const newPatternName = `Pattern ${patterns.length + 1}`;
    
    Sequencer.createPattern(newPatternId, newPatternName);
    Sequencer.setCurrentPattern(newPatternId);
    
    // Update state with the new patterns list
    setPatterns(Sequencer.getPatterns());
    setCurrentPatternId(newPatternId);
  };
  
  // Copy a pattern
  const handleCopyPattern = (patternId: string) => {
    const patternToCopy = patterns.find(p => p.id === patternId);
    if (patternToCopy) {
      setCopiedPattern({ ...patternToCopy });
    }
  };
  
  // Paste a pattern
  const handlePastePattern = () => {
    if (!copiedPattern) return;
    
    const newPatternId = `pattern-${Date.now()}`;
    const newPatternName = `${copiedPattern.name} Copy`;
    
    // Create new pattern using the copied pattern's data
    Sequencer.createPattern(newPatternId, newPatternName, copiedPattern);
    Sequencer.setCurrentPattern(newPatternId);
    
    // Update state with the new patterns list
    setPatterns(Sequencer.getPatterns());
    setCurrentPatternId(newPatternId);
  };
  
  // Delete a pattern
  const handleDeletePattern = (patternId: string) => {
    if (patterns.length <= 1) {
      // Don't allow deleting the last pattern
      return;
    }
    
    // Delete pattern
    Sequencer.deletePattern(patternId);
    
    // Update patterns list
    const updatedPatterns = Sequencer.getPatterns();
    setPatterns(updatedPatterns);
    
    // If the current pattern was deleted, select the first available pattern
    if (patternId === currentPatternId && updatedPatterns.length > 0) {
      Sequencer.setCurrentPattern(updatedPatterns[0].id);
      setCurrentPatternId(updatedPatterns[0].id);
    }
  };
  
  // Start editing a pattern name
  const handleStartEditPatternName = (patternId: string) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (pattern) {
      setIsEditingPatternName(patternId);
      setNewPatternName(pattern.name);
    }
  };
  
  // Save edited pattern name
  const handleSavePatternName = (patternId: string) => {
    if (newPatternName.trim()) {
      Sequencer.renamePattern(patternId, newPatternName.trim());
      setPatterns(Sequencer.getPatterns());
    }
    setIsEditingPatternName(null);
  };

  // Handle play/stop
  const handlePlayToggle = () => {
    if (isPlaying) {
      Sequencer.stop();
    } else {
      Sequencer.start();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle tempo change
  const handleTempoChange = (newTempo: number) => {
    Sequencer.setTempo(newTempo);
    setTempo(newTempo);
  };

  return (
    <div className={`sequencer-tab ${className}`}>
      <h2 className="text-xl font-bold mb-4">Step Sequencer</h2>
      
      {/* Transport Controls Section */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 p-4 mb-4">
        <TransportControls 
          isPlaying={isPlaying}
          onPlayToggle={handlePlayToggle}
          tempo={tempo}
          onTempoChange={handleTempoChange}
        />
      </div>
      
      {patterns.length === 0 ? (
        <div className="p-6 text-center bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <p className="mb-4">No patterns available</p>
          <Button 
            variant="default" 
            onClick={createNewPattern}
            className="flex items-center gap-1 mx-auto"
          >
            <PlusCircle className="h-4 w-4" />
            Create First Pattern
          </Button>
        </div>
      ) : (
        <Tabs defaultValue={currentPatternId} value={currentPatternId} onValueChange={handlePatternChange}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="relative">
              {patterns.map(pattern => (
                <div key={pattern.id} className="relative group">
                  {isEditingPatternName === pattern.id ? (
                    <div className="px-3 py-1 bg-zinc-700 rounded-md shadow-lg">
                      <input
                        type="text"
                        value={newPatternName}
                        onChange={(e) => setNewPatternName(e.target.value)}
                        onBlur={() => handleSavePatternName(pattern.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSavePatternName(pattern.id);
                          if (e.key === 'Escape') setIsEditingPatternName(null);
                        }}
                        className="bg-transparent border-none outline-none text-white text-sm w-32"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <>
                      <TabsTrigger 
                        value={pattern.id}
                        className="px-4 py-2 relative"
                      >
                        {pattern.name}
                        <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex bg-zinc-900 border border-zinc-700 rounded-md shadow-lg overflow-hidden">
                            <button 
                              className="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                              title="Edit Pattern Name"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditPatternName(pattern.id);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              className="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                              title="Copy Pattern"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyPattern(pattern.id);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <button 
                              className={`p-1 hover:bg-zinc-700 ${patterns.length > 1 ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 cursor-not-allowed'}`}
                              title={patterns.length > 1 ? "Delete Pattern" : "Cannot delete the only pattern"}
                              disabled={patterns.length <= 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (patterns.length > 1) {
                                  handleDeletePattern(pattern.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </TabsTrigger>
                    </>
                  )}
                </div>
              ))}
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-1 ${copiedPattern ? 'text-white' : 'text-zinc-500'}`}
                disabled={!copiedPattern}
                onClick={handlePastePattern}
                title={copiedPattern ? "Paste Pattern" : "No Pattern Copied"}
              >
                <Clipboard className="h-4 w-4" />
                Paste
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={createNewPattern}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                New
              </Button>
            </div>
          </div>
          
          {patterns.map(pattern => (
            <TabsContent key={pattern.id} value={pattern.id} className="mt-2">
              <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 p-4">
                <SequencerGrid patternId={pattern.id} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default SequencerTab;