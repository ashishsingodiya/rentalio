import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Home, XCircle, AlertTriangle, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const STATUS_STYLES = {
  requested: "bg-blue-100 text-blue-700 border-blue-200",
  scheduled: "bg-green-100 text-green-700 border-green-200",
  visited: "bg-purple-100 text-purple-700 border-purple-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

const TenantVisits = () => {
  const { axios, appLoading } = useAppContext();
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [submittingDecision, setSubmittingDecision] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (appLoading) return;
    const fetchVisits = async () => {
      try {
        const { data } = await axios.get("/api/visit/tenant/visits");
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

  const handleCancel = async (id) => {
    setConfirmCancelId(null);
    setCancellingId(id);
    try {
      const { data } = await axios.post("/api/visit/cancel", { visitId: id });
      if (data.success) {
        toast.success(data.message);
        setVisits((prev) => prev.map((v) => (v._id === id ? { ...v, status: "cancelled" } : v)));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleDecision = async (visitId, outcome) => {
    setSubmittingDecision(visitId);
    try {
      const { data } = await axios.post("/api/visit/decision", { visitId, outcome });
      if (data.success) {
        toast.success(data.message);

        //react ki state update
        setVisits((prev) =>
          prev.map((v) => {
            if (v._id !== visitId) return v;
            return { ...v, decision: { ...v.decision, outcome } };
          })
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmittingDecision(null);
    }
  };

  const filtered = filterStatus === "all" ? visits : visits.filter((v) => v.status === filterStatus);

  if (loading || appLoading) return <Loading message="Loading Your Visits" className="min-h-[90vh]" />;

  const statusCounts = visits.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cancel Confirmation Modal */}
      {confirmCancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 rounded-full p-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Cancel Visit?</h2>
                <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl border px-4 py-3 text-sm text-gray-700">
              <p className="font-medium">{visits.find((v) => v._id === confirmCancelId)?.listing?.title}</p>
              <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {visits.find((v) => v._id === confirmCancelId)?.listing?.location?.address}, {visits.find((v) => v._id === confirmCancelId)?.listing?.location?.city}, {visits.find((v) => v._id === confirmCancelId)?.listing?.location?.state}
              </p>
            </div>
            <p className="text-sm text-gray-500">Are you sure you want to cancel this visit.</p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setConfirmCancelId(null)}>
                Keep it
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={() => handleCancel(confirmCancelId)}>
                Cancel Visit
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Visits</h1>
          <p className="text-sm text-gray-500 mt-1">Track the status of your property visit requests</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total", key: "all", color: "bg-blue-100 text-blue-700" },
            { label: "Requested", key: "requested", color: "bg-amber-100 text-amber-700" },
            { label: "Scheduled", key: "scheduled", color: "bg-green-100 text-green-700" },
            { label: "Visited", key: "visited", color: "bg-purple-100 text-purple-700" },
            { label: "Cancelled", key: "cancelled", color: "bg-red-100 text-red-700" },
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
            <p className="text-gray-500 text-sm">No visits found</p>
            <Button size="sm" variant="outline" className="cursor-pointer mt-1" onClick={() => navigate("/browse")}>
              Browse Properties
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((visit) => {
              const canCancel = ["requested", "scheduled"].includes(visit.status);
              const canDecide = visit.status === "visited" && visit.decision?.outcome === "pending";
              const moveInInProgress = visit.decision?.outcome === "move_in" && !visit.decision?.hasMovedIn;
              const hasMovedIn = visit.decision?.hasMovedIn === true;
              return (
                <div key={visit._id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Property image */}
                  <div className="shrink-0 cursor-pointer" onClick={() => navigate(`/property/${visit.listing?._id}`)}>
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
                        <h3 className="font-semibold text-gray-900 text-sm hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate(`/property/${visit.listing?._id}`)}>
                          {visit.listing?.title || "Listing"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {visit.listing?.location?.city}, {visit.listing?.location?.state}
                        </p>
                      </div>
                      <Badge className={`capitalize text-xs border ${STATUS_STYLES[visit.status] || ""}`} variant="outline">
                        {visit.status}
                      </Badge>
                    </div>

                    {/* Slots & Message */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium text-gray-600">Requested slot:</span> {format(new Date(visit.requestedSlot), "dd MMM yyyy, hh:mm aa")}
                      </span>
                      {visit.scheduledSlot && (
                        <span className="flex items-center gap-1 text-green-700">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">Confirmed slot:</span> {format(new Date(visit.scheduledSlot), "dd MMM yyyy, hh:mm aa")}
                        </span>
                      )}
                      {visit.message && <span className="italic text-gray-400">"{visit.message}"</span>}
                    </div>

                    {visit.status === "scheduled" && <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-1.5 mb-3 border border-green-100 w-fit">Your visit has been confirmed by the owner. Please arrive on time.</p>}
                    {visit.status === "rejected" && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5 mb-3 border border-red-100 w-fit">This visit request was declined by the owner.</p>}
                    {visit.status === "visited" && visit.decision?.outcome === "not_interested" && <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5 mb-3 border border-gray-100 w-fit">You marked this property as not interested.</p>}

                    {canDecide && (
                      <div className="mb-3 p-3 bg-purple-50 border border-purple-100 rounded-xl">
                        <p className="text-xs font-medium text-purple-800 mb-2">You visited this property. Would you like to move in?</p>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white cursor-pointer h-8 text-xs gap-1.5" disabled={submittingDecision === visit._id} onClick={() => handleDecision(visit._id, "move_in")}>
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Yes, Move In
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer h-8 text-xs gap-1.5" disabled={submittingDecision === visit._id} onClick={() => handleDecision(visit._id, "not_interested")}>
                            <ThumbsDown className="w-3.5 h-3.5" />
                            Not Interested
                          </Button>
                        </div>
                      </div>
                    )}

                    {moveInInProgress && (
                      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-yellow-800">Move-in process started</p>
                          <p className="text-xs text-yellow-600 mt-0.5">Complete your checklist to finalise the move-in</p>
                        </div>
                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer h-8 text-xs gap-1.5 shrink-0" onClick={() => navigate("/move-in")}>
                          View Status
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}

                    {hasMovedIn && (
                      <div className="mb-3 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-green-800">Successfully moved in</p>
                          <p className="text-xs text-green-600 mt-0.5">You are currently living in this property</p>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white cursor-pointer h-8 text-xs gap-1.5 shrink-0" onClick={() => navigate("/move-in")}>
                          View Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}

                    {/* Actions */}
                    {canCancel && (
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 cursor-pointer h-8 text-xs gap-1.5" disabled={cancellingId === visit._id} onClick={() => setConfirmCancelId(visit._id)}>
                          <XCircle className="w-3.5 h-3.5" />
                          {cancellingId === visit._id ? "Cancelling..." : "Cancel Visit"}
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

export default TenantVisits;
