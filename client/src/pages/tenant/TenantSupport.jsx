import { useEffect, useRef, useState } from "react";
import { HelpCircle, Plus, Send, MessageSquare, AlertCircle, Loader2, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";

const CATEGORIES = ["general", "maintenance", "payment", "move_in", "listing", "account", "other"];
const PRIORITIES = ["low", "medium", "high"];

const STATUS_META = {
  open: { label: "Open", style: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", style: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  resolved: { label: "Resolved", style: "bg-green-100 text-green-700 border-green-200" },
  closed: { label: "Closed", style: "bg-gray-100 text-gray-600 border-gray-200" },
};

const PRIORITY_META = {
  low: { label: "Low", style: "bg-gray-100 text-gray-600 border-gray-200" },
  medium: { label: "Medium", style: "bg-blue-100 text-blue-700 border-blue-200" },
  high: { label: "High", style: "bg-red-100 text-red-700 border-red-200" },
};

const fmt = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const fmtTime = (date) => new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

const NewTicketForm = ({ onCreated, onCancel }) => {
  const { axios } = useAppContext();
  const [form, setForm] = useState({ subject: "", category: "general", priority: "medium", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post("/api/ticket/create", form);
      if (data.success) {
        toast.success("Ticket created");
        onCreated(data.ticket);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">Subject *</label>
        <input type="text" placeholder="Briefly describe your issue" value={form.subject} onChange={(e) => set("subject", e.target.value)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Category *</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 capitalize bg-white">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Priority</label>
          <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 capitalize bg-white">
            {PRIORITIES.map((p) => (
              <option key={p} value={p} className="capitalize">
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">Message *</label>
        <textarea rows={4} placeholder="Describe your issue in detail..." value={form.message} onChange={(e) => set("message", e.target.value)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 resize-none" />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={onCancel}>
          <X className="w-3.5 h-3.5 mr-1" /> Cancel
        </Button>
        <Button type="submit" size="sm" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white" disabled={submitting}>
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
          Submit Ticket
        </Button>
      </div>
    </form>
  );
};

const ChatView = ({ ticket, userId, onReply }) => {
  const { axios } = useAppContext();
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleSend = async () => {
    if (!reply.trim()) return;
    if (ticket.status === "closed") {
      toast.error("This ticket is closed");
      return;
    }
    setSending(true);
    try {
      const { data } = await axios.post("/api/ticket/reply", { ticketId: ticket._id, content: reply.trim() });
      if (data.success) {
        setReply("");
        onReply(data.newMessage);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusMeta = STATUS_META[ticket.status] || STATUS_META.open;
  const priorityMeta = PRIORITY_META[ticket.priority] || PRIORITY_META.medium;
  const isClosed = ticket.status === "closed";

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex flex-wrap items-start gap-2 justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{ticket.subject}</h3>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">{ticket.category.replace("_", " ")}</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Badge className={`text-xs border ${statusMeta.style}`} variant="outline">
              {statusMeta.label}
            </Badge>
            <Badge className={`text-xs border ${priorityMeta.style}`} variant="outline">
              {priorityMeta.label}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Opened {fmt(ticket.createdAt)}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 min-h-0">
        {ticket.messages.map((msg, i) => {
          const isOwn = msg.senderRole === "user";
          return (
            <div key={i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isOwn ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                {!isOwn && <p className="text-xs font-semibold text-gray-500 mb-1">Support Team</p>}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1.5 text-right ${isOwn ? "text-blue-200" : "text-gray-400"}`}>{fmtTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply input */}
      <div className="px-5 py-4 border-t border-gray-100 shrink-0">
        {isClosed ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            This ticket is closed. Raise a new ticket if you need further help.
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <textarea
              rows={2}
              placeholder="Type your message… (Enter to send, Shift+Enter for newline)"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 resize-none"
            />
            <Button size="icon" className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 rounded-xl cursor-pointer shrink-0" disabled={sending || !reply.trim()} onClick={handleSend}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const TenantSupport = () => {
  const { axios, appLoading, user } = useAppContext();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    if (appLoading) return;
    fetchTickets();
  }, [appLoading]);

  const fetchTickets = async () => {
    try {
      const { data } = await axios.get("/api/ticket/my");
      if (data.success) setTickets(data.tickets);
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectTicket = async (ticket) => {
    setSelectedId(ticket._id);
    setShowNewForm(false);
    setLoadingDetail(true);
    try {
      const { data } = await axios.get(`/api/ticket/${ticket._id}`);
      if (data.success) setSelectedTicket(data.ticket);
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreated = (ticket) => {
    setTickets((prev) => [ticket, ...prev]);
    setShowNewForm(false);
    selectTicket(ticket);
  };

  const handleReply = (newMessage) => {
    setSelectedTicket((prev) => ({
      ...prev,
      status: prev.status === "resolved" ? "open" : prev.status,
      messages: [...prev.messages, newMessage],
    }));
    setTickets((prev) => prev.map((t) => (t._id === selectedTicket._id ? { ...t, updatedAt: new Date(), status: t.status === "resolved" ? "open" : t.status } : t)));
  };

  if (loading || appLoading) return <Loading message="Loading Support page" className="min-h-[90vh]"/>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support</h1>
            <p className="text-sm text-gray-500 mt-1">Raise a ticket and chat with our support team</p>
          </div>
          <Button
            className="gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setShowNewForm(true);
              setSelectedId(null);
              setSelectedTicket(null);
            }}
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </Button>
        </div>

        <div className="flex gap-5" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
          <div className="w-80 shrink-0 bg-white rounded-2xl border border-gray-200 overflow-y-auto flex flex-col shadow-sm">
            {tickets.length === 0 && !showNewForm ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16 px-6 text-center">
                <div className="bg-gray-100 rounded-full p-4">
                  <HelpCircle className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No tickets yet</p>
                <p className="text-xs text-gray-400">Click "New Ticket" to raise your first support request</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {tickets.map((t) => {
                  const meta = STATUS_META[t.status] || STATUS_META.open;
                  const isSelected = t._id === selectedId;
                  return (
                    <button key={t._id} onClick={() => selectTicket(t)} className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate flex-1">{t.subject}</p>
                        <Badge className={`text-xs border shrink-0 ${meta.style}`} variant="outline">
                          {meta.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-400 capitalize flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {t.category.replace("_", " ")}
                        </span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{fmt(t.updatedAt)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            {showNewForm ? (
              <div className="flex flex-col h-full">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm">New Support Ticket</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Our team usually responds within 24 hours</p>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  <NewTicketForm onCreated={handleCreated} onCancel={() => setShowNewForm(false)} />
                </div>
              </div>
            ) : loadingDetail ? (
              <div className="flex items-center justify-center flex-1 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-sm text-gray-500">Loading ticket…</span>
              </div>
            ) : selectedTicket ? (
              <ChatView ticket={selectedTicket} userId={user?._id} onReply={handleReply} />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 gap-3">
                <div className="bg-gray-100 rounded-full p-5">
                  <MessageSquare className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Select a ticket to view the conversation</p>
                <p className="text-xs text-gray-400">or create a new one to get help</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSupport;
