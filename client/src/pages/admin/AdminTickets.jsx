import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { HelpCircle, Clock, CheckCircle, XCircle, ChevronRight, AlertTriangle } from "lucide-react";

const STATUS_TABS = ["all", "open", "in_progress", "resolved", "closed"];

const statusBadgeClass = (status) => {
  const map = {
    open: "text-red-600 border-red-300 bg-red-50",
    in_progress: "text-blue-600 border-blue-300 bg-blue-50",
    resolved: "text-green-600 border-green-300 bg-green-50",
    closed: "text-gray-600 border-gray-300 bg-gray-50",
  };
  return map[status] || "";
};

const priorityBadgeClass = (priority) => {
  const map = {
    urgent: "text-red-600 border-red-300 bg-red-50",
    high: "text-orange-600 border-orange-300 bg-orange-50",
    medium: "text-yellow-600 border-yellow-300 bg-yellow-50",
    low: "text-gray-600 border-gray-300 bg-gray-50",
  };
  return map[priority] || "";
};

const tabLabel = (tab) => (tab === "in_progress" ? "In Progress" : tab.charAt(0).toUpperCase() + tab.slice(1));

const AdminTickets = () => {
  const { axios, appLoading } = useContext(AppContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchTickets = async () => {
      if (appLoading) return;
      try {
        const { data } = await axios.get("/api/ticket/admin/all");
        if (data.success) setTickets(data.tickets);
        else toast.error(data.message);
      } catch {
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [appLoading]);

  const filtered = activeTab === "all" ? tickets : tickets.filter((t) => t.status === activeTab);

  const stats = [
    { label: "Total", value: tickets.length, icon: HelpCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Open", value: tickets.filter((t) => t.status === "open").length, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "In Progress", value: tickets.filter((t) => t.status === "in_progress").length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Resolved", value: tickets.filter((t) => t.status === "resolved").length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Closed", value: tickets.filter((t) => t.status === "closed").length, icon: XCircle, color: "text-gray-600", bg: "bg-gray-50" },
  ];

  if (loading || appLoading) return <Loading message="Loading Tickets" className="min-h-[90vh]" />;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6 min-h-[82vh]">
      <div>
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage and respond to tenant support tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
            {tabLabel(tab)} ({tab === "all" ? tickets.length : tickets.filter((t) => t.status === tab).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No tickets in this category.</div>
      ) : (
        <div className="rounded-xl border bg-card divide-y">
          {filtered.map((ticket) => (
            <Link key={ticket._id} to={`/admin/tickets/${ticket._id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors">
              {/* Avatar */}
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">{ticket.user?.name?.charAt(0).toUpperCase() || "?"}</div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="font-medium text-sm truncate">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  <span className="font-medium text-foreground/70">{ticket.user?.name || "User"}</span>
                  {" · "}
                  {ticket.category}
                  {" · "}
                  {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className={`text-xs hidden sm:inline-flex ${priorityBadgeClass(ticket.priority)}`}>
                  {ticket.priority}
                </Badge>
                <Badge variant="outline" className={`text-xs ${statusBadgeClass(ticket.status)}`}>
                  {tabLabel(ticket.status)}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default AdminTickets;
