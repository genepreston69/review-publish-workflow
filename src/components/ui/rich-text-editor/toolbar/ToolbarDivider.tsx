
interface ToolbarDividerProps {
  className?: string;
}

export function ToolbarDivider({ className = "w-px h-6 bg-gray-300 mx-1" }: ToolbarDividerProps) {
  return <div className={className} />;
}
