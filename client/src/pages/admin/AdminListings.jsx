import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Building2, CheckCircle, Clock, XCircle, FileText, ChevronDown, X, MapPin, BedDouble, Bath, Maximize2, Car, Wifi, AirVent, Dumbbell, Shield, Waves, Trees, Eye } from "lucide-react";

const STATUS_TABS = ["all", "review", "published", "rejected", "draft"];

const statusBadgeClass = (status) => {
  const map = {
    review: "text-yellow-600 border-yellow-300 bg-yellow-50",
    published: "text-green-600 border-green-300 bg-green-50",
    rejected: "text-red-600 border-red-300 bg-red-50",
    draft: "text-gray-600 border-gray-300 bg-gray-50",
  };
  return map[status] || "";
};

const tabLabel = (tab) => tab.charAt(0).toUpperCase() + tab.slice(1);

const amenityIcons = {
  WiFi: Wifi,
  Parking: Car,
  Gym: Dumbbell,
  Security: Shield,
  Pool: Waves,
  Garden: Trees,
  AC: AirVent,
};

const STATUS_ACTIONS = {
  review: ["published", "rejected"],
  published: ["rejected", "draft"],
  rejected: ["published", "draft"],
  draft: ["published", "rejected"],
};

const AdminListings = () => {
  const { axios, appLoading } = useContext(AppContext);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedListing, setSelectedListing] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      if (appLoading) return;
      try {
        const { data } = await axios.get("/api/listing/admin/all");
        if (data.success) setListings(data.listings);
        else toast.error(data.message);
      } catch {
        toast.error("Failed to load listings");
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [appLoading]);

  const updateStatus = async (listingId, status) => {
    setUpdatingId(listingId);
    try {
      const { data } = await axios.post("/api/listing/admin/status", { listingId, status });
      if (data.success) {
        setListings((prev) => prev.map((l) => (l._id === listingId ? { ...l, status } : l)));
        if (selectedListing?._id === listingId) setSelectedListing((prev) => ({ ...prev, status }));
        toast.success(`Status changed to ${status}`);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = activeTab === "all" ? listings : listings.filter((l) => l.status === activeTab);

  const stats = [
    { label: "Total", value: listings.length, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "In Review", value: listings.filter((l) => l.status === "review").length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Published", value: listings.filter((l) => l.status === "published").length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Rejected", value: listings.filter((l) => l.status === "rejected").length, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Draft", value: listings.filter((l) => l.status === "draft").length, icon: FileText, color: "text-gray-600", bg: "bg-gray-50" },
  ];

  if (loading || appLoading) return <Loading message="Loading Listings" className="min-h-[90vh]" />;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Listings</h1>
        <p className="text-muted-foreground text-sm mt-1">Review, publish, or reject property listings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
            {tabLabel(tab)} ({tab === "all" ? listings.length : listings.filter((l) => l.status === tab).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No listings in this category.</div>
      ) : (
        <div className="rounded-xl border bg-card divide-y">
          {filtered.map((listing) => (
            <div key={listing._id} className="flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors">
              <img src={listing.gallery?.[0]} alt={listing.title} className="h-14 w-20 object-cover rounded-lg bg-muted" />
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="font-medium text-sm truncate">{listing.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {listing.location?.city}, {listing.location?.state}
                </p>
                <p className="text-xs text-muted-foreground">
                  Owner: <span className="font-medium">{listing.owner?.name}</span>
                </p>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold">
                  ₹{listing.price?.toLocaleString()}
                  <span className="text-xs font-normal text-muted-foreground">/mo</span>
                </p>
                <p className="text-xs text-muted-foreground capitalize">{listing.specs?.propertyType}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs hidden md:inline-flex ${statusBadgeClass(listing.status)}`}>
                  {listing.status}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => setSelectedListing(listing)} className="gap-1.5 text-xs">
                  <Eye className="h-3.5 w-3.5" />
                  Details
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" disabled={updatingId === listing._id} className="gap-1 text-xs">
                      Status <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(STATUS_ACTIONS[listing.status] || []).map((s) => (
                      <DropdownMenuItem key={s} onClick={() => updateStatus(listing._id, s)} className="capitalize">
                        Mark as {s}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedListing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedListing(null)} />
          <div className="relative w-full max-w-lg bg-background shadow-xl overflow-y-auto flex flex-col">

            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-background z-10">
              <div>
                <h2 className="font-semibold text-base line-clamp-1">{selectedListing.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Listing Details</p>
              </div>
              <button onClick={() => setSelectedListing(null)} className="rounded-lg p-1.5 hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1">

              {selectedListing.gallery?.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedListing.gallery.slice(0, 6).map((img, i) => (
                    <img key={i} src={img} alt="" className="h-24 w-full object-cover rounded-lg bg-muted" />
                  ))}
                </div>
              )}


              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-sm px-3 py-1 ${statusBadgeClass(selectedListing.status)}`}>
                  {selectedListing.status}
                </Badge>
                <p className="text-lg font-bold">
                  ₹{selectedListing.price?.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
              </div>


              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {selectedListing.location?.address}
                </p>
                <p className="text-xs text-muted-foreground pl-5">
                  {selectedListing.location?.city}, {selectedListing.location?.state} {selectedListing.location?.zipCode}
                </p>
              </div>


              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Specifications</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: BedDouble, label: "Bedrooms", value: selectedListing.specs?.bedrooms },
                    { icon: Bath, label: "Bathrooms", value: selectedListing.specs?.bathrooms },
                    { icon: Maximize2, label: "Area", value: selectedListing.specs?.areaSqFt ? `${selectedListing.specs.areaSqFt} sq.ft` : "—" },
                    { icon: Building2, label: "Type", value: selectedListing.specs?.propertyType },
                    { icon: Car, label: "Parking", value: selectedListing.specs?.parking },
                    { icon: FileText, label: "Furnishing", value: selectedListing.specs?.furnishing },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2 rounded-lg border bg-card p-2.5">
                      <Icon className="h-4 w-4 text-muted-foreground " />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium capitalize truncate">{value ?? "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {selectedListing.amenities?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedListing.amenities.map((a) => {
                      const Icon = amenityIcons[a];
                      return (
                        <span key={a} className="flex items-center gap-1.5 text-xs border rounded-full px-2.5 py-1 bg-muted/50">
                          {Icon && <Icon className="h-3 w-3" />} {a}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}


              {selectedListing.rules?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Rules</p>
                  <ul className="space-y-1">
                    {selectedListing.rules.map((r, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 " />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}


              {selectedListing.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedListing.description}</p>
                </div>
              )}


              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Owner</p>
                <p className="text-sm font-medium">{selectedListing.owner?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedListing.owner?.email}</p>
              </div>

              <Separator />


              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Change Status</p>
                <div className="flex gap-2 flex-wrap">
                  {(STATUS_ACTIONS[selectedListing.status] || []).map((s) => (
                    <Button key={s} size="sm" variant={s === "published" ? "default" : s === "rejected" ? "destructive" : "outline"} disabled={updatingId === selectedListing._id} onClick={() => updateStatus(selectedListing._id, s)} className="capitalize">
                      Mark as {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminListings;
