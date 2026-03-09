import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";

const VisitRejectConfirmation = ({ visitToReject, onClose, onRejected }) => {
  const { axios } = useAppContext();
  const [isRejecting, setIsRejecting] = useState(false);

  const handleReject = async () => {
    const id = visitToReject._id;
    setIsRejecting(true);
    try {
      const { data } = await axios.post("/api/visit/reject", { visitId: id });
      if (data.success) {
        toast.success(data.message);
        onRejected(id);
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 rounded-full p-2.5 shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-base">Reject Visit Request</h2>
            <p className="text-sm text-gray-500 mt-0.5">This will notify the tenant.</p>
          </div>
        </div>
        {visitToReject && (
          <div className="bg-gray-50 rounded-xl border px-4 py-3 text-sm text-gray-700">
            <p className="font-medium">{visitToReject.listing?.title}</p>
            <p className="text-gray-500 text-xs mt-0.5">Requested by {visitToReject.visitor?.name}</p>
          </div>
        )}
        <p className="text-sm text-gray-600">Are you sure you want to reject this visit request?</p>
        <div className="flex gap-3 mt-1">
          <Button variant="outline" className="flex-1 cursor-pointer" onClick={onClose} disabled={isRejecting}>
            Cancel
          </Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={handleReject} disabled={isRejecting}>
            {isRejecting ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VisitRejectConfirmation;
