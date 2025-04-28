import React, { useEffect, useState } from 'react';
import LED from './ui/led';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { ChevronDown, ChevronUp, Copy, Clipboard, Wand2, RotateCcw } from 'lucide-react';
import sequencer, { SequencerPattern, SequencerTrack, SequencerStep } from '../lib/services/Sequencer';

interface SequencerGridProps {
  className?: string;
  patternId?: string;
  onStepChange?: (trackId: number, stepIndex: number, active: boolean) => void;
  onPatternCopy?: (patternData: any) => void;
}

// CSS classes for grid layout
const gridColsClass = "grid-cols-[repeat(16,minmax(0,1fr))]";

const SequencerGrid: React.FC<SequencerGridProps> = ({
  className = '',
  patternId = 'default',
  onStepChange,
  onPatternCopy,
}) => {
  const [pattern, setPattern] = useState<SequencerPattern | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [selectedTrack, setSelectedTrack] = useState<number>(0);
  const [selectedStep, setSelectedStep] = useState<{trackId: number, stepIndex: number} | null>(null);
  const [showStepEditor, setShowStepEditor] = useState<boolean>(false);
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);
  const [copiedSteps, setCopiedSteps] = useState<SequencerStep[] | null>(null);
  const [copiedTrackId, setCopiedTrackId] = useState<number | null>(null);
  const [patternSwing, setPatternSwing] = useState<number>(0);
  const [noteRepeats, setNoteRepeats] = useState<{[key: number]: number}>({});

  // Load pattern data on component mount or when patternId changes
  useEffect(() => {
    const loadedPattern = sequencer.getPattern(patternId);
    if (loadedPattern) {
      setPattern(loadedPattern);
      // Load swing value if it exists, otherwise default to 0
      setPatternSwing(loadedPattern.swing || 0);
    } else {
      // Create a default pattern if one with the specified ID doesn't exist
      sequencer.createPattern(patternId, 'New Pattern');
      setPattern(sequencer.getPattern(patternId));
    }
    
    // Set current pattern as active in sequencer
    sequencer.setCurrentPattern(patternId);
  }, [patternId]);

  // Apply swing when it changes
  useEffect(() => {
    if (pattern) {
      sequencer.setPatternSwing(patternId, patternSwing);
    }
  }, [patternSwing, patternId]);

  // Set up event listeners for the sequencer
  useEffect(() => {
    // Listen for step changes
    const handleStepChange = (step: number) => {
      setCurrentStep(step);
    };
    
    sequencer.on('step', handleStepChange);

    // Clean up listeners when component unmounts
    return () => {
      sequencer.off('step', handleStepChange);
    };
  }, []);

  // Handle step toggle
  const handleStepToggle = (trackId: number, stepIndex: number) => {
    if (!pattern) return;
    
    // Find track in pattern
    const track = pattern.tracks.find(t => t.id === trackId);
    if (!track) return;
    
    // Get current state
    const currentActive = track.steps[stepIndex].active;
    
    // Toggle step state
    sequencer.updateStep(trackId, stepIndex, { active: !currentActive });
    
    // Update local state to reflect change
    setPattern({...pattern, tracks: pattern.tracks.map(t => 
      t.id === trackId ? {
        ...t, 
        steps: t.steps.map((s, i) => 
          i === stepIndex ? {...s, active: !s.active} : s
        )
      } : t
    )});
    
    // Call external handler if provided
    if (onStepChange) {
      onStepChange(trackId, stepIndex, !currentActive);
    }
  };
  
  // Handle track mute toggle
  const handleMuteToggle = (trackId: number) => {
    if (!pattern) return;
    
    // Find the track and toggle its mute state
    const updatedTracks = pattern.tracks.map(track => 
      track.id === trackId ? { ...track, mute: !track.mute } : track
    );
    
    // Update local state
    setPattern({...pattern, tracks: updatedTracks});
    
    // Update sequencer
    const track = updatedTracks.find(t => t.id === trackId);
    if (track) {
      sequencer.updateTrack(trackId, { mute: track.mute });
    }
  };
  
  // Handle track solo toggle
  const handleSoloToggle = (trackId: number) => {
    if (!pattern) return;
    
    // Find the track and toggle its solo state
    const updatedTracks = pattern.tracks.map(track => 
      track.id === trackId ? { ...track, solo: !track.solo } : track
    );
    
    // Update local state
    setPattern({...pattern, tracks: updatedTracks});
    
    // Update sequencer
    const track = updatedTracks.find(t => t.id === trackId);
    if (track) {
      sequencer.updateTrack(trackId, { solo: track.solo });
    }
  };

  // Handle step selection for editing
  const handleStepSelect = (trackId: number, stepIndex: number) => {
    if (!pattern) return;
    
    const track = pattern.tracks.find(t => t.id === trackId);
    if (!track || !track.steps[stepIndex].active) return;
    
    setSelectedStep({ trackId, stepIndex });
    setShowStepEditor(true);
  };
  
  // Handle step velocity change
  const handleVelocityChange = (velocity: number) => {
    if (!pattern || !selectedStep) return;
    
    const { trackId, stepIndex } = selectedStep;
    
    // Update velocity in sequencer
    sequencer.updateStep(trackId, stepIndex, { velocity });
    
    // Update local state
    setPattern({...pattern, tracks: pattern.tracks.map(t => 
      t.id === trackId ? {
        ...t, 
        steps: t.steps.map((s, i) => 
          i === stepIndex ? {...s, velocity} : s
        )
      } : t
    )});
  };
  
  // Handle step probability change
  const handleProbabilityChange = (probability: number) => {
    if (!pattern || !selectedStep) return;
    
    const { trackId, stepIndex } = selectedStep;
    
    // Update probability in sequencer
    sequencer.updateStep(trackId, stepIndex, { probability });
    
    // Update local state
    setPattern({...pattern, tracks: pattern.tracks.map(t => 
      t.id === trackId ? {
        ...t, 
        steps: t.steps.map((s, i) => 
          i === stepIndex ? {...s, probability} : s
        )
      } : t
    )});
  };

  // Helper function to get color for track
  const getTrackColor = (trackName: string): string => {
    const colors: Record<string, string> = {
      'Kick': '#9333ea', // purple
      'Snare': '#6366f1', // indigo
      'HiHat': '#10b981', // emerald
      'Clap': '#f97316', // orange
      'Tom1': '#f43f5e', // rose
      'Tom2': '#ec4899', // pink
      'Crash': '#0ea5e9', // blue
      'Perc': '#eab308', // yellow
    };
    
    // Return color if found, otherwise default to gray
    return colors[trackName] || '#94a3b8';
  };

  // Handle track selection
  const handleTrackSelect = (trackId: number) => {
    setSelectedTrack(trackId);
    
    // Close step editor if open
    setShowStepEditor(false);
    setSelectedStep(null);
    
    // Toggle track expansion
    if (expandedTrack === trackId) {
      setExpandedTrack(null);
    } else {
      setExpandedTrack(trackId);
    }
  };

  // Toggle track expansion
  const handleToggleExpand = (trackId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (expandedTrack === trackId) {
      setExpandedTrack(null);
    } else {
      setExpandedTrack(trackId);
    }
  };

  // Generate demo pattern with common drum rhythms
  const handleGenerateDemo = () => {
    if (!pattern) return;
    
    // Basic 4/4 pattern
    const updatedTracks = pattern.tracks.map(track => {
      // Create a new copy of steps for this track
      const updatedSteps = track.steps.map(step => ({...step, active: false}));
      
      // Set default patterns based on track name
      switch(track.name) {
        case 'Kick':
          // Kick on beats 1 and 3
          updatedSteps[0].active = true;
          updatedSteps[8].active = true;
          break;
        case 'Snare':
          // Snare on beats 2 and 4
          updatedSteps[4].active = true;
          updatedSteps[12].active = true;
          break;
        case 'HiHat':
          // HiHat on every 8th note
          for (let i = 0; i < 16; i += 2) {
            updatedSteps[i].active = true;
            // Add some velocity variation to hi-hats
            updatedSteps[i].velocity = i % 4 === 0 ? 100 : 70;
          }
          break;
        case 'Clap':
          // Clap reinforcing snare
          updatedSteps[4].active = true;
          updatedSteps[12].active = true;
          break;
        case 'Tom1':
          // Fill at end of bar
          updatedSteps[13].active = true;
          updatedSteps[14].active = true;
          break;
        case 'Crash':
          // Crash on beat 1
          updatedSteps[0].active = true;
          break;
      }
      
      // Return updated track with new steps
      return {
        ...track,
        steps: updatedSteps
      };
    });
    
    // Update pattern in sequencer
    updatedTracks.forEach(track => {
      track.steps.forEach((step, stepIndex) => {
        if (step.active) {
          sequencer.updateStep(track.id, stepIndex, { 
            active: true, 
            velocity: step.velocity || 100,
            probability: step.probability || 100
          });
        }
      });
    });
    
    // Update local state
    setPattern({...pattern, tracks: updatedTracks});
  };

  // Clear all steps
  const handleClearAll = () => {
    if (!pattern) return;
    
    // Clear all steps
    const updatedTracks = pattern.tracks.map(track => ({
      ...track,
      steps: track.steps.map(step => ({ ...step, active: false }))
    }));
    
    // Update pattern in sequencer
    updatedTracks.forEach(track => {
      track.steps.forEach((_, stepIndex) => {
        sequencer.updateStep(track.id, stepIndex, { active: false });
      });
    });
    
    // Update local state
    setPattern({...pattern, tracks: updatedTracks});
  };

  // Copy steps from a track
  const handleCopyTrackSteps = (trackId: number) => {
    if (!pattern) return;
    
    const track = pattern.tracks.find(t => t.id === trackId);
    if (!track) return;
    
    setCopiedSteps([...track.steps]);
    setCopiedTrackId(trackId);
  };
  
  // Paste steps to a track
  const handlePasteTrackSteps = (trackId: number) => {
    if (!pattern || !copiedSteps) return;
    
    // Update steps in the sequencer
    copiedSteps.forEach((step, stepIndex) => {
      sequencer.updateStep(trackId, stepIndex, { 
        active: step.active,
        velocity: step.velocity,
        probability: step.probability 
      });
    });
    
    // Update local state
    setPattern({
      ...pattern, 
      tracks: pattern.tracks.map(t => 
        t.id === trackId ? {
          ...t,
          steps: copiedSteps.map(step => ({ ...step }))
        } : t
      )
    });
  };

  // Handle note repeat change
  const handleNoteRepeatChange = (trackId: number, stepIndex: number, repeats: number) => {
    if (!pattern || repeats <= 1) {
      // If repeats is 1 or less, remove from the state
      const updatedRepeats = { ...noteRepeats };
      delete updatedRepeats[`${trackId}-${stepIndex}`];
      setNoteRepeats(updatedRepeats);
      return;
    }
    
    // Update repeats state
    setNoteRepeats({
      ...noteRepeats,
      [`${trackId}-${stepIndex}`]: repeats
    });
    
    // Update in sequencer
    sequencer.updateStep(trackId, stepIndex, { repeats });
  };

  // Handle swing change
  const handleSwingChange = (swing: number) => {
    setPatternSwing(swing);
  };

  // Apply randomized velocities to a track
  const handleRandomizeVelocities = (trackId: number) => {
    if (!pattern) return;
    
    const track = pattern.tracks.find(t => t.id === trackId);
    if (!track) return;
    
    // Get active steps
    const activeStepIndices = track.steps
      .map((step, index) => step.active ? index : -1)
      .filter(index => index !== -1);
    
    // Apply random velocities between 60-100%
    activeStepIndices.forEach(stepIndex => {
      const randomVelocity = Math.floor(Math.random() * 41) + 60; // 60-100
      sequencer.updateStep(trackId, stepIndex, { velocity: randomVelocity });
    });
    
    // Update local state
    setPattern({
      ...pattern,
      tracks: pattern.tracks.map(t => 
        t.id === trackId ? {
          ...t,
          steps: t.steps.map((step, i) => 
            activeStepIndices.includes(i) 
              ? { 
                  ...step, 
                  velocity: Math.floor(Math.random() * 41) + 60
                } 
              : step
          )
        } : t
      )
    });
  };

  if (!pattern) {
    return <div className="text-center py-4 text-zinc-400">Loading pattern...</div>;
  }

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl ${className}`}>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium text-zinc-300">{pattern.name}</div>
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateDemo}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Demo Pattern
            </Button>
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Clear All
            </Button>
          </div>
        </div>
        
        {/* Swing control */}
        <div className="flex items-center gap-3 py-2 px-1">
          <div className="flex-grow">
            <label className="text-xs text-zinc-400 block mb-1">Swing</label>
            <div className="flex items-center gap-2">
              <Slider 
                defaultValue={[patternSwing]} 
                value={[patternSwing]}
                max={50} 
                min={0}
                step={5}
                onValueChange={([value]) => handleSwingChange(value)}
                className="flex-grow"
              />
              <span className="text-xs text-zinc-400 w-8">{patternSwing}%</span>
            </div>
          </div>
        </div>

        {/* Track headers row */}
        <div className="grid grid-cols-[200px_1fr] gap-2">
          <div className="text-sm text-zinc-500 font-medium">Track</div>
          <div className={`grid ${gridColsClass} gap-1`}>
            {Array.from({ length: 16 }, (_, i) => (
              <div 
                key={i} 
                className={`text-xs text-center ${currentStep === i ? 'text-white font-medium' : 'text-zinc-500'}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Tracks and steps */}
        {pattern.tracks.map((track) => (
          <React.Fragment key={track.id}>
            <div 
              className={`grid grid-cols-[200px_1fr] gap-2 items-center ${
                selectedTrack === track.id ? 'bg-zinc-800/50 rounded-md' : ''
              }`}
              onClick={() => handleTrackSelect(track.id)}
            >
              {/* Track info */}
              <div className="flex items-center gap-2 p-2">
                <button
                  className="text-zinc-500 hover:text-zinc-300"
                  onClick={(e) => handleToggleExpand(track.id, e)}
                >
                  {expandedTrack === track.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getTrackColor(track.name) }}
                ></div>
                <div className="text-sm text-zinc-300 font-medium flex-grow">{track.name}</div>
                <div className="flex gap-1">
                  <button
                    className={`w-6 h-6 flex items-center justify-center rounded ${
                      track.mute ? 'bg-yellow-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                    } text-xs`}
                    onClick={(e) => { e.stopPropagation(); handleMuteToggle(track.id); }}
                  >
                    M
                  </button>
                  <button
                    className={`w-6 h-6 flex items-center justify-center rounded ${
                      track.solo ? 'bg-green-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                    } text-xs`}
                    onClick={(e) => { e.stopPropagation(); handleSoloToggle(track.id); }}
                  >
                    S
                  </button>
                </div>
              </div>

              {/* Step pads */}
              <div className={`grid ${gridColsClass} gap-1`}>
                {track.steps.map((step, stepIndex) => (
                  <div
                    key={stepIndex}
                    className={`h-8 rounded-sm cursor-pointer flex items-center justify-center relative ${
                      step.active 
                        ? `bg-opacity-30 border` 
                        : 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700'
                    } ${currentStep === stepIndex ? 'ring-2 ring-white ring-opacity-60' : ''}`}
                    style={{
                      backgroundColor: step.active ? `${getTrackColor(track.name)}30` : undefined,
                      borderColor: step.active ? getTrackColor(track.name) : undefined
                    }}
                    onClick={() => handleStepToggle(track.id, stepIndex)}
                    onDoubleClick={() => step.active && handleStepSelect(track.id, stepIndex)}
                  >
                    {step.active && (
                      <>
                        <div 
                          className="w-2 h-2 rounded-full bg-white bg-opacity-70"
                          style={{ 
                            opacity: (step.velocity || 100) / 100,
                            transform: `scale(${(step.velocity || 100) / 80})`
                          }}
                        ></div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Expanded track controls */}
            {expandedTrack === track.id && 
              <div className="ml-6 pl-4 py-2 pr-2 bg-zinc-800 rounded-lg border border-zinc-700 mb-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Sample</label>
                    <select className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-sm text-zinc-300">
                      <option>{track.name} Sample</option>
                      <option>{track.name} Alt</option>
                      <option>{track.name} Tight</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Volume</label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        value={[100]} 
                        max={100} 
                        min={0}
                        className="flex-grow"
                      />
                      <span className="text-xs text-zinc-400 w-6">100%</span>
                    </div>
                  </div>
                  
                  {/* Track Step Tools */}
                  <div className="col-span-2 mt-2 pt-2 border-t border-zinc-700">
                    <div className="flex justify-between">
                      <span className="text-xs text-zinc-400">Track Tools</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs flex gap-1 items-center text-zinc-300 hover:text-white"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleCopyTrackSteps(track.id); 
                          }}
                          title="Copy steps from this track"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 px-2 text-xs flex gap-1 items-center ${
                            copiedSteps ? 'text-zinc-300 hover:text-white' : 'text-zinc-500 cursor-not-allowed'
                          }`}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (copiedSteps) handlePasteTrackSteps(track.id); 
                          }}
                          disabled={!copiedSteps}
                          title="Paste steps to this track"
                        >
                          <Clipboard className="h-3 w-3" />
                          Paste
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs flex gap-1 items-center text-zinc-300 hover:text-white"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleRandomizeVelocities(track.id); 
                          }}
                          title="Randomize velocities for active steps"
                        >
                          <Wand2 className="h-3 w-3" />
                          Randomize
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </React.Fragment>
        ))}
    
        
        {/* Step editor */}
        {showStepEditor && selectedStep && (
          <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-zinc-300">
                Edit Step - Track {pattern.tracks.find(t => t.id === selectedStep.trackId)?.name} - Step {selectedStep.stepIndex + 1}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowStepEditor(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Velocity</label>
                <div className="flex items-center gap-2">
                  <Slider 
                    defaultValue={[pattern.tracks.find(t => t.id === selectedStep.trackId)?.steps[selectedStep.stepIndex].velocity || 100]} 
                    max={100} 
                    min={0} 
                    step={1}
                    onValueChange={([value]) => handleVelocityChange(value)}
                    className="flex-grow"
                  />
                  <span className="text-sm text-zinc-300 w-10">
                    {pattern.tracks.find(t => t.id === selectedStep.trackId)?.steps[selectedStep.stepIndex].velocity || 100}%
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Probability</label>
                <div className="flex items-center gap-2">
                  <Slider 
                    defaultValue={[pattern.tracks.find(t => t.id === selectedStep.trackId)?.steps[selectedStep.stepIndex].probability || 100]} 
                    max={100} 
                    min={0} 
                    step={5}
                    onValueChange={([value]) => handleProbabilityChange(value)}
                    className="flex-grow"
                  />
                  <span className="text-sm text-zinc-300 w-10">
                    {pattern.tracks.find(t => t.id === selectedStep.trackId)?.steps[selectedStep.stepIndex].probability || 100}%
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Note Repeats</label>
                <div className="flex items-center gap-2">
                  <select 
                    className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1 text-sm text-zinc-300 flex-grow"
                    value={noteRepeats[`${selectedStep.trackId}-${selectedStep.stepIndex}`] || 1}
                    onChange={(e) => handleNoteRepeatChange(selectedStep.trackId, selectedStep.stepIndex, parseInt(e.target.value))}
                  >
                    <option value="1">None</option>
                    <option value="2">2 (Flam)</option>
                    <option value="3">3 (Triplet)</option>
                    <option value="4">4 (16th Roll)</option>
                    <option value="6">6 (Sextuplet)</option>
                    <option value="8">8 (32nd Roll)</option>
                  </select>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Repeats trigger the sample multiple times with decreasing velocity.
                </p>
              </div>
              
              <div className="flex items-end">
                <div className="flex items-center gap-2 mb-1">
                  <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-md flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white opacity-70" />
                    <span className="text-sm text-zinc-300">Active</span>
                  </div>
                  
                  <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-md">
                    <span className="text-sm text-zinc-300 opacity-70">1:1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SequencerGrid;