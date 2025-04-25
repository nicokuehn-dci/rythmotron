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
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors
        ${isActive 
          ? 'bg-zinc-800 text-white' 
          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
        } ${className}`}
      onClick={() => context.onChange(value)}
    >
      {children}
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