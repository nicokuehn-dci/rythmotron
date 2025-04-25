import * as React from "react"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export const Switch: React.FC<SwitchProps> = ({ 
  className = '',
  id,
  ...props 
}) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        {...props}
      />
      <div
        className={`
          h-5 w-9 rounded-full bg-zinc-700 
          peer-checked:bg-purple-600 
          after:absolute after:left-0.5 after:top-0.5 
          after:h-4 after:w-4 after:rounded-full after:bg-white 
          after:transition-all after:content-[''] 
          peer-checked:after:translate-x-4 
          peer-focus-visible:ring-2 peer-focus-visible:ring-purple-500/30
          cursor-pointer
          ${className}
        `}
      />
    </div>
  )
}