import { useEffect, useState } from "react";
import { Upload, X, Home, MapPin, IndianRupee, FileText, Settings, Loader2, ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAppContext } from "../../context/AppContext";
import { toast } from "sonner";

const AMENITIES = [
  "WiFi",
  "AC",
  "Parking",
  "Power Backup",
  "Water Supply",
  "Gas Pipeline",
  "Lift",
  "24/7 Security",
  "CCTV",
  "Gated Security",
  "Fire Safety",
  "Gym",
  "Swimming Pool",
  "Garden",
  "Pet Friendly",
  "Jogging Track",
  "Terrace",
  "Balcony",
  "Housekeeping",
  "Laundry",
  "Kids Play Area",
  "Clubhouse",
];

const OwnerCreateListing = () => {
  // 1. State for inputs
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [propertyType, setPropertyType] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [parking, setParking] = useState("");

  const [rules, setRules] = useState([]);
  const [ruleInput, setRuleInput] = useState("");

  const { axios, user, navigate, appLoading } = useAppContext();

  useEffect(() => {
    if (!appLoading && (!user || user.role !== "owner")) {
      navigate("/");
    }
  }, [user, appLoading]);

  const addRule = () => {
    if (!ruleInput.trim()) return;
    setRules([...rules, ruleInput.trim()]);
    setRuleInput("");
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addRule();
    }
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]));
  };

  const handleImageUpload = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const previews = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...previews]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!propertyType) {
      toast.error("Please select a property type", { position: "top-center" });
      return;
    }
    if (!furnishing) {
      toast.error("Please select furnishing type", { position: "top-center" });
      return;
    }
    if (!parking) {
      toast.error("Please select parking option", { position: "top-center" });
      return;
    }

    setLoading(true);

    const status = e.nativeEvent.submitter.value;
    const formData = new FormData(e.currentTarget);

    formData.append("propertyType", propertyType);
    formData.append("furnishing", furnishing);
    formData.append("parking", parking);
    formData.append("status", status);

    selectedAmenities.forEach((amenity) => {
      formData.append("amenities", amenity);
    });

    rules.forEach((rule) => {
      formData.append("rules", rule);
    });

    images.forEach((img) => {
      formData.append("images", img.file);
    });

    try {
      const { data } = await axios.post("/api/listing/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Property listed successfully!");
      console.log("Success:", data);
      navigate("/owner/listings");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-8">
      <form onSubmit={handleSubmit}>
        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader className="bg-muted/20 border-b pb-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              List Your Property
            </CardTitle>
            <CardDescription>Enter the details below to publish your rental listing instantly.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-8 px-8 py-8 lg:grid-cols-3">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                  <FileText className="h-4 w-4" /> Basic Details
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="title">Property Title</Label>
                  <Input name="title" id="title" placeholder="e.g. Spacious 2BHK facing Park" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea name="description" id="description" rows={5} placeholder="Highlight features..." className="bg-background resize-none max-h-52" required />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                  <MapPin className="h-4 w-4" /> Location
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input name="address" id="address" placeholder="House No, Street, Landmark" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input name="city" id="city" placeholder="City" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input name="state" id="state" placeholder="State" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input name="zipCode" id="zipCode" placeholder="123456" type="number" min="0" required />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                  <IndianRupee className="h-4 w-4" /> Pricing & Dates
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Monthly Rent (₹)</Label>
                    <Input name="price" id="price" type="number" placeholder="0.00" min="0" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moveInAvailableFrom">Available From</Label>
                    <Input name="moveInAvailableFrom" id="moveInAvailableFrom" type="date" className="block" required />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                  <Settings className="h-4 w-4" /> Specifications
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input name="bedrooms" id="bedrooms" type="number" min="0" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input name="bathrooms" id="bathrooms" type="number" min="0" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (Sq Ft)</Label>
                    <Input name="area" id="area" type="number" min="0" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="pg">PG</SelectItem>
                        <SelectItem value="hostel">Hostel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Furnishing</Label>
                    <Select value={furnishing} onValueChange={setFurnishing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="furnished">Furnished</SelectItem>
                        <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                        <SelectItem value="unfurnished">Unfurnished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Parking</Label>
                  <Select value={parking} onValueChange={setParking}>
                    <SelectTrigger>
                      <SelectValue placeholder="Parking availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="bike">Bike Only</SelectItem>
                      <SelectItem value="car_bike">Car & Bike</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((amenity) => {
                    const active = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
                          ${active ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:bg-accent"}`}
                      >
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Property Rules</Label>
                  <span className="text-xs text-muted-foreground">
                    {rules.length} {rules.length === 1 ? "rule" : "rules"} listed
                  </span>
                </div>

                <div className="flex gap-2">
                  <Input placeholder="e.g. No smoking inside, Quiet hours..." value={ruleInput} onChange={(e) => setRuleInput(e.target.value)} onKeyDown={handleRuleKeyDown} />
                  <Button type="button" variant="secondary" onClick={addRule} className="shrink-0">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>

                <div className="h-30 w-full rounded-md border bg-muted/10 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
                  {rules.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 space-y-2">
                      <ClipboardList className="h-8 w-8 opacity-40" />
                      <span className="text-sm font-medium">No rules added yet</span>
                      <span className="text-xs">Add constraints for tenants above</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[...rules].reverse().map((rule, index) => (
                        <div key={index} className="group flex items-center justify-between bg-background border px-3 py-2 rounded-md shadow-sm transition-all hover:border-primary/50">
                          <span className="text-sm text-foreground/90">{rule}</span>
                          <button type="button" onClick={() => removeRule(index)} className="cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1 rounded-md transition-colors opacity-70 group-hover:opacity-100">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold">Move-In Terms</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="securityDeposit">Security Deposit (₹)</Label>
                    <Input name="securityDeposit" id="securityDeposit" type="number" placeholder="0" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaseDurationMonths">Lease Duration (months)</Label>
                    <Input name="leaseDurationMonths" id="leaseDurationMonths" type="number" placeholder="11" min="1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agreementText">Agreement Text</Label>
                  <Textarea name="agreementText" id="agreementText" rows={4} placeholder="Enter lease agreement terms and conditions..." className="bg-background resize-none max-h-52" />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Property Images</Label>

                <div className="grid gap-4">
                  <label className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition rounded-xl h-20 flex flex-col items-center justify-center cursor-pointer bg-muted/10">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium text-muted-foreground">Click to upload photos</span>
                    <span className="text-xs text-muted-foreground/70">JPG, PNG (Max 5MB)</span>
                    <Input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {images.map((img, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border aspect-square">
                          <img src={img.preview} alt="preview" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 cursor-pointer bg-destructive/90 hover:bg-destructive text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/20 p-6 border-t flex justify-end gap-4">
            <Button className="cursor-pointer" type="submit" name="action" value="draft" variant="outline" disabled={loading}>
              Save as Draft
            </Button>

            <Button className="cursor-pointer" type="submit" name="action" value="review" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Submit for Review"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default OwnerCreateListing;
