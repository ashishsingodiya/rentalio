import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "../../context/AppContext";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];

const statusBadgeClass = (status) => {
  const map = {
    open: "text-red-600 border-red-300 bg-red-50",
    in_progress: "text-blue-600 border-blue-300 bg-blue-50",
    resolved: "text-green-600 border-green-300 bg-green-50",
    closed: "text-gray-600 border-gray-300 bg-gray-50",
  };
  return map[status] || "";
};

const statusLabel = (status) => (status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1));

const AdminTicketDetail = () => {
  const { axios, appLoading } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (appLoading) return;
      try {
        const { data } = await axios.get(`/api/ticket/admin/${id}`);
        if (data.success) setTicket(data.ticket);
        else toast.error(data.message);
      } catch {
        toast.error("Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id, appLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const { data } = await axios.post("/api/ticket/admin/reply", {
        ticketId: id,
        content: reply.trim(),
      });
      if (data.success) {
        setTicket((prev) => ({ ...prev, messages: [...prev.messages, data.newMessage], status: data.newStatus || prev.status }));
        setReply("");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (status) => {
    try {
      const { data } = await axios.post("/api/ticket/admin/status", { ticketId: id, status });
      if (data.success) {
        setTicket((prev) => ({ ...prev, status }));
        toast.success("Status updated");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading || appLoading) return <Loading message="Loading Ticket" className="min-h-[90vh]" />;

  if (!ticket) return null;

  const isClosed = ticket.status === "closed" || ticket.status === "resolved";

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 min-h-[82vh]">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-0.5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <p className="text-xs text-muted-foreground capitalize mt-0.5">
            {ticket.category} · Priority: {ticket.priority}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-xs ${statusBadgeClass(ticket.status)}`}>
            {statusLabel(ticket.status)}
          </Badge>
          <select value={ticket.status} onChange={(e) => changeStatus(e.target.value)} className="text-xs border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ticket Meta */}
      <div className="rounded-xl border bg-card p-4 text-sm space-y-1.5">
        <p>
          <span className="text-muted-foreground">Tenant: </span>
          {ticket.user?.name} ({ticket.user?.email})
        </p>
        <p>
          <span className="text-muted-foreground">Opened: </span>
          {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        <p>
          <span className="text-muted-foreground">Last activity: </span>
          {new Date(ticket.updatedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Chat */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b">
          <p className="text-sm font-medium">Conversation</p>
        </div>
        <div className="p-4 space-y-3 max-h-[440px] overflow-y-auto">
          {ticket.messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No messages yet.</p>}
          {ticket.messages.map((msg, i) => {
            const isAdmin = msg.senderRole === "admin";
            return (
              <div key={i} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isAdmin ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                  <p className="text-xs font-medium mb-1 opacity-70">{isAdmin ? "Admin" : ticket.user?.name}</p>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isAdmin ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {isClosed ? (
          <div className="px-5 py-3 border-t text-sm text-muted-foreground text-center">This ticket is {ticket.status}. Change the status above to reply.</div>
        ) : (
          <div className="p-4 border-t flex gap-2">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              rows={2}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendReply();
                }
              }}
            />
            <Button onClick={sendReply} disabled={sending || !reply.trim()} size="icon" className="self-end h-10 w-10">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminTicketDetail;
