import PropertyCard from "@/components/PropertyCard";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, GitCompareArrows, Search, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { toast } from "sonner";
import { capitalizeWords } from "../lib/stringUtils";
import Loading from "../components/Loading";

const ShortlistedPage = () => {
  const [shortlisted, setShortlisted] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const { axios, appLoading, user, navigate } = useAppContext();
  const location = useLocation();

  useEffect(() => {
    const fetchShortlisted = async () => {
      if (appLoading) return;

      if (!user) {
        setIsLoading(false);
        toast.info("Please login first");
        navigate("/login");
        return;
      }

      try {
        const { data } = await axios.get("/api/user/favourites");

        if (data.success) {
          setShortlisted(data.properties);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShortlisted();
  }, [axios, appLoading, user]);

  const toggleCompare = (id) => {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev,
    );
  };

  // property details page -- > shortlist page (state read karke compare toggle)
  useEffect(() => {
    if (!isLoading && location.state?.triggerCompare) {
      const targetId = location.state.targetId;
      const exists = shortlisted.find((p) => p._id === targetId);

      if (shortlisted.length < 2) {
        toast.info("Add at least one more property to compare");
        return;
      }

      if (exists) {
        setShowCompare(true);
        setCompareIds([targetId]);
      }
      // state clear, refresh karne ke baad compare toggle reset ho jayega
      window.history.replaceState({}, document.title);
    }
  }, [isLoading, shortlisted, location.state]);

  const compared = shortlisted.filter((p) => compareIds.includes(p._id));

  if (isLoading) {
    return <Loading message="Loading favouries" className="min-h-[90vh]" />;
  }

  return (
    <div className="mx-auto px-8 py-6 max-w-6xl space-y-6 min-h-[82vh]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Shortlisted Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Properties you've shortlisted for later
          </p>
        </div>

        <Button
          variant={showCompare ? "secondary" : "outline"}
          size="sm"
          onClick={() => {
            if (shortlisted.length < 2) {
              toast.info("Add at least two properties to compare");
              return;
            }
            setShowCompare(!showCompare);
            if (showCompare) setCompareIds([]);
          }}
          className="gap-2 cursor-pointer"
        >
          <GitCompareArrows className="h-4 w-4" />
          {showCompare ? "Cancel Compare" : "Compare Properties"}
        </Button>
      </div>

      {shortlisted.length === 0 ? (
        <div className="min-h-[62vh] flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border bg-muted/30">
          <div className="bg-background p-4 rounded-full border shadow-sm mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight">
            Your shortlist is empty
          </h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            You haven't shortlisted any properties yet. Browse listings and tap
            the heart icon to add them here for comparison.
          </p>
          <Button asChild className="mt-6 gap-2">
            <Link to="/browse">
              <Search className="h-4 w-4" />
              Browse Properties
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {showCompare && (
            <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Select up to 3 properties to compare ({compareIds.length}/3
                selected)
              </p>
              <div className="flex flex-wrap gap-3">
                {shortlisted.map((p) => (
                  <label
                    key={p._id}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors ${
                      compareIds.includes(p._id)
                        ? "border-primary bg-accent"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <Checkbox
                      checked={compareIds.includes(p._id)}
                      onCheckedChange={() => toggleCompare(p._id)}
                      disabled={
                        !compareIds.includes(p._id) && compareIds.length >= 3
                      }
                    />
                    <span className="truncate max-w-[180px]">{p.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {showCompare && compared.length >= 2 && (
            <div className="rounded-xl border border-border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Feature</TableHead>
                    {compared.map((p) => (
                      <TableHead key={p._id} className="min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{p.title}</span>
                          <button
                            onClick={() => toggleCompare(p._id)}
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Price</TableCell>
                    {compared.map((p) => (
                      <TableCell key={p._id}>
                        ₹{p.price.toLocaleString()}/mo
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Location</TableCell>
                    {compared.map((p) => (
                      <TableCell key={p._id}>
                        {p.location.address}, {p.location.city}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Type</TableCell>
                    {compared.map((p) => (
                      <TableCell key={p._id}>
                        {capitalizeWords(p.specs.propertyType)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bedrooms</TableCell>
                    {compared.map((p) => (
                      <TableCell key={p._id}>{p.specs.bedrooms}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bathrooms</TableCell>
                    {compared.map((p) => (
                      <TableCell key={p._id}>{p.specs.bathrooms}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Area</TableCell>
                    {compared.map((p) => (
                      <TableCell key={p._id}>
                        {p.specs.areaSqFt ? `${p.specs.areaSqFt} sqft` : "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Furnishing</TableCell>
                    {compared.map((p) => (
                      <TableCell key={p._id}>
                        {capitalizeWords(p.specs.furnishing)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Parking</TableCell>
                    {compared.map((p) => (
                      <TableCell key={p._id}>{p.specs.parking}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Amenities</TableCell>
                    {compared.map((p) => (
                      <TableCell key={p._id}>
                        {p.amenities.join(", ")}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shortlisted.map((p) => (
              <PropertyCard key={p._id} {...p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ShortlistedPage;
