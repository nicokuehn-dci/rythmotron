# Rythmotron Farbpalette und Gradienten

## Waveform Chart Farben

### Linie
- Linienfarbe: `#4ade80` (Grün)
- Linienstärke: 2px

### Flächenfüllung (Area Style)
Linearer Gradient (top-to-bottom):
- Start (0%): `rgba(74, 222, 128, 0.5)` (Grün mit 50% Transparenz)
- Ende (100%): `rgba(74, 222, 128, 0.05)` (Grün mit 95% Transparenz)

```css
background: linear-gradient(to bottom, rgba(74, 222, 128, 0.5), rgba(74, 222, 128, 0.05));
```

## Spectrum Chart Farben

### Balken (Bars)
Linearer Gradient (top-to-bottom):
- Start (0%): `#a855f7` (Lila)
- Ende (100%): `#6366f1` (Indigo)

```css
background: linear-gradient(to bottom, #a855f7, #6366f1);
```

## 3D-Schatten-Effekte

### Standard Box-Shadow
```css
box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3),
            inset 0px 1px 0px rgba(255, 255, 255, 0.1);
```

### Eingesunkener Effekt (Inset)
```css
box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.5),
            inset -1px -1px 3px rgba(255, 255, 255, 0.05);
```

### Glow-Effekt
```css
box-shadow: 0 0 5px rgba(66, 220, 219, 0.7), 
            0 0 15px rgba(66, 220, 219, 0.5);
```

### Premium Button Glow
```css
box-shadow: 0 0 12px 1px var(--pad-glow-color, var(--accent-glow));
```

## Gradient-Hintergründe

### Gradient Metal
```css
background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
```

### Gradient Knob
```css
background: linear-gradient(145deg, #333, #222);
```

### Gradient LED (aktiv)
```css
background: linear-gradient(145deg, #42dcdb, #20a5a4);
```

### Gradient Panel
```css
background: linear-gradient(to bottom, #262626, #1c1c1c);
```

### Button Premium
```css
background: linear-gradient(145deg, #252525, #1d1d1d);
border: 1px solid rgba(80, 80, 80, 0.4);
```

### Button Vintage
```css
background: linear-gradient(145deg, #33301c, #292515);
border: 1px solid rgba(100, 90, 50, 0.4);
```