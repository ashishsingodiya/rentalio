import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, MapPin, BedDouble, Bath, IndianRupee, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";

const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  review: "bg-yellow-100 text-yellow-700 border-yellow-200",
  published: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const OwnerListings = () => {
  const { axios, navigate, appLoading } = useAppContext();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      if (appLoading) return;
      try {
        const { data } = await axios.get("/api/listing/owner/listings");
        if (data.success) {
          setListings(data.listings);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [appLoading]);

  const handleDelete = async () => {
    const id = confirmId;
    setConfirmId(null);
    setDeletingId(id);
    try {
      const { data } = await axios.post("/api/listing/delete", { listingId: id });
      if (data.success) {
        toast.success(data.message);
        setListings((prev) => prev.filter((l) => l._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const listingToDelete = listings.find((l) => l._id === confirmId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Confirmation Dialog */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2.5 shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-base">Delete Listing</h2>
                <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            {listingToDelete && (
              <div className="bg-gray-50 rounded-xl border px-4 py-3 text-sm text-gray-700">
                <p className="font-medium">{listingToDelete.title}</p>
                <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listingToDelete.location.city}, {listingToDelete.location.state}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-600">Are you sure you want to permanently delete this listing?</p>

            <div className="flex gap-3 mt-1">
              <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setConfirmId(null)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all your rental properties</p>
          </div>
          <Button onClick={() => navigate("/owner/create")} className="gap-2 cursor-pointer">
            <Plus className="w-4 h-4" />
            Add New Listing
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <Loading message="Loading your listings..." className="min-h-[90vh]"/>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="bg-gray-100 rounded-full p-6">
              <BedDouble className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No listings yet</p>
            <p className="text-gray-400 text-sm">Create your first listing to get started</p>
            <Button onClick={() => navigate("/owner/create")} className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Create Listing
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Specs</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing._id} className="hover:bg-gray-50 transition-colors">
                    {/* Thumbnail */}
                    <TableCell>
                      <img src={listing?.gallery[0] || `${import.meta.env.VITE_BASE_URL}/images/default.jpg`} alt={listing.title} className="w-16 h-12 rounded-lg object-cover" />
                    </TableCell>

                    {/* Title & Location */}
                    <TableCell>
                      <p className="font-semibold text-gray-900 leading-snug">{listing.title}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {listing.location.city}, {listing.location.state}
                      </p>
                    </TableCell>

                    {/* Specs */}
                    <TableCell>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <BedDouble className="w-3.5 h-3.5" />
                          {listing.specs.bedrooms} Bed
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5" />
                          {listing.specs.bathrooms} Bath
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">
                        {listing.specs.propertyType} · {listing.specs.furnishing}
                      </p>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <span className="flex items-center gap-0.5 font-semibold text-gray-800">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {listing.price.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-gray-500">/mo</span>
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge className={`capitalize text-xs border ${STATUS_STYLES[listing.status] || ""}`} variant="outline">
                        {listing.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer" onClick={() => navigate(`/property/${listing._id}`)}>
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer" onClick={() => setConfirmId(listing._id)} disabled={deletingId === listing._id}>
                          <Trash2 className="w-3.5 h-3.5" />
                          {deletingId === listing._id ? "Deleting…" : "Delete"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerListings;
