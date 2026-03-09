import { useEffect, useState } from "react";
import { Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle2, XCircle, Home, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";
import { format } from "date-fns";
import { VisitScheduleModal } from "../../components/owner/VisitScheduleModal";
import VisitRejectConfirmation from "../../components/owner/VisitRejectConfirmation";

const STATUS_STYLES = {
  requested: "bg-blue-100 text-blue-700 border-blue-200",
  scheduled: "bg-green-100 text-green-700 border-green-200",
  visited: "bg-purple-100 text-purple-700 border-purple-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

const OwnerVisits = () => {
  const { axios, appLoading } = useAppContext();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [confirmRejectId, setConfirmRejectId] = useState(null);
  const [scheduleVisit, setScheduleVisit] = useState(null);
  const [markingVisitedId, setMarkingVisitedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (appLoading) return;
    const fetchVisits = async () => {
      try {
        const { data } = await axios.get("/api/visit/owner/visits");
        if (data.success) {
          setVisits(data.visits);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, [appLoading]);

  const handleReject = async () => {
    const id = confirmRejectId;
    setConfirmRejectId(null);
    setRejectingId(id);
    try {
      const { data } = await axios.post("/api/visit/reject", { visitId: id });
      if (data.success) {
        toast.success(data.message);
        setVisits((prev) => prev.map((v) => (v._id === id ? { ...v, status: "rejected" } : v)));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRejectingId(null);
    }
  };

  const handleScheduled = (visitId, slot) => {
    setVisits((prev) => prev.map((v) => (v._id === visitId ? { ...v, status: "scheduled", scheduledSlot: slot } : v)));
  };

  const handleMarkVisited = async (id) => {
    setMarkingVisitedId(id);
    try {
      const { data } = await axios.post("/api/visit/mark-visited", { visitId: id });
      if (data.success) {
        toast.success(data.message);
        setVisits((prev) => prev.map((v) => (v._id === id ? { ...v, status: "visited" } : v)));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setMarkingVisitedId(null);
    }
  };

  const filtered = filterStatus === "all" ? visits : visits.filter((v) => v.status === filterStatus);

  const visitToReject = visits.find((v) => v._id === confirmRejectId);

  if (loading || appLoading) return <Loading message="Loading Visit Requests" className="min-h-[90vh]"/>;

  const statusCounts = visits.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Reject Confirmation Modal */}
      {confirmRejectId && <VisitRejectConfirmation visitToReject={visitToReject} onClose={() => setConfirmRejectId(null)} onRejected={(id) => setVisits((prev) => prev.map((v) => (v._id === id ? { ...v, status: "rejected" } : v)))} />}

      {/* Schedule Modal */}
      {scheduleVisit && <VisitScheduleModal visit={scheduleVisit} onClose={() => setScheduleVisit(null)} onScheduled={handleScheduled} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Visit Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage visit requests from tenants for your listings</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total", key: "all", color: "bg-blue-100 text-blue-700" },
            { label: "Requested", key: "requested", color: "bg-amber-100 text-amber-700" },
            { label: "Scheduled", key: "scheduled", color: "bg-green-100 text-green-700" },
            { label: "Visited", key: "visited", color: "bg-purple-100 text-purple-700" },
            { label: "Rejected", key: "rejected", color: "bg-red-100 text-red-700" },
          ].map(({ label, key, color }) => (
            <button key={key} onClick={() => setFilterStatus(key)} className={`rounded-xl p-3 text-left border transition-all cursor-pointer ${filterStatus === key ? `${color} border-current font-semibold` : "bg-white border-gray-200 hover:border-gray-300"}`}>
              <p className="text-xl font-bold">{key === "all" ? visits.length : statusCounts[key] || 0}</p>
              <p className="text-xs mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-20 gap-3">
            <div className="bg-gray-100 rounded-full p-4">
              <Calendar className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No visit requests found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((visit) => {
              const canAct = ["requested", "scheduled"].includes(visit.status);
              const canMarkVisited = visit.status === "scheduled";
              return (
                <div key={visit._id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Property image */}
                  <div className="shrink-0">
                    {visit.listing?.gallery?.[0] ? (
                      <img src={visit.listing.gallery[0]} alt={visit.listing.title} className="w-full sm:w-28 h-20 object-cover rounded-xl" />
                    ) : (
                      <div className="w-full sm:w-28 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Home className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{visit.listing?.title || "Listing"}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {visit.listing?.location?.city}, {visit.listing?.location?.state}
                        </p>
                      </div>
                      <Badge className={`capitalize text-xs border ${STATUS_STYLES[visit.status] || ""}`} variant="outline">
                        {visit.status}
                      </Badge>
                    </div>

                    {/* Visitor details */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {visit.visitor?.name}
                      </span>
                      {visit.visitor?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {visit.visitor.email}
                        </span>
                      )}
                      {visit.visitor?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {visit.visitor.phone}
                        </span>
                      )}
                    </div>

                    {/* Slots & Message */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium text-gray-600">Tenant's requested slot:</span> {format(visit.requestedSlot, "dd MMM yyyy, hh:mm aa")}
                      </span>
                      {visit.scheduledSlot && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium text-gray-600">Scheduled slot:</span> {format(visit.scheduledSlot, "dd MMM yyyy, hh:mm aa")}
                        </span>
                      )}
                      {visit.message && <span className="italic">"{visit.message}"</span>}
                    </div>

                    {/* Actions */}
                    {canAct && (
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white cursor-pointer h-8 text-xs gap-1.5" onClick={() => setScheduleVisit(visit)}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Schedule
                        </Button>
                        {canMarkVisited && (
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer h-8 text-xs gap-1.5" disabled={markingVisitedId === visit._id} onClick={() => handleMarkVisited(visit._id)}>
                            <Eye className="w-3.5 h-3.5" />
                            {markingVisitedId === visit._id ? "Marking..." : "Mark as Visited"}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 cursor-pointer h-8 text-xs gap-1.5" disabled={rejectingId === visit._id} onClick={() => setConfirmRejectId(visit._id)}>
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerVisits;
