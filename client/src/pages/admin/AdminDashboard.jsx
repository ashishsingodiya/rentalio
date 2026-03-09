import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import { Link } from "react-router-dom";
import { Building2, CheckCircle, HelpCircle, Clock, ChevronRight, Star, Home, XCircle, FileText, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { axios, appLoading } = useContext(AppContext);
  const [listings, setListings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (appLoading) return;
      try {
        const [listingsRes, ticketsRes] = await Promise.all([axios.get("/api/listing/admin/all"), axios.get("/api/ticket/admin/all")]);
        if (listingsRes.data.success) setListings(listingsRes.data.listings);
        if (ticketsRes.data.success) setTickets(ticketsRes.data.tickets);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [appLoading]);

  const publishListing = async (listingId) => {
    try {
      const { data } = await axios.post("/api/listing/admin/status", { listingId, status: "published" });
      if (data.success) {
        setListings((prev) => prev.map((l) => (l._id === listingId ? { ...l, status: "published" } : l)));
        toast.success("Listing published");
      }
    } catch {
      toast.error("Failed to publish listing");
    }
  };

  const reviewCount = listings.filter((l) => l.status === "review").length;
  const publishedCount = listings.filter((l) => l.status === "published").length;
  const rentedCount = listings.filter((l) => l.status === "rented").length;
  const featuredCount = listings.filter((l) => l.isFeatured).length;
  const rejectedCount = listings.filter((l) => l.status === "rejected").length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;

  const listingStats = [
    { label: "Pending Review", value: reviewCount, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", to: "/admin/listings" },
    { label: "Published", value: publishedCount, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", to: "/admin/listings" },
    { label: "Rented Out", value: rentedCount, icon: Home, color: "text-purple-600", bg: "bg-purple-50", to: "/admin/listings" },
    { label: "Featured", value: featuredCount, icon: Star, color: "text-amber-600", bg: "bg-amber-50", to: "/admin/listings" },
    { label: "Rejected", value: rejectedCount, icon: XCircle, color: "text-red-600", bg: "bg-red-50", to: "/admin/listings" },
    { label: "Total Listings", value: listings.length, icon: Building2, color: "text-blue-600", bg: "bg-blue-50", to: "/admin/listings" },
  ];

  const ticketStats = [
    { label: "Open", value: openTickets, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "In Progress", value: inProgressTickets, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Resolved", value: resolvedTickets, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Tickets", value: tickets.length, icon: HelpCircle, color: "text-gray-600", bg: "bg-gray-50" },
  ];

  if (loading || appLoading) return <Loading message="Loading Dashboard" className="min-h-[90vh]" />;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of listings and support tickets</p>
        </div>
        <div className="flex gap-2 ">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/listings">Listings</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/tickets">Tickets</Link>
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Listings Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {listingStats.map((s) => (
            <Link key={s.label} to={s.to} className="rounded-xl border bg-card p-4 space-y-2 hover:bg-accent/30 transition-colors group">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Support Tickets</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ticketStats.map((s) => (
            <Link key={s.label} to="/admin/tickets" className="rounded-xl border bg-card p-4 space-y-2 hover:bg-accent/30 transition-colors">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <h2 className="font-semibold text-sm">Needs Review</h2>
              {reviewCount > 0 && <p className="text-xs text-muted-foreground mt-0.5">{reviewCount} listing{reviewCount > 1 ? "s" : ""} awaiting</p>}
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/listings">View All</Link>
            </Button>
          </div>
          {listings.filter((l) => l.status === "review").length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            <div className="">
              {listings
                .filter((l) => l.status === "review")
                .slice(0, 4)
                .map((listing) => (
                  <div key={listing._id} className="flex items-center gap-3 px-4 py-3">
                    <img src={listing.gallery?.[0]} alt={listing.title} className="h-10 w-14 object-cover rounded-md  bg-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{listing.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {listing.location?.city} · {listing.owner?.name}
                      </p>
                    </div>
                    <Button size="sm" className=" text-xs h-7 px-2.5" onClick={() => publishListing(listing._id)}>
                      Publish
                    </Button>
                  </div>
                ))}
              {reviewCount > 4 && (
                <Link to="/admin/listings" className="flex items-center justify-center py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors gap-1">
                  +{reviewCount - 4} more <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}
        </div>


        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <h2 className="font-semibold text-sm">Open Tickets</h2>
              {(openTickets + inProgressTickets) > 0 && <p className="text-xs text-muted-foreground mt-0.5">{openTickets + inProgressTickets} ticket{openTickets + inProgressTickets > 1 ? "s" : ""} active</p>}
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/tickets">View All</Link>
            </Button>
          </div>
          {tickets.filter((t) => t.status === "open" || t.status === "in_progress").length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm text-muted-foreground">No open tickets!</p>
            </div>
          ) : (
            <div className="">
              {tickets
                .filter((t) => t.status === "open" || t.status === "in_progress")
                .slice(0, 4)
                .map((ticket) => (
                  <Link key={ticket._id} to={`/admin/tickets/${ticket._id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground capitalize truncate">
                        {ticket.category} · {ticket.user?.name || "User"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 ">
                      <Badge variant="outline" className={ticket.status === "open" ? "text-red-600 border-red-300 bg-red-50 text-xs" : "text-blue-600 border-blue-300 bg-blue-50 text-xs"}>
                        {ticket.status === "in_progress" ? "In Progress" : "Open"}
                      </Badge>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              {(openTickets + inProgressTickets) > 4 && (
                <Link to="/admin/tickets" className="flex items-center justify-center py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors gap-1">
                  +{(openTickets + inProgressTickets) - 4} more <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {featuredCount > 0 && (
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <h2 className="font-semibold text-sm">Featured Listings</h2>
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs">{featuredCount}</Badge>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/listings">Manage</Link>
            </Button>
          </div>
          <div className="">
            {listings
              .filter((l) => l.isFeatured)
              .slice(0, 4)
              .map((listing) => (
                <div key={listing._id} className="flex items-center gap-3 px-4 py-3">
                  <img src={listing.gallery?.[0]} alt={listing.title} className="h-10 w-14 object-cover rounded-md  bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {listing.location?.city}, {listing.location?.state}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ">
                    <Badge variant="outline" className={`text-xs capitalize ${listing.status === "published" ? "text-green-600 border-green-300 bg-green-50" : listing.status === "rented" ? "text-purple-600 border-purple-300 bg-purple-50" : ""}`}>
                      {listing.status}
                    </Badge>
                    <p className="text-sm font-semibold hidden sm:block">₹{listing.price?.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;