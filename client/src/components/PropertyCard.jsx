import { Heart, MapPin, Wifi, Car, Dumbbell, Bed, Bath } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { toast } from "sonner";
import { useEffect } from "react";
import { capitalizeWords } from "../lib/stringUtils";

const amenityIcons = { WiFi: Wifi, Parking: Car, Gym: Dumbbell };

const PropertyCard = ({ _id, title, location, price, gallery, amenities, specs }) => {
  const [saved, setSaved] = useState(false);
  const image = gallery[0] || `${import.meta.env.VITE_BASE_URL}/images/default.jpg`;
  const { user, axios } = useAppContext();

  useEffect(() => {
    if (user && user.favourites) {
      const isFav = user.favourites.some((item) => {
        return (typeof item === "string" ? item : item._id) === _id;
      });

      setSaved(isFav);
    } else {
      setSaved(false);
    }
  }, [user, _id]);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to save properties");
      return;
    }

    const previousState = saved;
    setSaved(!previousState);

    try {
      const { data } = await axios.post("/api/user/toggle-favorite", { listingId: _id });

      if (data.success) {
        toast.success(data.message);
      } else {
        setSaved(previousState);
        toast.error(data.message);
      }
    } catch (error) {
      setSaved(previousState);
      toast.error("Failed to update favorites");
    }
  };

  return (
    <Link to={`/property/${_id}`} className="group block rounded-xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all duration-300">
      <div className="relative aspect-4/3 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center transition-colors hover:bg-background"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-destructive text-destructive" : "text-foreground"}`} />
        </button>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm leading-tight line-clamp-1">{title}</h3>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">{capitalizeWords(specs.propertyType)}</span>
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {location.address}, {location.city}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bed className="h-3 w-3" />
            {specs.bedrooms} Bed
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3 w-3" />
            {specs.bathrooms} Bath
          </span>
          {specs.areaSqFt && <span>{specs.areaSqFt} sqft</span>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {amenities.slice(0, 3).map((a) => (
            <span key={a} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {a}
            </span>
          ))}
          {amenities.length > 3 && <span className="text-xs text-muted-foreground">+{amenities.length - 3}</span>}
        </div>
        <p className="font-bold text-base">
          ₹{price.toLocaleString()}
          <span className="text-xs font-normal text-muted-foreground">/mo</span>
        </p>
      </div>
    </Link>
  );
};

export default PropertyCard;
