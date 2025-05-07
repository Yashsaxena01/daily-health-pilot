
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const PageContainer = ({ 
  children, 
  className,
  noPadding = false
}: PageContainerProps) => {
  return (
    <div 
      className={cn(
        "flex flex-col w-full min-h-[calc(100vh-64px)] pb-28",
        !noPadding && "px-4 py-6", 
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageContainer;
