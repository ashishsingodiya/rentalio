import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, Calendar, PackageCheck, HelpCircle, User, LogOut, Menu, X, PlusCircle, List, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Browse", path: "/browse", icon: Search },
  { label: "Dashboard", path: "/owner/dashboard", icon: Search },
];

const dropdownItems = [
  { label: "Dashboard", path: "/owner/dashboard", icon: LayoutDashboard },
  { label: "My Listings", path: "/owner/listings", icon: List },
  { label: "Create Listing", path: "/owner/create", icon: PlusCircle },
  { label: "Visit Requests", path: "/owner/visits", icon: Calendar },
  { label: "Move-in Requests", path: "/owner/move-in", icon: PackageCheck },
];

const OwnerHeader = ({ user, logout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const username = user.name;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-350 px-8 mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>Rentalio Owner</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === item.path ? "text-primary" : "text-muted-foreground"}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Hi {username}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">My Account</DropdownMenuLabel>
              {dropdownItems.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className="flex items-center gap-2 cursor-pointer">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button onClick={logout} className="flex items-center gap-2 cursor-pointer text-destructive w-full text-left">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button className="md:hidden cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-1 animate-fade-in">
          {[...navItems, ...dropdownItems].map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${location.pathname === item.path ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`} onClick={() => setMobileOpen(false)}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="border-t border-border pt-2 mt-2">
            <button
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default OwnerHeader;
