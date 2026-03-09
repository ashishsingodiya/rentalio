import { Button } from "@/components/ui/button";
import PropertyCard from "./PropertyCard";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import Loading from "./Loading";

const FeaturedListings = () => {
  const { axios } = useAppContext();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      setIsLoading(true)
      try {
        const { data } = await axios.get("/api/listing/featured");

        if (data.success) {
          setListings(data.properties);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally{
        setIsLoading(false)
      }
    };

    fetchFeaturedProperties();
  }, [axios]);

  return (
    <section className="max-w-350 px-8 mx-auto py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Featured Listings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Handpicked properties just for you
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Link to={"/browse"}>View all</Link>
        </Button>
      </div>
      {isLoading ? (
        <Loading message="Loading featured properties" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((p) => (
            <div key={p._id}>
              <PropertyCard {...p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedListings;
