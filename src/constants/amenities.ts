import { Ionicons } from "@expo/vector-icons";

type IconName = keyof typeof Ionicons.glyphMap;

export const AMENITY_GROUPS = [
    { key: "essentials", title: "Essentials" },
    { key: "comfort", title: "Comfort" },
    { key: "entertainment", title: "Entertainment & work" },
    { key: "safety", title: "Safety & building" },
] as const;

export type AmenityGroupKey = (typeof AMENITY_GROUPS)[number]["key"];

// The ids are what we save (in the draft now, in listings.amenities later), so never rename one once
// listings exist. Labels and icons can change freely. Ids match the ones used in the seed data.
// To add an amenity: add one line here. Nothing else needs to change.
export const AMENITIES = [
    { id: "wifi", label: "Wifi", icon: "wifi-outline", group: "essentials" },
    { id: "hot_shower", label: "Hot water", icon: "flame-outline", group: "essentials" },
    { id: "water_24h", label: "24/7 water", icon: "water-outline", group: "essentials" },
    { id: "backup_power", label: "Backup power", icon: "flash-outline", group: "essentials" },
    { id: "kitchen", label: "Kitchen", icon: "restaurant-outline", group: "essentials" },
    { id: "fridge", label: "Refrigerator", icon: "snow-outline", group: "essentials" },

    { id: "laundry", label: "Washing machine", icon: "shirt-outline", group: "comfort" },
    { id: "bedding", label: "Bed linen & towels", icon: "bed-outline", group: "comfort" },
    { id: "mosquito_net", label: "Mosquito net", icon: "bug-outline", group: "comfort" },
    { id: "balcony", label: "Balcony", icon: "sunny-outline", group: "comfort" },

    { id: "tv", label: "TV", icon: "tv-outline", group: "entertainment" },
    { id: "streaming", label: "Netflix / DStv / Showmax", icon: "play-circle-outline", group: "entertainment" },
    { id: "workspace", label: "Workspace", icon: "laptop-outline", group: "entertainment" },

    { id: "security", label: "24/7 security", icon: "shield-checkmark-outline", group: "safety" },
    { id: "cctv", label: "CCTV", icon: "videocam-outline", group: "safety" },
    { id: "gated", label: "Gated compound", icon: "lock-closed-outline", group: "safety" },
    { id: "parking", label: "Parking", icon: "car-outline", group: "safety" },
    { id: "lift", label: "Lift", icon: "arrow-up-circle-outline", group: "safety" },
    { id: "gym", label: "Gym", icon: "barbell-outline", group: "safety" },
] as const satisfies readonly { id: string; label: string; icon: IconName; group: AmenityGroupKey }[];

export type AmenityId = (typeof AMENITIES)[number]["id"];