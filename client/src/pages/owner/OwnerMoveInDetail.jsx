import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, MapPin, CheckCircle2, Clock, FileText, ClipboardList, AlertCircle, ArrowLeft, Loader2, Eye, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";

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

const StepHeader = ({ number, title, completed, locked }) => (
  <div className="flex items-center gap-3 mb-4">
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
        ${locked ? "bg-gray-100 text-gray-400" : completed ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
    >
      {completed ? <CheckCircle2 className="w-4 h-4" /> : number}
    </div>
    <h3 className={`font-semibold text-sm ${locked ? "text-gray-400" : "text-gray-900"}`}>{title}</h3>
    {completed && <span className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 ml-auto">Completed</span>}
    {locked && <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5 ml-auto">Locked</span>}
    {!completed && !locked && (
      <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 ml-auto flex items-center gap-1">
        <Clock className="w-3 h-3" /> Pending
      </span>
    )}
  </div>
);


const InventoryEditor = ({ moveIn, onSaved }) => {
  const { axios } = useAppContext();
  const [items, setItems] = useState(moveIn.checklist.inventory.items.length > 0 ? moveIn.checklist.inventory.items.map((i) => ({ name: i.name, condition: i.condition, notes: i.notes || "" })) : [{ name: "", condition: "good", notes: "" }]);
  const [saving, setSaving] = useState(false);

  const updateItem = (idx, field, value) => setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

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
        toast.success("Inventory saved");
        onSaved(valid, data.moveIn?.status);
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
    <div className="flex flex-col gap-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-gray-50 border border-gray-100 rounded-xl p-2">
          <input type="text" placeholder="Item name (e.g. Sofa, AC, TV)" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 bg-white min-w-0" />
          <select value={item.condition} onChange={(e) => updateItem(idx, "condition", e.target.value)} className={`text-xs border rounded-lg px-2 py-1.5 outline-none cursor-pointer font-medium capitalize ${CONDITION_COLORS[item.condition]}`}>
            {CONDITION_OPTIONS.map((c) => (
              <option key={c} value={c} className="text-gray-800 bg-white">
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <input type="text" placeholder="Notes (optional)" value={item.notes} onChange={(e) => updateItem(idx, "notes", e.target.value)} className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 bg-white min-w-0" />
          <button onClick={() => removeItem(idx)} disabled={items.length === 1} className="text-red-400 hover:text-red-600 cursor-pointer disabled:opacity-30 shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <div className="flex gap-2 flex-wrap mt-1">
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 cursor-pointer" onClick={addItem}>
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1.5 cursor-pointer" disabled={saving} onClick={handleSave}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Save Inventory
        </Button>
      </div>
    </div>
  );
};


const OwnerMoveInDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios, appLoading } = useAppContext();

  const [moveIn, setMoveIn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmingMoveIn, setConfirmingMoveIn] = useState(false);
  const [showInventoryEditor, setShowInventoryEditor] = useState(false);

  useEffect(() => {
    if (appLoading) return;
    fetchMoveIn();
  }, [appLoading, id]);

  const fetchMoveIn = async () => {
    try {
      const { data } = await axios.get(`/api/movein/${id}`);
      if (data.success) {
        setMoveIn(data.moveIn);
        // Auto-open editor if owner hasn't set inventory yet
        if (data.moveIn.status === "awaiting_owner_setup") {
          setShowInventoryEditor(true);
        }
      } else {
        toast.error(data.message);
        navigate("/owner/move-in");
      }
    } catch (error) {
      toast.error(error.message);
      navigate("/owner/move-in");
    } finally {
      setLoading(false);
    }
  };

  const handleInventorySaved = (items, newStatus) => {
    setMoveIn((prev) => ({
      ...prev,
      status: newStatus || prev.status,
      checklist: {
        ...prev.checklist,
        inventory: { ...prev.checklist.inventory, items },
      },
    }));
    setShowInventoryEditor(false);
  };

  const handleConfirmMoveIn = async () => {
    setConfirmingMoveIn(true);
    try {
      const { data } = await axios.post("/api/movein/owner/confirm", { moveInId: id });
      if (data.success) {
        toast.success(data.message);
        setMoveIn((prev) => ({ ...prev, status: "moved_in", movedInAt: new Date() }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setConfirmingMoveIn(false);
    }
  };

  if (loading || appLoading) return <Loading message="Loading Details" className="min-h-[90vh]"/>;
  if (!moveIn)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Move-in record not found.</p>
      </div>
    );

  const { checklist, status, listing, tenant } = moveIn;
  const meta = STATUS_META[status] || STATUS_META.pending;
  const needsSetup = status === "awaiting_owner_setup";
  const canEditInventory = status === "awaiting_owner_setup" || status === "pending";
  const isReady = status === "ready";
  const isMovedIn = status === "moved_in";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button onClick={() => navigate("/owner/move-in")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 cursor-pointer transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Move-Ins
        </button>

        {/* Property + tenant card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 flex flex-col sm:flex-row gap-4 shadow-sm">
          {listing?.gallery?.[0] ? (
            <img src={listing.gallery[0]} alt={listing.title} className="w-full sm:w-32 h-24 object-cover rounded-xl shrink-0" />
          ) : (
            <div className="w-full sm:w-32 h-24 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <Home className="w-6 h-6 text-gray-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
              <div>
                <h2 className="font-semibold text-gray-900">{listing?.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing?.location?.address}, {listing?.location?.city}
                </p>
              </div>
              <Badge className={`text-xs border ${meta.style} shrink-0`} variant="outline">
                {meta.label}
              </Badge>
            </div>
            {tenant && (
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-medium text-gray-700">Tenant:</span> {tenant.name}
                {tenant.email && <> · {tenant.email}</>}
                {tenant.phone && <> · {tenant.phone}</>}
              </div>
            )}
            {isMovedIn && moveIn.movedInAt && (
              <p className="text-xs text-purple-600 mt-1">
                Moved in on{" "}
                {new Date(moveIn.movedInAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Status banners */}
        {needsSetup && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-orange-700 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Add inventory items below to unlock the tenant&apos;s checklist.
          </div>
        )}
        {isReady && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Tenant has completed all checklist steps. Review and confirm their move-in.
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs gap-1.5 cursor-pointer shrink-0" disabled={confirmingMoveIn} onClick={handleConfirmMoveIn}>
              {confirmingMoveIn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Confirm Move-In
            </Button>
          </div>
        )}
        {isMovedIn && <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-sm text-purple-700 mb-5">This tenant has officially moved in. The listing is marked as rented.</div>}

        {/* ─── Step 1: Documents ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
          <StepHeader number="1" title="Documents Uploaded by Tenant" completed={checklist.documents.completed} locked={needsSetup} />

          {checklist.documents.files.length > 0 ? (
            <div className="flex flex-col gap-2">
              {checklist.documents.files.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-xs font-medium text-gray-700 truncate">{f.label}</span>
                    {f.uploadedAt && <span className="text-xs text-gray-400 shrink-0">· {new Date(f.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                  </div>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 shrink-0" title="View document">
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">{needsSetup ? "Tenant checklist is locked until inventory is set." : "No documents uploaded yet."}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
          <StepHeader number="2" title="Agreement Confirmation" completed={checklist.agreement.completed} locked={needsSetup} />

          {checklist.agreement.text ? (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-3 max-h-56 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{checklist.agreement.text}</pre>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-3">No agreement text was set for this listing.</p>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            {moveIn.checklist.agreement.securityDeposit != null && (
              <span>
                Security Deposit: <span className="font-medium text-gray-800">₹{moveIn.checklist.agreement.securityDeposit?.toLocaleString("en-IN")}</span>
              </span>
            )}
            {moveIn.checklist.agreement.leaseDurationMonths && (
              <span>
                Lease Duration: <span className="font-medium text-gray-800">{moveIn.checklist.agreement.leaseDurationMonths} months</span>
              </span>
            )}
            {checklist.agreement.confirmedAt && (
              <span>
                Confirmed by tenant on{" "}
                <span className="font-medium text-gray-800">
                  {new Date(checklist.agreement.confirmedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <StepHeader number="3" title="Inventory" completed={checklist.inventory.completed} locked={false} />
            {canEditInventory && (
              <button onClick={() => setShowInventoryEditor((v) => !v)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer shrink-0 -mt-4">
                <ClipboardList className="w-3.5 h-3.5" />
                {showInventoryEditor ? (
                  <>
                    Hide Editor <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Edit Inventory <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {checklist.inventory.items.length > 0 ? (
            <div className="flex flex-col gap-2 mb-4">
              {checklist.inventory.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <span className="text-xs font-medium text-gray-800 flex-1">{item.name}</span>
                  <span className={`text-xs border rounded-full px-2 py-0.5 capitalize font-medium ${CONDITION_COLORS[item.condition]}`}>{item.condition}</span>
                  {item.notes && <span className="text-xs text-gray-400 hidden sm:block truncate max-w-xs">{item.notes}</span>}
                </div>
              ))}
            </div>
          ) : (
            !showInventoryEditor && <p className="text-xs text-gray-400 mb-4">No inventory items added yet. Use the editor to add items.</p>
          )}

          {checklist.inventory.completed && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-3 w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tenant confirmed the inventory condition
            </div>
          )}

          {showInventoryEditor && canEditInventory && (
            <div className="border-t border-gray-100 pt-4 mt-2">
              <InventoryEditor moveIn={moveIn} onSaved={handleInventorySaved} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerMoveInDetail;
