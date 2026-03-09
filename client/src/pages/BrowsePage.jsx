import PropertyCard from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Check, Building2, FunnelX } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";

const options = ["Apartment", "House", "Studio", "Villa", "PG", "Hostel"];

const BrowsePage = () => {
  const { axios } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [moveInDate, setMoveInDate] = useState(
    searchParams.get("moveInDate") || "",
  );
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);

  const params = new URLSearchParams();
  if (location) params.append("location", location);
  if (minPrice) params.append("minPrice", minPrice);
  if (maxPrice) params.append("maxPrice", maxPrice);
  if (moveInDate) params.append("moveInDate", moveInDate);
  if (selectedPropertyTypes.length > 0) {
    params.append("propertyTypes", selectedPropertyTypes.join(","));
  }

  useEffect(() => {
    setSearchParams(params);
  }, [minPrice, maxPrice, moveInDate, selectedPropertyTypes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(params);
  };

  const handleClear = () => {
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setMoveInDate("");
    setSelectedPropertyTypes([]);
  };

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `/api/listing/properties?${searchParams.toString()}`,
        );

        if (data.success) {
          setListings(data.properties);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, [searchParams]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 py-8 min-h-[70vh]">
      <Card className="w-full lg:w-64 lg:sticky top-24 self-start flex-1">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter properties by location, budget, type, and move-in date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={location}
                  placeholder="Any location"
                  className="pl-9 h-9"
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Budget Range
              </Label>
              <div className="flex gap-2">
                <Select onValueChange={setMinPrice} value={minPrice}>
                  <SelectTrigger className="border w-full">
                    <SelectValue placeholder="No Min" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">₹1,000</SelectItem>
                    <SelectItem value="2000">₹2,000</SelectItem>
                    <SelectItem value="5000">₹5,000</SelectItem>
                    <SelectItem value="10000">₹10,000</SelectItem>
                    <SelectItem value="20000">₹20,000</SelectItem>
                    <SelectItem value="25000">₹25,000</SelectItem>
                    <SelectItem value="30000">₹30,000</SelectItem>
                    <SelectItem value="50000">₹50,000</SelectItem>
                    <SelectItem value="70000">₹75,000</SelectItem>
                    <SelectItem value="100000">₹1 Lac</SelectItem>
                    <SelectItem value="200000">₹2 Lacs</SelectItem>
                    <SelectItem value="300000">₹3 Lacs</SelectItem>
                    <SelectItem value="500000">₹5 Lacs</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={setMaxPrice} value={maxPrice}>
                  <SelectTrigger className="border w-full">
                    <SelectValue placeholder="No Max" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">₹1,000</SelectItem>
                    <SelectItem value="2000">₹2,000</SelectItem>
                    <SelectItem value="5000">₹5,000</SelectItem>
                    <SelectItem value="10000">₹10,000</SelectItem>
                    <SelectItem value="20000">₹20,000</SelectItem>
                    <SelectItem value="25000">₹25,000</SelectItem>
                    <SelectItem value="30000">₹30,000</SelectItem>
                    <SelectItem value="50000">₹50,000</SelectItem>
                    <SelectItem value="70000">₹75,000</SelectItem>
                    <SelectItem value="100000">₹1 Lac</SelectItem>
                    <SelectItem value="200000">₹2 Lacs</SelectItem>
                    <SelectItem value="300000">₹3 Lacs</SelectItem>
                    <SelectItem value="500000">₹5 Lacs</SelectItem>
                    <SelectItem value="500000+">₹5+ Lacs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Type of property
              </Label>
              <ToggleGroup
                type="multiple"
                variant="outline"
                spacing={1}
                value={selectedPropertyTypes}
                onValueChange={setSelectedPropertyTypes}
                className="flex flex-wrap gap-2"
              >
                {options.map((item) => {
                  const value = item.toLowerCase();
                  const isSelected = selectedPropertyTypes.includes(value);

                  return (
                    <ToggleGroupItem
                      key={value}
                      value={value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {isSelected ? <Check size={16} /> : <Plus size={16} />}
                      {item}
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Move-in Date
              </Label>
              <Input
                type="date"
                value={moveInDate}
                className="h-9"
                onChange={(e) => setMoveInDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleClear}
                type="button"
                variant="outline"
                className="w-full gap-2 cursor-pointer"
                size="lg"
              >
                Clear Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex-4">
        {isLoading ? (
          <Loading message="Loading properties" className="min-h-[90vh]" />
        ) : listings.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border bg-muted/30">
            <div className="bg-background p-4 rounded-full border shadow-sm mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">
              No matching properties
            </h3>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm">
              Try adjusting your filters or clearing them to discover more
              available listings.
            </p>
            <Button onClick={handleClear} className="mt-6 gap-2 cursor-pointer">
              <FunnelX className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {listings.map((p) => (
              <PropertyCard key={p._id} {...p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
