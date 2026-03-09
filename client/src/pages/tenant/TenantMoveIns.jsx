import { useEffect, useState } from "react";
import { Home, MapPin, ArrowRight, PackageCheck, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";

const STATUS_META = {
  awaiting_owner_setup: {
    label: "Awaiting Owner",
    style: "bg-orange-100 text-orange-700 border-orange-200",
    description: "Waiting for the owner to set up the inventory checklist.",
  },
  pending: {
    label: "Checklist Pending",
    style: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Complete the 3-step checklist to proceed.",
  },
  ready: {
    label: "Ready for Review",
    style: "bg-green-100 text-green-700 border-green-200",
    description: "All steps done. Waiting for owner confirmation.",
  },
  moved_in: {
    label: "Moved In",
    style: "bg-purple-100 text-purple-700 border-purple-200",
    description: "You have officially moved in!",
  },
};

const ChecklistStep = ({ label, completed }) => (
  <span className={`flex items-center gap-1 text-xs ${completed ? "text-green-600" : "text-gray-400"}`}>
    {completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
    {label}
  </span>
);

const TenantMoveIns = () => {
  const { axios, appLoading } = useAppContext();
  const navigate = useNavigate();
  const [moveIns, setMoveIns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appLoading) return;
    const fetchMoveIns = async () => {
      try {
        const { data } = await axios.get("/api/movein/tenant");
        if (data.success) {
          setMoveIns(data.moveIns);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMoveIns();
  }, [appLoading]);

  if (loading || appLoading) return <Loading message="Loading Move-Ins" className="min-h-[90vh]"/>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Move-In Status</h1>
          <p className="text-sm text-gray-500 mt-1">Track your move-in process and complete the required checklist</p>
        </div>

        {moveIns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-20 gap-3">
            <div className="bg-gray-100 rounded-full p-4">
              <PackageCheck className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No move-in requests yet</p>
            <Button size="sm" variant="outline" className="cursor-pointer mt-1" onClick={() => navigate("/browse")}>
              Browse Properties
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {moveIns.map((moveIn) => {
              const meta = STATUS_META[moveIn.status] || STATUS_META.pending;
              const { documents, agreement, inventory } = moveIn.checklist;
              const stepsCompleted = [documents.completed, agreement.completed, inventory.completed].filter(Boolean).length;

              return (
                <div key={moveIn._id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="shrink-0 cursor-pointer" onClick={() => navigate(`/property/${moveIn.listing?._id}`)}>
                    {moveIn.listing?.gallery?.[0] ? (
                      <img src={moveIn.listing.gallery[0]} alt={moveIn.listing.title} className="w-full sm:w-28 h-20 object-cover rounded-xl" />
                    ) : (
                      <div className="w-full sm:w-28 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Home className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate(`/property/${moveIn.listing?._id}`)}>
                          {moveIn.listing?.title || "Property"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {moveIn.listing?.location?.city}, {moveIn.listing?.location?.state}
                        </p>
                      </div>
                      <Badge className={`capitalize text-xs border ${meta.style}`} variant="outline">
                        {meta.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">{meta.description}</p>

                    {moveIn.status !== "awaiting_owner_setup" && (
                      <div className="flex items-center gap-4 mb-3 flex-wrap">
                        <ChecklistStep label="Documents" completed={documents.completed} />
                        <ChecklistStep label="Agreement" completed={agreement.completed} />
                        <ChecklistStep label="Inventory" completed={inventory.completed} />
                        <span className="text-xs text-gray-400 ml-auto">{stepsCompleted}/3 steps</span>
                      </div>
                    )}

                    {moveIn.status === "awaiting_owner_setup" && (
                      <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5 mb-3 w-fit">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Owner needs to add the inventory list before you can proceed
                      </div>
                    )}

                    {moveIn.status === "moved_in" && moveIn.movedInAt && (
                      <p className="text-xs text-purple-600 bg-purple-50 border border-purple-100 rounded-lg px-3 py-1.5 mb-3 w-fit flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Moved in on {new Date(moveIn.movedInAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}

                    {moveIn.status !== "awaiting_owner_setup" && moveIn.status !== "moved_in" && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer h-8 text-xs gap-1.5" onClick={() => navigate(`/move-in/${moveIn._id}`)}>
                        {moveIn.status === "ready" ? "View Summary" : "Continue Checklist"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    {moveIn.status === "moved_in" && (
                      <Button size="sm" variant="outline" className="cursor-pointer h-8 text-xs gap-1.5" onClick={() => navigate(`/move-in/${moveIn._id}`)}>
                        View Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
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

export default TenantMoveIns;
