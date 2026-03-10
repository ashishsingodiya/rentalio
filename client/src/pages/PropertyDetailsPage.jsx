import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  ChevronLeft,
  Wifi,
  AirVent,
  Car,
  Dumbbell,
  Shield,
  Waves,
  Trees,
  ChevronRight,
  Heart,
  X,
  Bed,
  Bath,
  Home,
  Armchair,
  GitCompareArrows,
  Zap,
  Droplets,
  Flame,
  ArrowUpDown,
  Camera,
  Lock,
  ShieldAlert,
  PawPrint,
  Footprints,
  Sun,
  Wind,
  Sparkles,
  WashingMachine,
  Baby,
  Building2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useAppContext } from "../context/AppContext";
import { toast } from "sonner";
import { capitalizeWords } from "../lib/stringUtils";
import Loading from "../components/Loading";

const amenityIcons = {
  WiFi: Wifi,
  AC: AirVent,
  Parking: Car,
  "Power Backup": Zap,
  "Water Supply": Droplets,
  "Gas Pipeline": Flame,
  Lift: ArrowUpDown,
  "24/7 Security": Shield,
  CCTV: Camera,
  "Gated Security": Lock,
  "Fire Safety": ShieldAlert,
  Gym: Dumbbell,
  "Swimming Pool": Waves,
  Garden: Trees,
  "Pet Friendly": PawPrint,
  "Jogging Track": Footprints,
  Terrace: Sun,
  Balcony: Wind,
  Housekeeping: Sparkles,
  Laundry: WashingMachine,
  "Kids Play Area": Baby,
  Clubhouse: Building2,
};

const formatParking = (parking) => {
  if (parking === "bike") return "Bike Only";
  if (parking === "car_bike") return "Car & Bike";
  return "Not Available";
};

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const { user, setUser, axios, navigate } = useAppContext();

  const [property, setProperty] = useState(null);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [showVisitForm, setShowVisitForm] = useState(false);
  const [requestedSlot, setRequestedSlot] = useState("");
  const [visitMessage, setVisitMessage] = useState("");
  const [visitRequested, setVisitRequested] = useState(false);
  const [visitLoading, setVisitLoading] = useState(false);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/listing/${id}`);

        if (data.success) {
          setProperty(data.listing);
        } else {
          toast.error("Property not found");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error(error.message || "Failed to load property details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPropertyData();
    }
  }, [id, axios]);

  useEffect(() => {
    if (user && user.favourites) {
      const isFav = user.favourites.some((item) => {
        return (typeof item === "string" ? item : item.id) === id;
      });

      setSaved(isFav);
    } else {
      setSaved(false);
    }
  }, [user, id]);

  useEffect(() => {
    if (!user || !id) return;
    const checkVisitStatus = async () => {
      try {
        const { data } = await axios.get(`/api/visit/check/${id}`);
        if (data.success) setVisitRequested(data.requested);
      } catch (error) {
        toast.error(error.message);
      }
    };
    checkVisitStatus();
  }, [user, id, axios]);

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
      const { data } = await axios.post("/api/user/toggle-favorite", {
        listingId: id,
      });

      if (data.success) {
        toast.success(data.message);
        setUser((prev) => ({
          ...prev,
          favourites: previousState
            ? prev.favourites.filter(
                (item) => (typeof item === "string" ? item : item._id) !== id,
              )
            : [...prev.favourites, id],
        }));
      } else {
        setSaved(previousState);
        toast.error(data.message);
      }
    } catch (error) {
      setSaved(previousState);
      toast.error("Failed to update favorites");
    }
  };

  const handleCompare = async (e) => {
    try {
      if (!saved) {
        await handleSave(e);
      }
      navigate("/shortlisted", {
        state: {
          triggerCompare: true,
          x: property._id,
        },
      });
    } catch (error) {
      toast.error("Failed to prepare comparison:", error);
    }
  };

  const handleRequestVisit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to request a visit");
      return;
    }

    if (!requestedSlot) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      setVisitLoading(true);
      const { data } = await axios.post("/api/visit/create", {
        listingId: id,
        requestedSlot,
        message: visitMessage,
      });
      if (data.success) {
        toast.success(data.message);
        setVisitRequested(true);
        setShowVisitForm(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to request visit");
    } finally {
      setVisitLoading(false);
    }
  };

  const images = property?.gallery || [];

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goNext = useCallback(
    () => setLightboxIndex((prev) => (prev + 1) % images.length),
    [images.length],
  );
  const goPrev = useCallback(
    () =>
      setLightboxIndex((prev) => (prev - 1 + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") closeLightbox();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxOpen, goNext, goPrev]);

  if (!property || isLoading)
    return (
      <Loading message="Loading property details" className="min-h-[90vh]" />
    );

  const moveInDate = new Date(property.moveInAvailableFrom);
  const isAvailableNow = moveInDate <= new Date();

  const minDateTime = new Date();
  minDateTime.setMinutes(
    minDateTime.getMinutes() - minDateTime.getTimezoneOffset(),
  );
  const minDateTimeStr = minDateTime.toISOString().slice(0, 16);

  return (
    <div className="mx-auto px-8 py-6 max-w-6xl space-y-6">
      {/* Request visit modal */}
      {showVisitForm && (
        <div className="fixed inset-0 z-50 bg-foreground/60 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Request a Visit</h2>
              <button
                onClick={() => setShowVisitForm(false)}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Separator />

            <form onSubmit={handleRequestVisit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="requestedSlot">Preferred Date &amp; Time</Label>
                <Input
                  id="requestedSlot"
                  type="datetime-local"
                  min={minDateTimeStr}
                  value={requestedSlot}
                  onChange={(e) => setRequestedSlot(e.target.value)}
                  required
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="visitMessage">
                  Message{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="visitMessage"
                  placeholder="Any specific requests or questions for the owner..."
                  value={visitMessage}
                  onChange={(e) => setVisitMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  onClick={() => setShowVisitForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 cursor-pointer"
                  disabled={visitLoading}
                >
                  {visitLoading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[320px] md:h-[420px]">
        <div
          className="md:col-span-2 relative group cursor-pointer"
          onClick={() => openLightbox(0)}
        >
          <img
            src={images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2">
          {images.slice(1, 3).map((img, i) => (
            <div
              key={i}
              className="relative cursor-pointer overflow-hidden group"
              onClick={() => openLightbox(i + 1)}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
            </div>
          ))}
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2">
          {images.slice(3, 5).map((img, i) => {
            const remaining = images.length - 5;
            const showMore = i === 1 && remaining > 0;
            return (
              <div
                key={i}
                className="relative cursor-pointer overflow-hidden group"
                onClick={() => openLightbox(i + 3)}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
                {showMore && (
                  <div className="absolute inset-0 bg-foreground/50 flex flex-col items-center justify-center">
                    <span className="text-background text-2xl font-bold">
                      +{remaining}
                    </span>
                    <span className="text-background text-sm font-medium">
                      More
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {images.length <= 3 && (
            <div className="bg-muted flex items-center justify-center text-muted-foreground text-sm">
              No more photos
            </div>
          )}
        </div>
      </div>

      <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImage ? "border-primary" : "border-transparent"}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/95 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <span className="text-background text-sm font-medium">
              {lightboxIndex + 1} / {images.length}
            </span>
            <button
              onClick={closeLightbox}
              className="text-background hover:text-background/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-4">
            <button
              onClick={goPrev}
              className="absolute left-4 p-3 rounded-full bg-background/10 hover:bg-background/20 text-background transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <img
              src={images[lightboxIndex]}
              alt=""
              className="max-h-[75vh] max-w-full object-contain rounded-lg"
            />
            <button
              onClick={goNext}
              className="absolute right-4 p-3 rounded-full bg-background/10 hover:bg-background/20 text-background transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          <div className="flex gap-2 justify-center p-4 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === lightboxIndex ? "border-primary" : "border-background/30"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {capitalizeWords(property.specs.propertyType)}
              </Badge>
              <Badge variant="outline">
                {capitalizeWords(property.specs.furnishing)}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {property.title}
            </h1>
            <p className="flex items-center gap-1.5 text-muted-foreground mt-2">
              <MapPin className="h-4 w-4" />
              {property.location.address}, {property.location.city}
              {property.location.state ? `, ${property.location.state}` : ""}
            </p>
          </div>

          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Bed className="h-4 w-4 text-primary" />
                <p className="font-semibold text-foreground">
                  {property.specs.bedrooms}
                </p>
              </div>
              <p className="text-muted-foreground">Bedrooms</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Bath className="h-4 w-4 text-primary" />
                <p className="font-semibold text-foreground">
                  {property.specs.bathrooms}
                </p>
              </div>
              <p className="text-muted-foreground">Bathrooms</p>
            </div>
            {property.specs.areaSqFt && (
              <>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Home className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-foreground">
                      {property.specs.areaSqFt} sqft
                    </p>
                  </div>
                  <p className="text-muted-foreground">Area</p>
                </div>
              </>
            )}
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Armchair className="h-4 w-4 text-primary" />
                <p className="font-semibold text-foreground">
                  {capitalizeWords(property.specs.furnishing)}
                </p>
              </div>
              <p className="text-muted-foreground">Furnishing</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Car className="h-4 w-4 text-primary" />
                <p className="font-semibold text-foreground">
                  {formatParking(property.specs.parking)}
                </p>
              </div>
              <p className="text-muted-foreground">Parking</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">About this property</h3>
            <p className="text-muted-foreground leading-relaxed">
              {property.description}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((a) => {
                const Icon = amenityIcons[a] ?? Star;
                return (
                  <div
                    key={a}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{a}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">House Rules</h3>
            <ul className="space-y-2">
              {property.rules.map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border p-6 shadow-card space-y-5 sticky top-24">
            <p className="text-3xl font-bold text-foreground">
              ₹{property.price.toLocaleString()}
              <span className="text-base font-normal text-muted-foreground">
                /month
              </span>
            </p>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property Type</span>
                <span className="font-medium">
                  {capitalizeWords(property.specs.propertyType)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bedrooms</span>
                <span className="font-medium">{property.specs.bedrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bathrooms</span>
                <span className="font-medium">{property.specs.bathrooms}</span>
              </div>
              {property.specs.areaSqFt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Area</span>
                  <span className="font-medium">
                    {property.specs.areaSqFt} sqft
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Furnished</span>
                <span className="font-medium">
                  {capitalizeWords(property.specs.furnishing)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parking</span>
                <span className="font-medium">
                  {formatParking(property.specs.parking)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Calendar className="h-4 w-4 text-primary" />
              {isAvailableNow
                ? "Available now"
                : `Available from ${format(moveInDate, "MMM d, yyyy")}`}
            </div>

            <Button
              onClick={() => {
                if (!user) {
                  toast.error("Please login to request a visit");
                  return;
                }
                if (!visitRequested) setShowVisitForm(true);
              }}
              disabled={visitRequested}
              className="w-full cursor-pointer"
              size="lg"
            >
              {visitRequested ? "Visit Requested" : "Request Visit"}
            </Button>
            <Button
              onClick={handleCompare}
              variant="outline"
              className="w-full cursor-pointer"
              size="lg"
            >
              <GitCompareArrows />
              Compare With Others
            </Button>
            <Button
              onClick={handleSave}
              variant="outline"
              className="w-full gap-2 cursor-pointer"
              size="lg"
            >
              <Heart
                className={`h-4 w-4 ${saved ? "fill-destructive text-destructive" : "text-foreground"}`}
              />
              {saved ? "Remove From Saved" : "Save Property"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
