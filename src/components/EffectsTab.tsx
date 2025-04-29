import React from 'react';
import EffectPanel from './EffectPanel';
import audioEngine from '../lib/services/AudioEngine';
import type { DelayParams, ReverbParams, DistortionParams } from '../lib/services/AudioEngine';

export const EffectsTab = () => {
  // Initialize state from AudioEngine's current parameters
  React.useEffect(() => {
    // Ensure audio engine is initialized
    if (!audioEngine.isInitialized) {
      audioEngine.initialize();
    }
  }, []);

  // Delay effect state and handlers
  const [delayParams, setDelayParams] = React.useState({
    mix: 0.3,
    time: 0.25,
    feedback: 0.3,
    filter: 0.7,
    bypass: true
  });

  // Reverb effect state and handlers 
  const [reverbParams, setReverbParams] = React.useState({
    mix: 0.2,
    size: 0.5,
    damping: 0.5,
    predelay: 0.02,
    bypass: true
  });

  // Distortion effect state and handlers
  const [distortionParams, setDistortionParams] = React.useState({
    mix: 0.2,
    drive: 0.5,
    tone: 0.5,
    character: 'soft' as const,
    bypass: true
  });

  // Immediately sync any parameter changes to the audio engine
  const handleDelayChange = (param: keyof DelayParams, value: number | boolean) => {
    const newParams = { ...delayParams, [param]: value };
    setDelayParams(newParams);
    audioEngine.setDelayParams({ ...newParams, type: 'delay' });
  };

  const handleReverbChange = (param: keyof ReverbParams, value: number | boolean) => {
    const newParams = { ...reverbParams, [param]: value };
    setReverbParams(newParams);
    audioEngine.setReverbParams({ ...newParams, type: 'reverb' });
  };

  const handleDistortionChange = (param: keyof DistortionParams, value: number | boolean | 'soft' | 'hard' | 'fold') => {
    const newParams = { ...distortionParams, [param]: value };
    setDistortionParams(newParams);
    audioEngine.setDistortionParams({ ...newParams, type: 'distortion' });
  };

  const handleDistortionCharacterChange = () => {
    const nextCharacter = distortionParams.character === 'soft' ? 'hard' : 
                         distortionParams.character === 'hard' ? 'fold' : 'soft';
    handleDistortionChange('character', nextCharacter);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Delay Effect */}
      <EffectPanel
        title="DELAY"
        color="#42dcdb"
        parameters={[
          { name: 'Time', value: delayParams.time * 1000, onChange: (v) => handleDelayChange('time', v / 1000), min: 0, max: 2000 },
          { name: 'Feedback', value: delayParams.feedback * 100, onChange: (v) => handleDelayChange('feedback', v / 100), min: 0, max: 100 },
          { name: 'Filter', value: delayParams.filter * 100, onChange: (v) => handleDelayChange('filter', v / 100), min: 0, max: 100 },
          { name: 'Mix', value: delayParams.mix * 100, onChange: (v) => handleDelayChange('mix', v / 100), min: 0, max: 100 }
        ]}
        toggles={[
          { id: 'bypass', label: 'Active', checked: !delayParams.bypass, onChange: () => handleDelayChange('bypass', !delayParams.bypass) }
        ]}
      />

      {/* Reverb Effect */}
      <EffectPanel
        title="REVERB"
        color="#9333ea"
        parameters={[
          { name: 'Size', value: reverbParams.size * 100, onChange: (v) => handleReverbChange('size', v / 100), min: 0, max: 100 },
          { name: 'Damping', value: reverbParams.damping * 100, onChange: (v) => handleReverbChange('damping', v / 100), min: 0, max: 100 },
          { name: 'Predelay', value: reverbParams.predelay * 1000, onChange: (v) => handleReverbChange('predelay', v / 1000), min: 0, max: 100 },
          { name: 'Mix', value: reverbParams.mix * 100, onChange: (v) => handleReverbChange('mix', v / 100), min: 0, max: 100 }
        ]}
        toggles={[
          { id: 'bypass', label: 'Active', checked: !reverbParams.bypass, onChange: () => handleReverbChange('bypass', !reverbParams.bypass) }
        ]}
      />

      {/* Distortion Effect */}
      <EffectPanel
        title="DISTORTION" 
        color="#dc2626"
        parameters={[
          { name: 'Drive', value: distortionParams.drive * 100, onChange: (v) => handleDistortionChange('drive', v / 100), min: 0, max: 100 },
          { name: 'Tone', value: distortionParams.tone * 100, onChange: (v) => handleDistortionChange('tone', v / 100), min: 0, max: 100 },
          { name: 'Mix', value: distortionParams.mix * 100, onChange: (v) => handleDistortionChange('mix', v / 100), min: 0, max: 100 }
        ]}
        toggles={[
          { id: 'bypass', label: 'Active', checked: !distortionParams.bypass, onChange: () => handleDistortionChange('bypass', !distortionParams.bypass) }
        ]}
        options={{
          name: 'Character',
          value: ['soft', 'hard', 'fold'],
          selected: distortionParams.character,
          onChange: handleDistortionCharacterChange
        }}
      />
    </div>
  );
};