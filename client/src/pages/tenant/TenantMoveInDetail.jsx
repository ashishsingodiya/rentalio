import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, MapPin, CheckCircle2, Upload, Trash2, FileText, ClipboardList, AlertCircle, ArrowLeft, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";

const STATUS_META = {
  awaiting_owner_setup: { label: "Awaiting Owner Setup", style: "bg-orange-100 text-orange-700 border-orange-200" },
  pending: { label: "Checklist Pending", style: "bg-blue-100 text-blue-700 border-blue-200" },
  ready: { label: "Ready for Review", style: "bg-green-100 text-green-700 border-green-200" },
  moved_in: { label: "Moved In", style: "bg-purple-100 text-purple-700 border-purple-200" },
};

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
  </div>
);

const TenantMoveInDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios, appLoading } = useAppContext();

  const [moveIn, setMoveIn] = useState(null);
  const [loading, setLoading] = useState(true);

  const [docLabel, setDocLabel] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const [confirmingAgreement, setConfirmingAgreement] = useState(false);
  const [confirmingInventory, setConfirmingInventory] = useState(false);
  const [removingDoc, setRemovingDoc] = useState(null);

  useEffect(() => {
    if (appLoading) return;
    fetchMoveIn();
  }, [appLoading, id]);

  const fetchMoveIn = async () => {
    try {
      const { data } = await axios.get(`/api/movein/${id}`);
      if (data.success) setMoveIn(data.moveIn);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDoc = async () => {
    if (!docFile || !docLabel.trim()) {
      toast.error("Please provide both a label and a file");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("moveInId", id);
      form.append("label", docLabel.trim());
      form.append("file", docFile);
      const { data } = await axios.post("/api/movein/tenant/documents", form);
      if (data.success) {
        toast.success("Document uploaded");
        setDocLabel("");
        setDocFile(null);
        if (fileRef.current) fileRef.current.value = "";
        fetchMoveIn();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDoc = async (fileUrl) => {
    setRemovingDoc(fileUrl);
    try {
      const { data } = await axios.post("/api/movein/tenant/documents/remove", { moveInId: id, fileUrl });
      if (data.success) {
        toast.success("Document removed");
        fetchMoveIn();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRemovingDoc(null);
    }
  };

  const handleConfirmAgreement = async () => {
    setConfirmingAgreement(true);
    try {
      const { data } = await axios.post("/api/movein/tenant/agreement", { moveInId: id });
      if (data.success) {
        toast.success("Agreement confirmed");
        fetchMoveIn();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setConfirmingAgreement(false);
    }
  };

  const handleConfirmInventory = async () => {
    setConfirmingInventory(true);
    try {
      const { data } = await axios.post("/api/movein/tenant/inventory/confirm", { moveInId: id });
      if (data.success) {
        toast.success("Inventory confirmed");
        fetchMoveIn();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setConfirmingInventory(false);
    }
  };

  if (loading || appLoading) return <Loading message="Loading Checklist" className="min-h-[90vh]"/>;
  if (!moveIn)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Move-in record not found.</p>
      </div>
    );

  const { checklist, status, listing, owner } = moveIn;
  const meta = STATUS_META[status] || STATUS_META.pending;
  const isLocked = status === "awaiting_owner_setup" || status === "moved_in";
  const isReadOnly = status === "ready" || status === "moved_in";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back + header */}
        <button onClick={() => navigate("/move-in")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 cursor-pointer transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Move-Ins
        </button>

        {/* Property card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 flex flex-col sm:flex-row gap-4 shadow-sm">
          {listing?.gallery?.[0] ? (
            <img src={listing.gallery[0]} alt={listing.title} className="w-full sm:w-32 h-24 object-cover rounded-xl shrink-0" />
          ) : (
            <div className="w-full sm:w-32 h-24 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <Home className="w-6 h-6 text-gray-300" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-gray-900">{listing?.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing?.location?.address}, {listing?.location?.city}
                </p>
              </div>
              <Badge className={`text-xs border ${meta.style}`} variant="outline">
                {meta.label}
              </Badge>
            </div>
            {owner && (
              <p className="text-xs text-gray-500 mt-2">
                Owner: <span className="font-medium text-gray-700">{owner.name}</span>
                {owner.phone && <> · {owner.phone}</>}
              </p>
            )}
          </div>
        </div>

        {/* Locked notice */}
        {status === "awaiting_owner_setup" && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-orange-700 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            The owner hasn't set up the inventory list yet. You'll be able to complete the checklist once they do.
          </div>
        )}

        {status === "ready" && <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700 mb-5">All checklist steps are complete. The owner will review and confirm your move-in shortly.</div>}

        {status === "moved_in" && <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-sm text-purple-700 mb-5">🎉 You have officially moved in! Welcome to your new home.</div>}

        <div className={`bg-white rounded-2xl border p-5 mb-4 shadow-sm ${isLocked ? "opacity-60" : "border-gray-200"}`}>
          <StepHeader number="1" title="Document Uploads" completed={checklist.documents.completed} locked={isLocked} />

          {checklist.documents.files.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              {checklist.documents.files.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-xs font-medium text-gray-700 truncate">{f.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    {!isReadOnly && (
                      <button onClick={() => handleRemoveDoc(f.url)} disabled={removingDoc === f.url} className="text-red-400 hover:text-red-600 cursor-pointer disabled:opacity-50">
                        {removingDoc === f.url ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isReadOnly && !isLocked && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input type="text" placeholder="Document label (e.g. Aadhaar, PAN)" value={docLabel} onChange={(e) => setDocLabel(e.target.value)} className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" />
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                className="text-xs text-gray-500 file:mr-2 file:text-xs file:border-0 file:bg-gray-100 file:rounded file:px-2 file:py-1 file:cursor-pointer"
              />
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer h-8 text-xs gap-1.5 shrink-0" disabled={uploading} onClick={handleUploadDoc}>
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload
              </Button>
            </div>
          )}

          {checklist.documents.files.length === 0 && (isReadOnly || isLocked) && <p className="text-xs text-gray-400">No documents uploaded.</p>}
        </div>

        <div className={`bg-white rounded-2xl border p-5 mb-4 shadow-sm ${isLocked ? "opacity-60" : "border-gray-200"}`}>
          <StepHeader number="2" title="Agreement Confirmation" completed={checklist.agreement.completed} locked={isLocked} />

          {checklist.agreement.text ? (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4 max-h-64 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{checklist.agreement.text}</pre>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-4">No agreement text provided by the owner.</p>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-4">
            {checklist.agreement.securityDeposit > 0 && (
              <span>
                Security Deposit: <strong>₹{checklist.agreement.securityDeposit.toLocaleString()}</strong>
              </span>
            )}
            {checklist.agreement.leaseDurationMonths > 0 && (
              <span>
                Lease Duration: <strong>{checklist.agreement.leaseDurationMonths} months</strong>
              </span>
            )}
          </div>

          {!checklist.agreement.completed && !isReadOnly && !isLocked && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white cursor-pointer h-8 text-xs gap-1.5" disabled={confirmingAgreement} onClick={handleConfirmAgreement}>
              {confirmingAgreement ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}I Agree & Confirm
            </Button>
          )}

          {checklist.agreement.confirmedAt && <p className="text-xs text-green-600 mt-2">Confirmed on {new Date(checklist.agreement.confirmedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
        </div>

        <div className={`bg-white rounded-2xl border p-5 shadow-sm ${isLocked ? "opacity-60" : "border-gray-200"}`}>
          <StepHeader number="3" title="Inventory Review" completed={checklist.inventory.completed} locked={isLocked} />

          {checklist.inventory.items.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-4">
              <ClipboardList className="w-4 h-4" />
              Owner hasn't added inventory items yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-4">
              {checklist.inventory.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <span className="text-xs font-medium text-gray-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    {item.notes && <span className="text-xs text-gray-400 italic hidden sm:inline">"{item.notes}"</span>}
                    <span className={`text-xs border rounded-full px-2 py-0.5 capitalize ${CONDITION_COLORS[item.condition] || ""}`}>{item.condition}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!checklist.inventory.completed && !isReadOnly && !isLocked && checklist.inventory.items.length > 0 && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white cursor-pointer h-8 text-xs gap-1.5" disabled={confirmingInventory} onClick={handleConfirmInventory}>
              {confirmingInventory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Confirm Inventory Condition
            </Button>
          )}

          {checklist.inventory.confirmedAt && <p className="text-xs text-green-600 mt-2">Confirmed on {new Date(checklist.inventory.confirmedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
        </div>
      </div>
    </div>
  );
};

export default TenantMoveInDetail;
