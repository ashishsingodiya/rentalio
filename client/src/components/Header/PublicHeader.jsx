import { Link, useLocation } from "react-router-dom";
import { Home, Search, User, LogIn, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const PublicHeader = () => {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-350 px-8 mx-auto h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>Rentalio</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === "/" ? "text-primary" : "text-muted-foreground"}`}>
            Home
          </Link>
          <Link to="/browse" className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === "/browse" ? "text-primary" : "text-muted-foreground"}`}>
            Browse
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <Link to="/login" className="flex items-center">
              <LogIn className="mr-2 h-4 w-4" />
              Log in
            </Link>
          </Button>
          <Button size="sm" className="cursor-pointer">
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
