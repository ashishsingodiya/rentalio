import { useEffect, useState } from "react";
import { Home, MapPin, PackageCheck, AlertCircle, CheckCircle2, Clock, ClipboardList, Plus, Trash2, ChevronDown, ChevronUp, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_META = {
  awaiting_owner_setup: { label: "Setup Required", style: "bg-orange-100 text-orange-700 border-orange-200" },
  pending: { label: "Checklist Pending", style: "bg-blue-100 text-blue-700 border-blue-200" },
  ready: { label: "Ready for Review", style: "bg-green-100 text-green-700 border-green-200" },
  moved_in: { label: "Moved In", style: "bg-purple-100 text-purple-700 border-purple-200" },
};

const CONDITION_OPTIONS = ["excellent", "good", "fair", "poor"];

const CONDITION_COLORS = {
  excellent: "text-green-600 bg-green-50 border-green-200",
  good: "text-blue-600 bg-blue-50 border-blue-200",
  fair: "text-yellow-600 bg-yellow-50 border-yellow-200",
  poor: "text-red-600 bg-red-50 border-red-200",
};

const ChecklistStep = ({ label, completed }) => (
  <span className={`flex items-center gap-1 text-xs ${completed ? "text-green-600" : "text-gray-400"}`}>
    {completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
    {label}
  </span>
);

const InventoryEditor = ({ moveIn, onSaved }) => {
  const { axios } = useAppContext();
  const [items, setItems] = useState(moveIn.checklist.inventory.items.length > 0 ? moveIn.checklist.inventory.items.map((i) => ({ ...i })) : [{ name: "", condition: "good", notes: "" }]);
  const [saving, setSaving] = useState(false);

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, { name: "", condition: "good", notes: "" }]);

  const removeItem = (idx) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const valid = items.filter((i) => i.name.trim());
    if (valid.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    setSaving(true);
    try {
      const { data } = await axios.post("/api/movein/owner/inventory", {
        moveInId: moveIn._id,
        items: valid,
      });
      if (data.success) {
        toast.success("Inventory saved & tenant checklist unlocked");
        onSaved(moveIn._id, valid);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <p className="text-xs font-medium text-gray-700 mb-3 flex items-center gap-1.5">
        <ClipboardList className="w-3.5 h-3.5" />
        Inventory Items
        <span className="text-gray-400 font-normal">: document the current condition of each item</span>
      </p>

      <div className="flex flex-col gap-2 mb-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-gray-50 border border-gray-100 rounded-xl p-2">
            <input type="text" placeholder="Item name (e.g. Sofa, AC, TV)" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 bg-white min-w-0" />
            <Select value={item.condition} onValueChange={(value) => updateItem(idx, "condition", value)}>
              <SelectTrigger className={`w-32 text-xs h-8 font-medium capitalize border rounded-lg ${CONDITION_COLORS[item.condition]}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs capitalize">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="text" placeholder="Notes (optional)" value={item.notes} onChange={(e) => updateItem(idx, "notes", e.target.value)} className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 bg-white min-w-0" />
            <button onClick={() => removeItem(idx)} disabled={items.length === 1} className="text-red-400 hover:text-red-600 cursor-pointer disabled:opacity-30 shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 cursor-pointer" onClick={addItem}>
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1.5 cursor-pointer" disabled={saving} onClick={handleSave}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Save & Unlock Checklist
        </Button>
      </div>
    </div>
  );
};


const OwnerMoveIns = () => {
  const { axios, user, navigate, appLoading } = useAppContext();
  const [moveIns, setMoveIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!appLoading && (!user || user.role !== "owner")) {
      navigate("/");
    }
  }, [user, appLoading]);

  useEffect(() => {
    if (appLoading) return;
    const fetchMoveIns = async () => {
      try {
        const { data } = await axios.get("/api/movein/owner");
        if (data.success) {
          setMoveIns(data.moveIns);
          const first = data.moveIns.find((m) => m.status === "awaiting_owner_setup");
          if (first) setExpandedId(first._id);
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

  const handleInventorySaved = (moveInId, items) => {
    setMoveIns((prev) => prev.map((m) => (m._id === moveInId ? { ...m, status: "pending", checklist: { ...m.checklist, inventory: { ...m.checklist.inventory, items } } } : m)));
    setExpandedId(null);
  };

  const handleConfirmMoveIn = async (id) => {
    setConfirmingId(id);
    try {
      const { data } = await axios.post("/api/movein/owner/confirm", { moveInId: id });
      if (data.success) {
        toast.success(data.message);
        setMoveIns((prev) => prev.map((m) => (m._id === id ? { ...m, status: "moved_in", movedInAt: new Date() } : m)));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading || appLoading) return <Loading message="Loading Move-Ins" className="min-h-[90vh]" />;

  const statusCounts = moveIns.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});

  const filtered = filterStatus === "all" ? moveIns : moveIns.filter((m) => m.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Move-In Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Add inventory, review checklists, and confirm tenants moving in</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", key: "all", color: "bg-blue-100 text-blue-700" },
            { label: "Setup Required", key: "awaiting_owner_setup", color: "bg-orange-100 text-orange-700" },
            { label: "Ready", key: "ready", color: "bg-green-100 text-green-700" },
            { label: "Moved In", key: "moved_in", color: "bg-purple-100 text-purple-700" },
          ].map(({ label, key, color }) => (
            <button key={key} onClick={() => setFilterStatus(key)} className={`rounded-xl p-3 text-left border transition-all cursor-pointer ${filterStatus === key ? `${color} border-current font-semibold` : "bg-white border-gray-200 hover:border-gray-300"}`}>
              <p className="text-xl font-bold">{key === "all" ? moveIns.length : statusCounts[key] || 0}</p>
              <p className="text-xs mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-20 gap-3">
            <div className="bg-gray-100 rounded-full p-4">
              <PackageCheck className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No move-in requests found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((moveIn) => {
              const meta = STATUS_META[moveIn.status] || STATUS_META.pending;
              const { documents, agreement, inventory } = moveIn.checklist;
              const isExpanded = expandedId === moveIn._id;
              const needsSetup = moveIn.status === "awaiting_owner_setup";
              const isReady = moveIn.status === "ready";

              return (
                <div key={moveIn._id} className={`bg-white rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${needsSetup ? "border-orange-200" : "border-gray-200"}`}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Property image */}
                    <div className="shrink-0">
                      {moveIn.listing?.gallery?.[0] ? (
                        <img src={moveIn.listing.gallery[0]} alt={moveIn.listing.title} className="w-full sm:w-28 h-20 object-cover rounded-xl" />
                      ) : (
                        <div className="w-full sm:w-28 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                          <Home className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{moveIn.listing?.title || "Property"}</h3>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {moveIn.listing?.location?.city}, {moveIn.listing?.location?.state}
                          </p>
                        </div>
                        <Badge className={`text-xs border ${meta.style} shrink-0`} variant="outline">
                          {meta.label}
                        </Badge>
                      </div>

                      {/* Tenant info */}
                      {moveIn.tenant && (
                        <p className="text-xs text-gray-500 mb-2">
                          Tenant: <span className="font-medium text-gray-700">{moveIn.tenant.name}</span>
                          {moveIn.tenant.phone && <> · {moveIn.tenant.phone}</>}
                          {moveIn.tenant.email && <> · {moveIn.tenant.email}</>}
                        </p>
                      )}

                      {/* Checklist progress (non-setup states) */}
                      {moveIn.status !== "awaiting_owner_setup" && (
                        <div className="flex items-center gap-4 flex-wrap mb-3">
                          <ChecklistStep label="Documents" completed={documents.completed} />
                          <ChecklistStep label="Agreement" completed={agreement.completed} />
                          <ChecklistStep label="Inventory" completed={inventory.completed} />
                          <span className="text-xs text-gray-400 ml-auto">{[documents.completed, agreement.completed, inventory.completed].filter(Boolean).length}/3 steps</span>
                        </div>
                      )}

                      {/* Setup required notice */}
                      {needsSetup && (
                        <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5 mb-3 w-fit">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          Add inventory items to unlock the tenant&apos;s checklist
                        </div>
                      )}

                      {/* Ready for review notice */}
                      {isReady && (
                        <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5 mb-3 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Tenant has completed all checklist steps
                        </div>
                      )}

                      {/* Moved in date */}
                      {moveIn.status === "moved_in" && moveIn.movedInAt && (
                        <p className="text-xs text-purple-600 bg-purple-50 border border-purple-100 rounded-lg px-3 py-1.5 mb-3 w-fit">Moved in on {new Date(moveIn.movedInAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {(needsSetup || moveIn.status === "pending") && (
                          <Button size="sm" variant={needsSetup ? "default" : "outline"} className={`h-8 text-xs gap-1.5 cursor-pointer ${needsSetup ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`} onClick={() => setExpandedId(isExpanded ? null : moveIn._id)}>
                            <ClipboardList className="w-3.5 h-3.5" />
                            {needsSetup ? "Add Inventory" : "Edit Inventory"}
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </Button>
                        )}

                        {isReady && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs gap-1.5 cursor-pointer" disabled={confirmingId === moveIn._id} onClick={() => handleConfirmMoveIn(moveIn._id)}>
                            {confirmingId === moveIn._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Confirm Move-In
                          </Button>
                        )}

                        {(moveIn.status === "ready" || moveIn.status === "moved_in" || moveIn.status === "pending") && (
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 cursor-pointer" onClick={() => navigate(`/owner/move-in/${moveIn._id}`)}>
                            View Details
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inline inventory editor */}
                  {isExpanded && <InventoryEditor moveIn={moveIn} onSaved={handleInventorySaved} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerMoveIns;
