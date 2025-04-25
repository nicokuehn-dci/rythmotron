import * as React from "react"

// TabsContext
interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

// Tabs component
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className = '',
}) => {
  const [value, setValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (!isControlled) {
      setValue(newValue);
    }
    onValueChange?.(newValue);
  }, [isControlled, onValueChange]);
  
  const contextValue = React.useMemo(() => ({
    value: isControlled ? controlledValue : value,
    onChange: handleValueChange,
  }), [isControlled, controlledValue, value, handleValueChange]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// TabsList component
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ 
  children,
  className = '',
}) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {children}
    </div>
  );
};

// TabsTrigger component
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className = '',
}) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const isActive = context.value === value;
  
  return (
    <button
      className={`px-3 py-2 text-sm font-medium rounded-md transition-all relative ${className}`}
      onClick={() => context.onChange(value)}
      style={{
        background: isActive 
          ? 'linear-gradient(145deg, #2a2a2a, #222222)' 
          : 'transparent',
        boxShadow: isActive
          ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -1px -1px 2px rgba(80, 80, 80, 0.2), 0 0 5px rgba(0, 0, 0, 0.3)'
          : 'none',
        border: isActive 
          ? '1px solid rgba(80, 80, 80, 0.6)' 
          : '1px solid transparent',
        color: isActive ? '#ffffff' : '#a1a1aa',
        textShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none',
        transform: isActive ? 'translateY(1px)' : 'none',
      }}
    >
      {/* Inner lighting effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-md">
        {/* Top reflection */}
        <div 
          className="absolute inset-x-0 top-0 h-1/4"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)',
            opacity: isActive ? 0.05 : 0
          }}
        />
        
        {/* Bottom shadow */}
        <div 
          className="absolute inset-x-0 bottom-0 h-1/4"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
            opacity: isActive ? 0.3 : 0
          }}
        />
      </div>
      
      {/* Content with 3D effect when active */}
      <span className={`relative z-10 ${isActive ? 'text-3d' : ''}`}>{children}</span>
    </button>
  );
};

// TabsContent component
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className = '',
}) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  const isActive = context.value === value;
  
  if (!isActive) return null;
  
  return (
    <div className={`mt-2 ${className}`}>
      {children}
    </div>
  );
};