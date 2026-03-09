import { Loader2 } from "lucide-react";

const Loading = ({ 
  fullScreen = false, 
  message = "Loading...", 
  className = "" 
}) => {
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
};

export default Loading;