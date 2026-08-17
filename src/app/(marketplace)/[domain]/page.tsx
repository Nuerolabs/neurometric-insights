"use client";

import React, { useState, useMemo } from "react";
import {
  MOCK_INVENTORY,
  getDealershipByDomain,
  REGIONS_LIST,
  BRANDS_LIST,
  BODY_TYPES,
  FUEL_TYPES,
  Vehicle,
} from "@/lib/mocks";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Gauge,
  Fuel,
  ShieldCheck,
  Award,
  Sparkles,
  Phone,
  MessageCircle,
  Clock,
  Heart,
  Share2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar,
  Zap,
  Building2,
  Grid,
  List,
  Star,
  DollarSign,
  Calculator,
  ArrowRight,
  Filter,
  Check,
  Car as CarIcon,
  X,
} from "lucide-react";

import { useParams } from "react-router-dom";

interface MarketplacePageProps {
  params?: {
    domain?: string;
  };
}

export default function MarketplacePage({ params }: MarketplacePageProps) {
  // Extract domain parameter from Next.js params or React Router useParams fallback
  let routeDomain: string | undefined;
  try {
    const routerParams = useParams<{ domain?: string }>();
    routeDomain = routerParams?.domain;
  } catch {
    // Outside react-router context
  }

  const domainParam = params?.domain || routeDomain || "prestige";
  const dealer = useMemo(() => getDealershipByDomain(domainParam), [domainParam]);

  // Currency selector state
  const [currency, setCurrency] = useState<"USD" | "COP">("USD");
  const USD_TO_COP_RATE = 3900;

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Todas las Regiones");
  const [selectedBrand, setSelectedBrand] = useState("Todas las Marcas");
  const [selectedBodyType, setSelectedBodyType] = useState("Todos");
  const [selectedFuelType, setSelectedFuelType] = useState("Todos");
  const [selectedTransmission, setSelectedTransmission] = useState("Todos");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 160000]);
  const [minYear, setMinYear] = useState<number>(2020);
  const [onlyCertified, setOnlyCertified] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Interaction states
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<Vehicle | null>(null);
  const [activeImageIndexMap, setActiveImageIndexMap] = useState<Record<string, number>>({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Loan calculator inside modal
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [loanTermMonths, setLoanTermMonths] = useState(48);

  // Toggle favorite
  const toggleFavorite = (carId: string) => {
    setFavorites((prev) =>
      prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]
    );
  };

  // Image slider navigation per card
  const handlePrevImage = (e: React.MouseEvent, car: Vehicle) => {
    e.stopPropagation();
    const currentIndex = activeImageIndexMap[car.id] || 0;
    const prevIndex = (currentIndex - 1 + car.images.length) % car.images.length;
    setActiveImageIndexMap((prev) => ({ ...prev, [car.id]: prevIndex }));
  };

  const handleNextImage = (e: React.MouseEvent, car: Vehicle) => {
    e.stopPropagation();
    const currentIndex = activeImageIndexMap[car.id] || 0;
    const nextIndex = (currentIndex + 1) % car.images.length;
    setActiveImageIndexMap((prev) => ({ ...prev, [car.id]: nextIndex }));
  };

  // Format currency helpers
  const formatPrice = (usdAmount: number) => {
    if (currency === "COP") {
      const copAmount = usdAmount * USD_TO_COP_RATE;
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(copAmount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(usdAmount);
  };

  const formatMonthlyEstimate = (monthlyUsd: number) => {
    if (currency === "COP") {
      const copAmount = monthlyUsd * USD_TO_COP_RATE;
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(copAmount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(monthlyUsd);
  };

  // Generate WhatsApp Inquiry Link
  const buildWhatsAppLink = (vehicle: Vehicle) => {
    const phoneNumber = vehicle.dealer?.whatsappPhone || dealer.whatsappPhone;
    const message = `¡Hola! 👋 Vengo desde el marketplace de *${dealer.name}*.
Estoy interesado en el siguiente vehículo:
🚗 *${vehicle.year} ${vehicle.brand} ${vehicle.model}* (${vehicle.trim || "Versión Estándar"})
💰 Precio: ${formatPrice(vehicle.price)}
📍 Ubicación: ${vehicle.city}
🔢 VIN: ${vehicle.vin}

¿Podrían confirmarme si aún sigue disponible y coordinar una asesoría / prueba de manejo? ¡Muchas gracias!`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRegion("Todas las Regiones");
    setSelectedBrand("Todas las Marcas");
    setSelectedBodyType("Todos");
    setSelectedFuelType("Todos");
    setSelectedTransmission("Todos");
    setPriceRange([0, 160000]);
    setMinYear(2020);
    setOnlyCertified(false);
    setSortBy("featured");
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== "") count++;
    if (selectedRegion !== "Todas las Regiones") count++;
    if (selectedBrand !== "Todas las Marcas") count++;
    if (selectedBodyType !== "Todos") count++;
    if (selectedFuelType !== "Todos") count++;
    if (selectedTransmission !== "Todos") count++;
    if (priceRange[0] > 0 || priceRange[1] < 160000) count++;
    if (minYear > 2020) count++;
    if (onlyCertified) count++;
    return count;
  }, [
    searchQuery,
    selectedRegion,
    selectedBrand,
    selectedBodyType,
    selectedFuelType,
    selectedTransmission,
    priceRange,
    minYear,
    onlyCertified,
  ]);

  // Filtered & Sorted Inventory
  const filteredVehicles = useMemo(() => {
    return MOCK_INVENTORY.filter((car) => {
      // Search query (brand, model, trim, vin, city)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullTitle = `${car.year} ${car.brand} ${car.model} ${car.trim || ""} ${car.vin} ${car.city}`.toLowerCase();
        if (!fullTitle.includes(q)) return false;
      }

      // Region
      if (selectedRegion !== "Todas las Regiones" && car.region !== selectedRegion) {
        return false;
      }

      // Brand
      if (selectedBrand !== "Todas las Marcas" && car.brand !== selectedBrand) {
        return false;
      }

      // Body Type
      if (selectedBodyType !== "Todos" && car.bodyType !== selectedBodyType) {
        return false;
      }

      // Fuel Type
      if (selectedFuelType !== "Todos" && car.fuelType !== selectedFuelType) {
        return false;
      }

      // Transmission
      if (
        selectedTransmission !== "Todos" &&
        !car.transmission.toLowerCase().includes(selectedTransmission.toLowerCase())
      ) {
        return false;
      }

      // Price Range
      if (car.price < priceRange[0] || car.price > priceRange[1]) {
        return false;
      }

      // Year
      if (car.year < minYear) {
        return false;
      }

      // Only Certified
      if (onlyCertified && car.condition !== "Seminuevo Certificado") {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "year-desc") return b.year - a.year;
      if (sortBy === "mileage-asc") return a.mileage - b.mileage;
      if (sortBy === "inspection-desc") return b.inspectionScore - a.inspectionScore;
      // Default: featured first, then newest
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.year - a.year;
    });
  }, [
    searchQuery,
    selectedRegion,
    selectedBrand,
    selectedBodyType,
    selectedFuelType,
    selectedTransmission,
    priceRange,
    minYear,
    onlyCertified,
    sortBy,
  ]);

  // Brand vehicle counts for sidebar pills
  const brandCounts = useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_INVENTORY.forEach((car) => {
      map[car.brand] = (map[car.brand] || 0) + 1;
    });
    return map;
  }, []);

  // Quick Preset Filters for Hero
  const applyQuickFilter = (type: "porsche" | "bmw" | "hybrid" | "under60k" | "suv") => {
    resetFilters();
    if (type === "porsche") setSelectedBrand("Porsche");
    if (type === "bmw") setSelectedBrand("BMW");
    if (type === "hybrid") setSelectedFuelType("Híbrido");
    if (type === "under60k") setPriceRange([0, 60000]);
    if (type === "suv") setSelectedBodyType("SUV");
  };

  // Financing calculation for modal
  const calculatedLoan = useMemo(() => {
    if (!selectedVehicleForModal) return { downPayment: 0, loanAmount: 0, monthlyQuota: 0 };
    const price = selectedVehicleForModal.price;
    const downPayment = (price * downPaymentPercent) / 100;
    const loanAmount = price - downPayment;
    const annualInterestRate = 0.095; // 9.5% TEA approx
    const monthlyRate = annualInterestRate / 12;
    const monthlyQuota =
      loanAmount > 0
        ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) /
          (Math.pow(1 + monthlyRate, loanTermMonths) - 1)
        : 0;

    return {
      downPayment,
      loanAmount,
      monthlyQuota: Math.round(monthlyQuota),
    };
  }, [selectedVehicleForModal, downPaymentPercent, loanTermMonths]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* ────────────────────────────────────────────────────── */}
      {/* TOP CORPORATE TRUST BAR */}
      {/* ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Dealership Identity */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm ring-1 ring-slate-900/10">
              <CarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-950">
                  {dealer.name}
                </span>
                <Badge
                  variant="outline"
                  className="hidden items-center gap-1 border-slate-300 bg-slate-100 px-1.5 py-0 text-[10px] font-semibold text-slate-700 sm:inline-flex"
                >
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Verificado
                </Badge>
              </div>
              <p className="hidden text-xs text-slate-500 md:block">{dealer.tagline}</p>
            </div>
          </div>

          {/* Quick Actions & Currency Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Currency selector toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setCurrency("USD")}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  currency === "USD"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency("COP")}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  currency === "COP"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                COP ($)
              </button>
            </div>

            {/* Saved Favorites Pill */}
            {favorites.length > 0 && (
              <Badge
                variant="secondary"
                className="hidden items-center gap-1 bg-red-50 text-red-700 border-red-200 px-2.5 py-1 text-xs font-medium sm:inline-flex"
              >
                <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                <span>{favorites.length} Guardados</span>
              </Badge>
            )}

            {/* Direct WhatsApp Callout in Header */}
            <a
              href={`https://wa.me/${dealer.whatsappPhone}?text=${encodeURIComponent(
                `Hola ${dealer.name}, me gustaría recibir información sobre su catálogo de vehículos disponibles.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <MessageCircle className="h-4 w-4 fill-white text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp Directo</span>
              <span className="sm:hidden">Chat</span>
            </a>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────── */}
      {/* HERO SECTION */}
      {/* ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-12 lg:py-16">
        {/* Subtle geometric luxury background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-slate-100/80 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 h-64 w-64 rounded-full bg-slate-200/40 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Heading & Information */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm mb-4">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Marketplace Oficial B2C &bull; Garantía 100% Certificada</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Encuentra tu próximo vehículo con{" "}
                <span className="underline decoration-slate-400 decoration-2 underline-offset-4">
                  confianza total
                </span>
                .
              </h1>

              <p className="mt-4 text-base text-slate-600 sm:text-lg max-w-2xl leading-relaxed">
                Inspección pericial de 150 puntos, historial de mantenimientos garantizado,
                financiación pre-aprobada en minutos y entrega inmediata en todo el país.
              </p>

              {/* Live Search Input Bar */}
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por marca, modelo, línea o año..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 pl-10 pr-4 text-sm bg-slate-50/90 border-slate-300 rounded-lg shadow-inner focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => {
                    const gridElement = document.getElementById("inventory-grid");
                    gridElement?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="h-12 bg-slate-950 hover:bg-slate-800 text-white font-semibold px-6 shadow-md rounded-lg"
                >
                  Explorar ({filteredVehicles.length})
                </Button>
              </div>

              {/* Quick Tags / Fast Filters */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Filtros rápidos:</span>
                <button
                  onClick={() => applyQuickFilter("porsche")}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition"
                >
                  Porsche ({brandCounts["Porsche"] || 0})
                </button>
                <button
                  onClick={() => applyQuickFilter("bmw")}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition"
                >
                  BMW ({brandCounts["BMW"] || 0})
                </button>
                <button
                  onClick={() => applyQuickFilter("hybrid")}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800 hover:bg-emerald-100 transition"
                >
                  🌱 Híbridos & Eléctricos
                </button>
                <button
                  onClick={() => applyQuickFilter("suv")}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition"
                >
                  SUVs
                </button>
                <button
                  onClick={() => applyQuickFilter("under60k")}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition"
                >
                  Menos de $60K
                </button>
              </div>
            </div>

            {/* Right Column: Dealership Trust Matrix Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-6 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Concesionario Verificado
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{dealer.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-amber-800 border border-amber-200">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold">{dealer.rating}</span>
                    <span className="text-[10px] text-amber-700">({dealer.reviewsCount})</span>
                  </div>
                </div>

                {/* 4 Pillars Stats Grid */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span className="text-[11px] font-medium">Peritaje</span>
                    </div>
                    <p className="mt-1 text-lg font-bold text-slate-950">150 Puntos</p>
                    <p className="text-[10px] text-slate-500">Inspección técnica certificada</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Award className="h-4 w-4 text-slate-900" />
                      <span className="text-[11px] font-medium">Garantía</span>
                    </div>
                    <p className="mt-1 text-lg font-bold text-slate-950">12 Meses</p>
                    <p className="text-[10px] text-slate-500">Cobertura mecánica directa</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Zap className="h-4 w-4 text-amber-600" />
                      <span className="text-[11px] font-medium">Crédito</span>
                    </div>
                    <p className="mt-1 text-lg font-bold text-slate-950">24 Horas</p>
                    <p className="text-[10px] text-slate-500">Aprobación bancaria exprés</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-[11px] font-medium">Respuesta</span>
                    </div>
                    <p className="mt-1 text-lg font-bold text-slate-950">&lt; 5 min</p>
                    <p className="text-[10px] text-slate-500">Asesor directo vía WhatsApp</p>
                  </div>
                </div>

                {/* Dealership Info Footer */}
                <div className="mt-4 flex items-center justify-between pt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{dealer.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>{dealer.businessHours.split("|")[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT AREA: SIDEBAR FILTERS & CARS GRID */}
      {/* ────────────────────────────────────────────────────── */}
      <main id="inventory-grid" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Top Control Bar: Mobile Filter Button, Sort Selector, Results Count */}
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger for Filters */}
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-slate-300 bg-white text-slate-800 lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filtros</span>
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-1 h-5 w-5 rounded-full bg-slate-950 p-0 text-[10px] text-white flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] sm:w-[400px] overflow-y-auto bg-white p-6">
                <SheetHeader className="text-left border-b border-slate-200 pb-4">
                  <SheetTitle className="text-lg font-bold text-slate-950 flex items-center justify-between">
                    <span>Filtros de Búsqueda</span>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="text-xs font-normal text-slate-500 hover:text-slate-900 underline"
                      >
                        Restablecer ({activeFiltersCount})
                      </button>
                    )}
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Filter Controls */}
                <div className="mt-6 space-y-6">
                  {/* Region Filter */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Región / Ciudad
                    </Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="mt-1.5 h-10 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Selecciona región" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS_LIST.map((reg) => (
                          <SelectItem key={reg} value={reg}>
                            {reg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Marca
                    </Label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger className="mt-1.5 h-10 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Selecciona marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANDS_LIST.map((br) => (
                          <SelectItem key={br} value={br}>
                            {br}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Slider */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Precio Máximo (USD)
                      </Label>
                      <span className="text-xs font-bold text-slate-900">
                        {formatPrice(priceRange[1])}
                      </span>
                    </div>
                    <Slider
                      value={[priceRange[1]]}
                      min={30000}
                      max={160000}
                      step={5000}
                      onValueChange={(val) => setPriceRange([0, val[0]])}
                      className="mt-3"
                    />
                  </div>

                  {/* Body Type */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Carrocería
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {BODY_TYPES.map((bt) => (
                        <button
                          key={bt}
                          onClick={() => setSelectedBodyType(bt)}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                            selectedBodyType === bt
                              ? "bg-slate-950 text-white"
                              : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {bt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Combustible
                    </Label>
                    <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
                      <SelectTrigger className="mt-1.5 h-10 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Selecciona combustible" />
                      </SelectTrigger>
                      <SelectContent>
                        {FUEL_TYPES.map((fuel) => (
                          <SelectItem key={fuel} value={fuel}>
                            {fuel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <SheetFooter className="mt-8 border-t border-slate-200 pt-4">
                  <Button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full bg-slate-950 text-white font-semibold"
                  >
                    Ver Resultados ({filteredVehicles.length})
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Mostrando <span className="font-bold">{filteredVehicles.length}</span> vehículos
                disponibles
              </p>
              {activeFiltersCount > 0 && (
                <p className="text-xs text-slate-500">
                  Filtros activos aplicados ({activeFiltersCount})
                </p>
              )}
            </div>
          </div>

          {/* Sort & View Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-select" className="text-xs font-medium text-slate-500 hidden sm:block">
                Ordenar por:
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-select" className="h-9 w-[180px] bg-white border-slate-200 text-xs font-medium">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Destacados</SelectItem>
                  <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                  <SelectItem value="year-desc">Año: Más Reciente</SelectItem>
                  <SelectItem value="mileage-asc">Menor Kilometraje</SelectItem>
                  <SelectItem value="inspection-desc">Score de Peritaje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grid / List View Toggle */}
            <div className="hidden sm:flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${
                  viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Vista de Cuadrícula"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${
                  viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Vista de Lista"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar (Desktop) + Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ────────────────────────────────────────────────────── */}
          {/* DESKTOP FILTERS SIDEBAR */}
          {/* ────────────────────────────────────────────────────── */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-6">
              {/* Header with Clear Action */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-slate-900" />
                  <h3 className="text-sm font-bold text-slate-900">Filtros Avanzados</h3>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Limpiar
                  </button>
                )}
              </div>

              {/* 1. Region Filter */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Región / Ciudad
                </Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="mt-1.5 h-9 bg-slate-50 border-slate-200 text-xs">
                    <SelectValue placeholder="Seleccionar región" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS_LIST.map((reg) => (
                      <SelectItem key={reg} value={reg} className="text-xs">
                        {reg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Brand Filter with Pills / Counts */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Marca
                </Label>
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => setSelectedBrand("Todas las Marcas")}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      selectedBrand === "Todas las Marcas"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>Todas las Marcas</span>
                    <span className="text-[11px] opacity-70">{MOCK_INVENTORY.length}</span>
                  </button>
                  {BRANDS_LIST.filter((b) => b !== "Todas las Marcas").map((brand) => {
                    const count = brandCounts[brand] || 0;
                    if (count === 0) return null;
                    return (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                          selectedBrand === brand
                            ? "bg-slate-900 text-white font-semibold"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span>{brand}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                            selectedBrand === brand
                              ? "bg-slate-800 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Price Range Slider */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Precio Máximo
                  </Label>
                  <span className="text-xs font-bold text-slate-900">
                    {formatPrice(priceRange[1])}
                  </span>
                </div>
                <Slider
                  value={[priceRange[1]]}
                  min={30000}
                  max={160000}
                  step={5000}
                  onValueChange={(val) => setPriceRange([0, val[0]])}
                  className="mt-3"
                />
                <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                  <span>$30k</span>
                  <span>$80k</span>
                  <span>$160k+</span>
                </div>
              </div>

              {/* 4. Body Type */}
              <div className="border-t border-slate-100 pt-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tipo de Carrocería
                </Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {BODY_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedBodyType(type)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                        selectedBodyType === type
                          ? "bg-slate-900 text-white shadow-xs"
                          : "border border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Fuel Type */}
              <div className="border-t border-slate-100 pt-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Combustible
                </Label>
                <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
                  <SelectTrigger className="mt-1.5 h-9 bg-slate-50 border-slate-200 text-xs">
                    <SelectValue placeholder="Tipo de combustible" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((fuel) => (
                      <SelectItem key={fuel} value={fuel} className="text-xs">
                        {fuel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 6. Only Certified Toggle */}
              <div className="border-t border-slate-100 pt-4">
                <label className="flex items-center justify-between cursor-pointer rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800">
                      Solo Certificados
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlyCertified}
                    onChange={(e) => setOnlyCertified(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                </label>
              </div>
            </div>
          </aside>

          {/* ────────────────────────────────────────────────────── */}
          {/* CARS GRID / LIST */}
          {/* ────────────────────────────────────────────────────── */}
          <div className="lg:col-span-9">
            {/* Active filter badges */}
            {activeFiltersCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Filtros:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1 bg-slate-200 text-slate-800 text-xs">
                    "{searchQuery}"
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
                {selectedRegion !== "Todas las Regiones" && (
                  <Badge variant="secondary" className="gap-1 bg-slate-200 text-slate-800 text-xs">
                    {selectedRegion}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedRegion("Todas las Regiones")}
                    />
                  </Badge>
                )}
                {selectedBrand !== "Todas las Marcas" && (
                  <Badge variant="secondary" className="gap-1 bg-slate-200 text-slate-800 text-xs">
                    {selectedBrand}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedBrand("Todas las Marcas")}
                    />
                  </Badge>
                )}
                {selectedBodyType !== "Todos" && (
                  <Badge variant="secondary" className="gap-1 bg-slate-200 text-slate-800 text-xs">
                    {selectedBodyType}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedBodyType("Todos")}
                    />
                  </Badge>
                )}
                {selectedFuelType !== "Todos" && (
                  <Badge variant="secondary" className="gap-1 bg-slate-200 text-slate-800 text-xs">
                    {selectedFuelType}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedFuelType("Todos")}
                    />
                  </Badge>
                )}
                {onlyCertified && (
                  <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-800 text-xs">
                    Certificados
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setOnlyCertified(false)} />
                  </Badge>
                )}
                <button
                  onClick={resetFilters}
                  className="text-xs text-slate-500 hover:text-slate-900 underline ml-2"
                >
                  Borrar todos
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredVehicles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                <CarIcon className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  No encontramos vehículos con estos filtros
                </h3>
                <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                  Prueba ajustando el rango de precio, cambiando la ubicación o eliminando los filtros seleccionados.
                </p>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="mt-6 border-slate-300 text-slate-800 font-semibold"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restablecer todos los filtros
                </Button>
              </div>
            ) : (
              /* Vehicle Cards Container */
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                    : "space-y-4"
                }
              >
                {filteredVehicles.map((car) => {
                  const currentImgIdx = activeImageIndexMap[car.id] || 0;
                  const isFav = favorites.includes(car.id);
                  const isList = viewMode === "list";

                  return (
                    <Card
                      key={car.id}
                      className={`group overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300 flex flex-col justify-between ${
                        isList ? "sm:flex-row sm:items-stretch" : ""
                      }`}
                    >
                      {/* Photo Gallery Container */}
                      <div
                        className={`relative overflow-hidden bg-slate-900 ${
                          isList ? "sm:w-80 shrink-0 h-56 sm:h-auto" : "h-52 w-full"
                        }`}
                      >
                        <img
                          src={car.images[currentImgIdx] || car.images[0]}
                          alt={`${car.brand} ${car.model}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Top Badges Overlay */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                          {car.badge && (
                            <span className="rounded-md bg-slate-950/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              {car.badge}
                            </span>
                          )}
                          {car.fuelType === "Híbrido" || car.fuelType === "Eléctrico" ? (
                            <span className="rounded-md bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              🌱 {car.fuelType}
                            </span>
                          ) : null}
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(car.id);
                          }}
                          className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-slate-700 shadow-sm transition hover:bg-white hover:text-red-500"
                          aria-label="Guardar vehículo"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isFav ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                        </button>

                        {/* Image Arrow Switchers (on hover) */}
                        {car.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => handlePrevImage(e, car)}
                              className="absolute left-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleNextImage(e, car)}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                            {/* Dot indicators */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                              {car.images.map((_, idx) => (
                                <span
                                  key={idx}
                                  className={`h-1.5 rounded-full transition-all ${
                                    idx === currentImgIdx
                                      ? "w-4 bg-white"
                                      : "w-1.5 bg-white/50"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Card Content & Details */}
                      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                        <div>
                          {/* Location & Year */}
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {car.city}
                            </span>
                            <span className="font-semibold text-slate-700">{car.year}</span>
                          </div>

                          {/* Vehicle Title */}
                          <h3 className="text-base font-bold text-slate-950 line-clamp-1 group-hover:text-slate-800 transition">
                            {car.brand} {car.model}
                          </h3>
                          {car.trim && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {car.trim}
                            </p>
                          )}

                          {/* Quick Specs Grid (Mileage, Transmission, Fuel, Engine) */}
                          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-b border-slate-100 py-2.5 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Gauge className="h-3.5 w-3.5 text-slate-400" />
                              <span>{car.mileage.toLocaleString()} km</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-slate-400" />
                              <span className="truncate">{car.transmission}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Fuel className="h-3.5 w-3.5 text-slate-400" />
                              <span>{car.fuelType}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="font-semibold text-slate-900">
                                {car.inspectionScore}/100 Peritaje
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Action Buttons */}
                        <div className="mt-4 pt-2">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Precio Contado
                              </p>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-extrabold text-slate-950">
                                  {formatPrice(car.price)}
                                </span>
                                {car.originalPrice && car.originalPrice > car.price && (
                                  <span className="text-xs text-slate-400 line-through">
                                    {formatPrice(car.originalPrice)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-[10px] text-slate-500">Estimado Mensual</p>
                              <p className="text-xs font-semibold text-slate-700">
                                {formatMonthlyEstimate(car.monthlyEstimate)}/mes
                              </p>
                            </div>
                          </div>

                          {/* CTAs: WhatsApp Primary + Technical Sheet Dialog Trigger */}
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            {/* Technical Sheet / Detail Modal */}
                            <Button
                              variant="outline"
                              onClick={() => setSelectedVehicleForModal(car)}
                              className="h-10 text-xs font-semibold border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:text-slate-950"
                            >
                              Ver Ficha
                            </Button>

                            {/* 'Info / Buy via WhatsApp' Primary Button */}
                            <a
                              href={buildWhatsAppLink(car)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
                            >
                              <MessageCircle className="h-4 w-4 fill-white text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ────────────────────────────────────────────────────── */}
      {/* VEHICLE TECHNICAL SPECIFICATIONS & FINANCE MODAL */}
      {/* ────────────────────────────────────────────────────── */}
      <Dialog
        open={Boolean(selectedVehicleForModal)}
        onOpenChange={(open) => !open && setSelectedVehicleForModal(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-0 sm:rounded-2xl">
          {selectedVehicleForModal && (
            <div>
              {/* Header Gallery & Main Banner */}
              <div className="relative h-64 sm:h-80 w-full bg-slate-950">
                <img
                  src={selectedVehicleForModal.images[0]}
                  alt={`${selectedVehicleForModal.brand} ${selectedVehicleForModal.model}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-emerald-600 text-white font-bold text-xs">
                      {selectedVehicleForModal.condition}
                    </Badge>
                    <span className="text-xs text-slate-300 font-medium">
                      VIN: {selectedVehicleForModal.vin}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold">
                    {selectedVehicleForModal.year} {selectedVehicleForModal.brand}{" "}
                    {selectedVehicleForModal.model}
                  </h2>
                  <p className="text-sm text-slate-300">{selectedVehicleForModal.trim}</p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-6">
                {/* Price & Summary Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Precio de Venta
                    </span>
                    <p className="text-2xl font-extrabold text-slate-950">
                      {formatPrice(selectedVehicleForModal.price)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedVehicleForModal.plateEnding || "Documentación lista para traspaso"}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-0 flex gap-2">
                    <a
                      href={buildWhatsAppLink(selectedVehicleForModal)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
                    >
                      <MessageCircle className="h-4 w-4 fill-white text-emerald-600" />
                      Comprar / Agendar Test Drive
                    </a>
                  </div>
                </div>

                {/* Technical Specifications Grid */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-slate-700" />
                    Especificaciones Mecánicas
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <span className="text-slate-500">Motor</span>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {selectedVehicleForModal.specs.engine}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <span className="text-slate-500">Potencia</span>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {selectedVehicleForModal.specs.horsepower} HP
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <span className="text-slate-500">Aceleración (0-100)</span>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {selectedVehicleForModal.specs.acceleration}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <span className="text-slate-500">Tracción</span>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {selectedVehicleForModal.specs.traction}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <span className="text-slate-500">Transmisión</span>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {selectedVehicleForModal.transmission}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <span className="text-slate-500">Kilometraje Real</span>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {selectedVehicleForModal.mileage.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Equipment Highlights */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-700" />
                    Equipamiento Destacado
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedVehicleForModal.keyFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 border border-slate-100"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-slate-700 font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Simulator */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-slate-700" />
                      Simulador de Cuota Financiera
                    </h4>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Tasa Preferencial Aliada
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Cuota Inicial: {downPaymentPercent}%</span>
                        <span className="font-bold text-slate-950">
                          {formatPrice(calculatedLoan.downPayment)}
                        </span>
                      </div>
                      <Slider
                        value={[downPaymentPercent]}
                        min={10}
                        max={60}
                        step={5}
                        onValueChange={(val) => setDownPaymentPercent(val[0])}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Plazo: {loanTermMonths} Meses</span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        {[24, 36, 48, 60].map((term) => (
                          <button
                            key={term}
                            onClick={() => setLoanTermMonths(term)}
                            className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                              loanTermMonths === term
                                ? "bg-slate-950 text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {term}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-xs text-slate-600 font-medium">
                      Cuota Mensual Estimada:
                    </span>
                    <span className="text-lg font-extrabold text-slate-950">
                      {formatPrice(calculatedLoan.monthlyQuota)} / mes
                    </span>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={buildWhatsAppLink(selectedVehicleForModal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
                  >
                    <MessageCircle className="h-5 w-5 fill-white text-emerald-600" />
                    Hablar con un Asesor por WhatsApp
                  </a>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedVehicleForModal(null)}
                    className="border-slate-300 text-slate-700"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ────────────────────────────────────────────────────── */}
      {/* CORPORATE TRUST FOOTER */}
      {/* ────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-12 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white">
                  <CarIcon className="h-4 w-4" />
                </div>
                <span className="text-base font-bold text-slate-950">{dealer.name}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Plataforma corporativa de compra, venta y retoma de vehículos seminuevos certificados
                con altos estándares de calidad e inspección rigurosa.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Garantías & Servicios
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Inspección Técnica 150 Puntos
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Garantía Mecánica 12 Meses
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Financiación con 6 Bancos Aliados
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Retoma de Tu Vehículo Usado
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Sedes & Cobertura
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>• Bogotá D.C. (Zona Norte & Calle 100)</li>
                <li>• Medellín (El Poblado & Llanogrande)</li>
                <li>• Cali (Ciudad Jardín)</li>
                <li>• Barranquilla & Eje Cafetero</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Contacto Inmediato
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Atención personalizada de asesores certificados de lunes a domingo.
              </p>
              <a
                href={`https://wa.me/${dealer.whatsappPhone}?text=${encodeURIComponent(
                  `Hola, deseo recibir asesoría para comprar un vehículo en ${dealer.name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
              >
                <MessageCircle className="h-4 w-4 fill-white text-emerald-600" />
                Contactar por WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} {dealer.name} &bull; Todos los derechos reservados &bull;
            Vehículos sujetos a disponibilidad previa venta.
          </div>
        </div>
      </footer>

      {/* Floating Sticky WhatsApp Button */}
      <a
        href={`https://wa.me/${dealer.whatsappPhone}?text=${encodeURIComponent(
          `Hola ${dealer.name}, estoy navegando en su catálogo y me gustaría hacer una consulta.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl ring-4 ring-white transition hover:scale-105 hover:bg-emerald-700"
        title="Hablar por WhatsApp"
      >
        <MessageCircle className="h-7 w-7 fill-white text-emerald-600" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
          1
        </span>
      </a>
    </div>
  );
}
