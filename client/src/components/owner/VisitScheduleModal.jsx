import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Calendar, MapPin, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const VisitScheduleModal = ({ visit, onClose, onScheduled }) => {
  const { axios } = useAppContext();
  const [slot, setSlot] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!slot) return toast.error("Please pick a date & time");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/visit/schedule", {
        visitId: visit._id,
        scheduledSlot: slot,
      });
      if (data.success) {
        toast.success(data.message);
        onScheduled(visit._id, slot);
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 rounded-full p-2.5 shrink-0">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-base">Schedule Visit</h2>
            <p className="text-sm text-gray-500 mt-0.5">Set your preferred date & time</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl border px-4 py-3 text-sm text-gray-700">
          <p className="font-medium">{visit.listing?.title}</p>
          <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {visit.listing?.location?.city}, {visit.listing?.location?.state}
          </p>
          <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
            <User className="w-3 h-3" />
            {visit.visitor?.name}
          </p>

          <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {visit.message}
          </p>
          {visit.requestedSlot && (
            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Tenant requested: {new Date(visit.requestedSlot).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Confirm Visit Date & Time</label>
          <input type="datetime-local" min={minDateTime} value={slot} onChange={(e) => setSlot(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>
        <div className="flex gap-3 mt-1">
          <Button variant="outline" className="flex-1 cursor-pointer" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer" onClick={handleSubmit} disabled={loading}>
            {loading ? "Scheduling…" : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
};
