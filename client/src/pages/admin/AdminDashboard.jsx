import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import { Link } from "react-router-dom";
import { Building2, CheckCircle, HelpCircle, Clock, ChevronRight } from "lucide-react";
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
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter((t) => t.status === "in_progress").length;

  const stats = [
    { label: "Pending Review", value: reviewCount, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Published", value: publishedCount, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Open Tickets", value: openTickets, icon: HelpCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "In Progress", value: inProgressTickets, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  if (loading || appLoading) return <Loading message="Loading Dashboard" className="min-h-[90vh]" />;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of listings and support tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Needs Review */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold">Listings Needing Review</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/listings">View All</Link>
          </Button>
        </div>
        {listings.filter((l) => l.status === "review").length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-6">No listings pending review.</p>
        ) : (
          <div className="divide-y">
            {listings
              .filter((l) => l.status === "review")
              .slice(0, 5)
              .map((listing) => (
                <div key={listing._id} className="flex items-center gap-4 px-5 py-3">
                  <img src={listing.gallery?.[0]} alt={listing.title} className="h-12 w-16 object-cover rounded-lg  bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {listing.location?.city}, {listing.location?.state} · {listing.owner?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 text-xs">
                      Review
                    </Badge>
                    <Button size="sm" onClick={() => publishListing(listing._id)}>
                      Publish
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Open Tickets */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold">Open Support Tickets</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/tickets">View All</Link>
          </Button>
        </div>
        {tickets.filter((t) => t.status === "open" || t.status === "in_progress").length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-6">No open tickets.</p>
        ) : (
          <div className="divide-y">
            {tickets
              .filter((t) => t.status === "open" || t.status === "in_progress")
              .slice(0, 5)
              .map((ticket) => (
                <Link key={ticket._id} to={`/admin/tickets/${ticket._id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {ticket.category} · {ticket.user?.name || "User"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ">
                    <Badge variant="outline" className={ticket.status === "open" ? "text-red-600 border-red-300 bg-red-50 text-xs" : "text-blue-600 border-blue-300 bg-blue-50 text-xs"}>
                      {ticket.status === "in_progress" ? "In Progress" : "Open"}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
