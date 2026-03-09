import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Calendar, PackageCheck, Heart, HelpCircle, ChevronRight, Clock, MapPin, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";
import { format } from "date-fns";

const VISIT_STATUS_META = {
  requested: { label: "Requested", style: "bg-blue-100 text-blue-700 border-blue-200" },
  scheduled: { label: "Scheduled", style: "bg-purple-100 text-purple-700 border-purple-200" },
  visited: { label: "Visited", style: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", style: "bg-gray-100 text-gray-600 border-gray-200" },
  rejected: { label: "Rejected", style: "bg-red-100 text-red-700 border-red-200" },
};

const MOVEIN_STATUS_META = {
  awaiting_owner_setup: { label: "Awaiting Setup", style: "bg-orange-100 text-orange-700 border-orange-200" },
  pending: { label: "Pending", style: "bg-blue-100 text-blue-700 border-blue-200" },
  ready: { label: "Ready", style: "bg-green-100 text-green-700 border-green-200" },
  moved_in: { label: "Moved In", style: "bg-purple-100 text-purple-700 border-purple-200" },
};

const TICKET_STATUS_META = {
  open: { label: "Open", style: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", style: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  resolved: { label: "Resolved", style: "bg-green-100 text-green-700 border-green-200" },
  closed: { label: "Closed", style: "bg-gray-100 text-gray-600 border-gray-200" },
};

const SectionCard = ({ title, icon, count, countStyle, linkTo, linkLabel, children, empty }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
        {icon}
        {title}
        {count != null && count > 0 && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${countStyle}`}>{count}</span>}
      </h2>
      <Link to={linkTo} className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
        {linkLabel} <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
    {empty ? (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
        <span className="text-xs">{empty}</span>
      </div>
    ) : (
      children
    )}
  </div>
);

const TenantDashboard = () => {
  const { axios, user, appLoading } = useAppContext();
  const [visits, setVisits] = useState([]);
  const [moveIns, setMoveIns] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appLoading) return;
    const fetchAll = async () => {
      try {
        const [visitRes, moveInRes, ticketRes] = await Promise.all([axios.get("/api/visit/tenant/visits"), axios.get("/api/movein/tenant"), axios.get("/api/ticket/my")]);
        if (visitRes.data.success) setVisits(visitRes.data.visits);
        if (moveInRes.data.success) setMoveIns(moveInRes.data.moveIns);
        if (ticketRes.data.success) setTickets(ticketRes.data.tickets);
        // Shortlisted comes from user.favourites populated
        if (user?.favourites) setShortlisted(user.favourites);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [appLoading]);

  if (loading || appLoading) return <Loading message="Loading Dashboard" className="min-h-[90vh]" />;

  // Stats
  const activeVisits = visits.filter((v) => v.status === "requested" || v.status === "scheduled").length;
  const activeMoveIn = moveIns.find((m) => m.status !== "moved_in");
  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

  const recentVisits = visits.slice(0, 4);
  const recentTickets = tickets.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Here's an overview of your rental activity.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Active Visits",
              value: activeVisits,
              icon: <Calendar className="w-5 h-5 text-blue-600" />,
              bg: "bg-blue-50",
              link: "/visits",
            },
            {
              label: "Move-In Status",
              value: moveIns.length,
              icon: <PackageCheck className="w-5 h-5 text-purple-600" />,
              bg: "bg-purple-50",
              link: "/move-in",
            },
            {
              label: "Shortlisted",
              value: shortlisted.length,
              icon: <Heart className="w-5 h-5 text-rose-600" />,
              bg: "bg-rose-50",
              link: "/shortlisted",
            },
            {
              label: "Open Tickets",
              value: openTickets,
              icon: <HelpCircle className="w-5 h-5 text-orange-600" />,
              bg: "bg-orange-50",
              link: "/support",
            },
          ].map(({ label, value, icon, bg, link }) => {
            return (
              <Link key={label} to={link} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`${bg} rounded-xl p-3`}>{icon}</div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {activeMoveIn && (
          <Link to={`/move-in/${activeMoveIn._id}`} className="flex items-center gap-4 bg-white border border-blue-200 rounded-2xl px-5 py-4 mb-6 hover:shadow-md transition-shadow shadow-sm">
            {activeMoveIn.listing?.gallery?.[0] ? (
              <img src={activeMoveIn.listing.gallery[0]} alt="" className="w-14 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-14 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-gray-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-600 mb-0.5">Active Move-In Process</p>
              <p className="font-semibold text-gray-900 text-sm truncate">{activeMoveIn.listing?.title}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {activeMoveIn.listing?.location?.city}, {activeMoveIn.listing?.location?.state}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs border ${MOVEIN_STATUS_META[activeMoveIn.status]?.style}`} variant="outline">
                {MOVEIN_STATUS_META[activeMoveIn.status]?.label}
              </Badge>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <SectionCard title="Recent Visits" icon={<Calendar className="w-4 h-4 text-blue-500" />} count={activeVisits} countStyle="bg-blue-100 text-blue-700" linkTo="/visits" linkLabel="View all" empty={recentVisits.length === 0 ? "No visit requests yet" : null}>
            <div className="divide-y divide-gray-100">
              {recentVisits.map((v) => {
                const meta = VISIT_STATUS_META[v.status] || VISIT_STATUS_META.requested;
                return (
                  <div key={v._id} className="px-5 py-3.5 flex items-center gap-3">
                    {v.listing?.gallery?.[0] ? (
                      <img src={v.listing.gallery[0]} alt="" className="w-10 h-9 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Home className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{v.listing?.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(v.requestedSlot), "dd MMM, hh:mm aa")}
                      </p>
                    </div>
                    <Badge className={`text-xs border ${meta.style}`} variant="outline">
                      {meta.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Support Tickets" icon={<HelpCircle className="w-4 h-4 text-orange-500" />} count={openTickets} countStyle="bg-orange-100 text-orange-700" linkTo="/support" linkLabel="Open support" empty={recentTickets.length === 0 ? "No support tickets yet" : null}>
            <div className="divide-y divide-gray-100">
              {recentTickets.map((t) => {
                const meta = TICKET_STATUS_META[t.status] || TICKET_STATUS_META.open;
                const lastMsg = t.messages?.[t.messages.length - 1];
                return (
                  <Link key={t._id} to="/support" className="px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                    <div className="bg-gray-100 rounded-lg p-2 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.subject}</p>
                      {lastMsg && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {lastMsg.senderRole === "admin" ? "Support: " : "You: "}
                          {lastMsg.content}
                        </p>
                      )}
                    </div>
                    <Badge className={`text-xs border ${meta.style}`} variant="outline">
                      {meta.label}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Browse Properties", to: "/browse", icon: <Home className="w-4 h-4" />, style: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" },
            { label: "My Shortlist", to: "/shortlisted", icon: <Heart className="w-4 h-4" />, style: "text-rose-600 bg-rose-50 hover:bg-rose-100" },
            { label: "Visit Requests", to: "/visits", icon: <Calendar className="w-4 h-4" />, style: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
            { label: "Move-In", to: "/move-in", icon: <PackageCheck className="w-4 h-4" />, style: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
          ].map(({ label, to, icon, style }) => (
            <Link key={to} to={to} className={`flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm font-medium transition-colors ${style}`}>
              {icon}
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
