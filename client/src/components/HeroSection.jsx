import { Calendar, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const HeroSection = () => {
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (moveInDate) params.append("moveInDate", moveInDate);
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      if (min) params.append("minPrice", min);
      if (max) params.append("maxPrice", max);
    }

    if (params.size === 0) {
      toast.error("Please fill atleast one field");
    } else {
      navigate(`/browse?${params.toString()}`);
    }
    // console.log(params.size);
  };
  return (
    <section className="gradient-hero py-20 lg:py-28">
      <div className="px-8 mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
          Find Your Perfect
          <br />
          <span className="text-primary">Rental Home</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Browse verified listings, schedule visits, and move in seamlessly, all
          in one platform.
        </p>

        {/* Filters */}
        <div className="max-w-3xl mx-auto mt-8">
          <form className="flex flex-col sm:flex-row gap-3 bg-card rounded-xl border border-border p-3 shadow-card">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Location (e.g., Jaipur)"
                className="pl-9 border-0 bg-muted h-11"
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="relative flex-1">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Select onValueChange={setPriceRange}>
                <SelectTrigger className="pl-9 border-0 bg-muted min-w-52 w-full py-[22px]">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-10000">Under ₹10,000</SelectItem>
                  <SelectItem value="10000-20000">₹10,000 - ₹20,000</SelectItem>
                  <SelectItem value="20000-30000">₹20,000 - ₹30,000</SelectItem>
                  <SelectItem value="30000-50000">₹30,000 - ₹50,000</SelectItem>
                  <SelectItem value="50000-">Over ₹50,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                placeholder="Move-in date"
                className="pl-9 border-0 bg-muted h-11"
                onChange={(e) => setMoveInDate(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSearch}
              type="submit"
              size="lg"
              className="h-11 px-8 cursor-pointer"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
