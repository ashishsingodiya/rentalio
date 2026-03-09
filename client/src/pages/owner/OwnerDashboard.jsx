import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, List, PlusCircle, Calendar, Home, CheckCircle2, XCircle, Clock, MapPin, User, ChevronRight, PackageCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";
import { format } from "date-fns";
import { VisitScheduleModal } from "../../components/owner/VisitScheduleModal";
import VisitRejectConfirmation from "../../components/owner/VisitRejectConfirmation";

const LISTING_STATUS_STYLES = {
  published: "bg-green-100 text-green-700 border-green-200",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  review: "bg-yellow-100 text-yellow-700 border-yellow-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const OwnerDashboard = () => {
  const { axios, user, appLoading } = useAppContext();
  const [listings, setListings] = useState([]);
  const [visits, setVisits] = useState([]);
  const [moveIns, setMoveIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleVisit, setScheduleVisit] = useState(null);
  const [confirmRejectId, setConfirmRejectId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    if (appLoading) return;
    const fetchAll = async () => {
      try {
        const [listingRes, visitRes, moveInRes] = await Promise.all([axios.get("/api/listing/owner/listings"), axios.get("/api/visit/owner/visits"), axios.get("/api/movein/owner")]);
        if (listingRes.data.success) setListings(listingRes.data.listings);
        if (visitRes.data.success) setVisits(visitRes.data.visits);
        if (moveInRes.data.success) setMoveIns(moveInRes.data.moveIns);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [appLoading]);

  const handleScheduled = (visitId, slot) => {
    setVisits((prev) => prev.map((v) => (v._id === visitId ? { ...v, status: "scheduled", scheduledSlot: slot } : v)));
  };

  if (loading || appLoading) return <Loading message="Loading Dashboard" className="min-h-[90vh]"/>

  // Stats
  const totalListings = listings.length;
  const publishedCount = listings.filter((l) => l.status === "published").length;
  const draftCount = listings.filter((l) => l.status === "draft").length;
  const reviewCount = listings.filter((l) => l.status === "review").length;
  const pendingVisits = visits.filter((v) => v.status === "requested").length;
  const scheduledVisits = visits.filter((v) => v.status === "scheduled").length;
  const setupNeededCount = moveIns.filter((m) => m.status === "awaiting_owner_setup").length;
  const readyToConfirmCount = moveIns.filter((m) => m.status === "ready").length;
  const movedInCount = moveIns.filter((m) => m.status === "moved_in").length;
  const actionableMoveIns = moveIns
    .filter((m) => m.status === "awaiting_owner_setup" || m.status === "ready")
    .sort((a, b) => (a.status === "ready" ? -1 : 1))
    .slice(0, 4);

  const recentPendingVisits = visits.filter((v) => v.status === "requested").slice(0, 4);
  const recentListings = listings.slice(0, 4);

  const visitToReject = visits.find((v) => v._id === confirmRejectId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Reject Confirmation Modal */}
      {confirmRejectId && <VisitRejectConfirmation visitToReject={visitToReject} onClose={() => setConfirmRejectId(null)} onRejected={(id) => setVisits((prev) => prev.map((v) => (v._id === id ? { ...v, status: "rejected" } : v)))} />}

      {/* Schedule Modal */}
      {scheduleVisit && <VisitScheduleModal visit={scheduleVisit} onClose={() => setScheduleVisit(null)} onScheduled={handleScheduled} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening with your properties today.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            {
              label: "Total Listings",
              value: totalListings,
              icon: <List className="w-5 h-5 text-indigo-600" />,
              bg: "bg-indigo-50",
              link: "/owner/listings",
            },
            {
              label: "Published",
              value: publishedCount,
              icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
              bg: "bg-green-50",
              link: "/owner/listings",
            },
            {
              label: "Pending Visits",
              value: pendingVisits,
              icon: <Clock className="w-5 h-5 text-blue-600" />,
              bg: "bg-blue-50",
              link: "/owner/visits",
            },
            {
              label: "Scheduled Visits",
              value: scheduledVisits,
              icon: <Calendar className="w-5 h-5 text-orange-600" />,
              bg: "bg-orange-50",
              link: "/owner/visits",
            },
            {
              label: "Setup Required",
              value: setupNeededCount,
              icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
              bg: "bg-orange-50",
              link: "/owner/move-in",
            },
            {
              label: "Ready to Confirm",
              value: readyToConfirmCount,
              icon: <PackageCheck className="w-5 h-5 text-purple-600" />,
              bg: "bg-purple-50",
              link: "/owner/move-in",
            },
          ].map(({ label, value, icon, bg, link }) => (
            <Link key={label} to={link} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`${bg} rounded-xl p-3 shrink-0`}>{icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link to="/owner/create">
            <Button className="gap-2 cursor-pointer">
              <PlusCircle className="w-4 h-4" />
              Create Listing
            </Button>
          </Link>
          <Link to="/owner/listings">
            <Button variant="outline" className="gap-2 cursor-pointer">
              <List className="w-4 h-4" />
              Manage Listings
            </Button>
          </Link>
          <Link to="/owner/visits">
            <Button variant="outline" className="gap-2 cursor-pointer">
              <Calendar className="w-4 h-4" />
              All Visit Requests
            </Button>
          </Link>
          <Link to="/owner/move-in">
            <Button variant="outline" className="gap-2 cursor-pointer">
              <PackageCheck className="w-4 h-4" />
              Move-In Requests
              {setupNeededCount + readyToConfirmCount > 0 && <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{setupNeededCount + readyToConfirmCount}</span>}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Visit Requests */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Pending Visit Requests
                {pendingVisits > 0 && <span className="ml-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{pendingVisits}</span>}
              </h2>
              <Link to="/owner/visits" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {recentPendingVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Calendar className="w-7 h-7 text-gray-300" />
                <p className="text-sm text-gray-400">No pending visit requests</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentPendingVisits.map((visit) => (
                  <div key={visit._id} className="px-5 py-4 flex items-start gap-3">
                    {visit.listing?.gallery?.[0] ? (
                      <img src={visit.listing.gallery[0]} alt="" className="w-12 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{visit.listing?.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {visit.visitor?.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(visit.requestedSlot, "dd MMM yyyy, hh:mm aa")}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-2.5 cursor-pointer" onClick={() => setScheduleVisit(visit)}>
                        <CheckCircle2 className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50 h-7 text-xs px-2.5 cursor-pointer" disabled={rejectingId === visit._id} onClick={() => setConfirmRejectId(visit._id)}>
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Home className="w-4 h-4 text-indigo-500" />
                Recent Listings
              </h2>
              <Link to="/owner/listings" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {recentListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Home className="w-7 h-7 text-gray-300" />
                <p className="text-sm text-gray-400">No listings yet</p>
                <Link to="/owner/create">
                  <Button size="sm" className="mt-2 gap-1.5 cursor-pointer">
                    <PlusCircle className="w-3.5 h-3.5" />
                    Create Listing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentListings.map((listing) => (
                  <div key={listing._id} className="px-5 py-4 flex items-center gap-3">
                    {listing.gallery?.[0] ? (
                      <img src={listing.gallery[0]} alt="" className="w-12 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.location?.city}, {listing.location?.state}
                      </p>
                    </div>
                    <Badge className={`capitalize text-xs border ${LISTING_STATUS_STYLES[listing.status] || ""}`} variant="outline">
                      {listing.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {actionableMoveIns.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-orange-500" />
                Move-Ins Needing Attention
                <span className="ml-1 bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">{actionableMoveIns.length}</span>
              </h2>
              <Link to="/owner/move-in" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {actionableMoveIns.map((m) => (
                <Link key={m._id} to={`/owner/move-in/${m._id}`} className="px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  {m.listing?.gallery?.[0] ? (
                    <img src={m.listing.gallery[0]} alt="" className="w-12 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Home className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.listing?.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {m.tenant?.name}
                    </p>
                  </div>
                  {m.status === "ready" ? (
                    <span className="text-xs bg-green-100 text-green-700 border border-green-200 rounded-full px-2 py-0.5 shrink-0">Ready to Confirm</span>
                  ) : (
                    <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 rounded-full px-2 py-0.5 shrink-0">Setup Required</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {moveIns.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-gray-500" />
              Move-In Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total", count: moveIns.length, style: "bg-gray-50 text-gray-700" },
                { label: "Setup Required", count: setupNeededCount, style: "bg-orange-50 text-orange-700" },
                { label: "Ready", count: readyToConfirmCount, style: "bg-green-50 text-green-700" },
                { label: "Moved In", count: movedInCount, style: "bg-purple-50 text-purple-700" },
              ].map(({ label, count, style }) => (
                <Link key={label} to="/owner/move-in" className={`rounded-xl px-4 py-3 ${style} hover:opacity-80 transition-opacity`}>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs mt-0.5">{label}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {totalListings > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-gray-500" />
              Listings by Status
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Published", count: publishedCount, style: "bg-green-50 text-green-700" },
                { label: "Under Review", count: reviewCount, style: "bg-yellow-50 text-yellow-700" },
                { label: "Draft", count: draftCount, style: "bg-gray-50 text-gray-600" },
                {
                  label: "Rejected",
                  count: listings.filter((l) => l.status === "rejected").length,
                  style: "bg-red-50 text-red-600",
                },
              ].map(({ label, count, style }) => (
                <div key={label} className={`rounded-xl px-4 py-3 ${style}`}>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
