import * as React from "react"

// TooltipContext for state management
const TooltipContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  open: false,
  setOpen: () => {},
});

// TooltipProvider
export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      {children}
    </TooltipContext.Provider>
  );
};

// TooltipTrigger
export const TooltipTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => {
  const { setOpen } = React.useContext(TooltipContext);
  return (
    <button
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      {...props}
    >
      {children}
    </button>
  );
};

// TooltipContent
interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const TooltipContent: React.FC<TooltipContentProps> = ({
  children,
  className = '',
  side = 'top',
  ...props
}) => {
  const { open } = React.useContext(TooltipContext);
  
  if (!open) return null;
  
  const positions = {
    top: 'bottom-full mb-2',
    right: 'left-full ml-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
  };
  
  return (
    <div
      className={`absolute z-50 max-w-xs px-3 py-1.5 text-xs text-white bg-zinc-700 rounded-md ${positions[side]} ${className}`}
      {...props}
    >
      {children}
      <div className={`
        absolute w-2 h-2 rotate-45 bg-zinc-700 
        ${side === 'top' ? 'top-full -translate-x-1/2 left-1/2 -mt-1' : ''}
        ${side === 'right' ? 'right-full -translate-y-1/2 top-1/2 -mr-1' : ''}
        ${side === 'bottom' ? 'bottom-full -translate-x-1/2 left-1/2 -mb-1' : ''}
        ${side === 'left' ? 'left-full -translate-y-1/2 top-1/2 -ml-1' : ''}
      `}></div>
    </div>
  );
};

// Main Tooltip component
interface TooltipProps {
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  return (
    <TooltipProvider>
      <div className="relative inline-flex">
        {children}
      </div>
    </TooltipProvider>
  );
};