// src/components/ui/tabs.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ value, onValueChange, className, children }: TabsProps) {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function TabsTrigger({ value, onValueChange, className, children }: TabsTriggerProps) {
  const parent = React.useContext(TabsContext);
  const active = parent?.value === value;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        active ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-50",
        className
      )}
      onClick={() => {
        parent?.onValueChange?.(value);
        onValueChange?.(value);
      }}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange?: (value: string) => void;
} | null>(null);

export function TabsContent({ value, className, children }: TabsContentProps) {
  const parent = React.useContext(TabsContext);
  
  if (parent?.value !== value) {
    return null;
  }

  return (
    <div
      className={cn(
        "mt-2 focus-visible:outline-none",
        className
      )}
    >
      {children}
    </div>
  );
}