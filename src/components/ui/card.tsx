import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | '3d' | 'synthmodule';
  accent?: string; // Optional accent color for enhanced effects
  children: React.ReactNode;
}

export function Card({ 
  className = "",
  variant = 'default',
  accent,
  children,
  ...props 
}: CardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const variantClasses = {
    default: 'bg-white dark:bg-zinc-900',
    elevated: 'bg-white dark:bg-zinc-900',
    '3d': 'bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700',
    'synthmodule': 'synthmodule relative'
  };

  return (
    <div 
      className={`rounded-xl ${variantClasses[variant]} ${className}`} 
      onMouseEnter={() => variant === 'synthmodule' && setIsHovered(true)}
      onMouseLeave={() => variant === 'synthmodule' && setIsHovered(false)}
      style={{
        boxShadow: variant === 'elevated' 
          ? "0 8px 16px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1), inset 0 -1px 1px rgba(0, 0, 0, 0.05)" 
          : variant === '3d'
          ? "0 6px 16px rgba(0, 0, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 3px rgba(0, 0, 0, 0.3)"
          : variant === 'synthmodule' 
          ? isHovered 
            ? "7px 7px 20px rgba(0, 0, 0, 0.7), -3px -3px 10px rgba(60, 60, 60, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12)" 
            : "5px 5px 15px rgba(0, 0, 0, 0.6), -2px -2px 8px rgba(60, 60, 60, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          : "0 4px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
        background: variant === 'synthmodule' 
          ? "linear-gradient(145deg, #2a2a2a, #222222)"
          : variant === '3d'
          ? "linear-gradient(160deg, #2d2d2d, #212121)"
          : undefined,
        border: variant === 'synthmodule'
          ? `1px solid ${accent ? `rgba(${parseInt(accent.slice(1, 3), 16)}, ${parseInt(accent.slice(3, 5), 16)}, ${parseInt(accent.slice(5, 7), 16)}, 0.3)` : "rgba(70, 70, 70, 0.4)"}`
          : variant === '3d'
          ? "1px solid rgba(60, 60, 60, 0.5)"
          : undefined,
        transition: "all 0.25s ease-in-out",
        transform: variant === 'synthmodule' && isHovered ? 'translateY(-2px)' : undefined
      }}
      {...props}
    >
      {(variant === 'synthmodule' || variant === '3d') && (
        <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
          {/* Top highlight - enhanced */}
          <div 
            className="absolute inset-x-0 top-0 h-[2px]" 
            style={{ 
              background: `linear-gradient(to bottom, ${accent ? `${accent}25` : 'rgba(255, 255, 255, 0.15)'}, transparent)`,
              opacity: isHovered ? 0.8 : 0.6
            }} 
          />
          
          {/* Left highlight */}
          <div 
            className="absolute inset-y-0 left-0 w-[2px]" 
            style={{ 
              background: 'linear-gradient(to right, rgba(255, 255, 255, 0.08), transparent)',
              opacity: isHovered ? 0.7 : 0.5
            }} 
          />
          
          {/* Bottom shadow - enhanced */}
          <div 
            className="absolute inset-x-0 bottom-0 h-1" 
            style={{ 
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent)',
              opacity: isHovered ? 0.9 : 0.7
            }} 
          />
          
          {/* Right shadow */}
          <div 
            className="absolute inset-y-0 right-0 w-[2px]" 
            style={{ 
              background: 'linear-gradient(to left, rgba(0, 0, 0, 0.15), transparent)',
              opacity: isHovered ? 0.8 : 0.6
            }} 
          />
          
          {/* Corner accents for more dimensional feel */}
          <div 
            className="absolute top-0 left-0 w-4 h-4 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.1), transparent 70%)',
              borderTopLeftRadius: 'inherit'
            }}
          />
          
          <div 
            className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at bottom right, rgba(0, 0, 0, 0.2), transparent 70%)',
              borderBottomRightRadius: 'inherit'
            }}
          />
          
          {/* Accent glow effect when color is provided */}
          {accent && (
            <div 
              className="absolute inset-0 rounded-xl pointer-events-none transition-opacity"
              style={{
                boxShadow: `inset 0 0 15px ${accent}20`,
                opacity: isHovered ? 0.5 : 0.2
              }}
            />
          )}
          
          {/* Hover state enhancement */}
          {isHovered && (
            <div 
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${accent ? `${accent}10` : 'rgba(255, 255, 255, 0.03)'}, transparent 70%)`,
              }}
            />
          )}
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </div>
  )
}

// CardHeader component with enhanced 3D text effect
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
)

// CardTitle component with enhanced 3D text effect
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-tight text-3d ${className}`}
    style={{
      textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5), 0px -1px 1px rgba(255, 255, 255, 0.1)',
    }}
    {...props}
  >
    {children}
  </h3>
)

// CardDescription component
export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p
    className={`text-sm text-zinc-400 ${className}`}
    {...props}
  >
    {children}
  </p>
)

// CardContent component
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={`p-6 pt-0 ${className}`}
    {...props}
  >
    {children}
  </div>
)

// CardFooter component
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={`flex items-center p-6 pt-0 ${className}`}
    {...props}
  >
    {children}
  </div>
)