import { OreColor, TokenColor } from "@galaxore/shared";

// Import ore images
import rubyImg from "../assets/ores/ruby.png";
import emeraldImg from "../assets/ores/emerald.png";
import sapphireImg from "../assets/ores/sapphire.png";
import diamondImg from "../assets/ores/diamond.png";
import onyxImg from "../assets/ores/onyx.png";
import goldImg from "../assets/ores/gold.png";

// Import 5-ore images
import ruby5Img from "../assets/ores/ruby5.png";
import emerald5Img from "../assets/ores/emerald5.png";
import sapphire5Img from "../assets/ores/sapphire5.png";
import diamond5Img from "../assets/ores/diamond5.png";
import onyx5Img from "../assets/ores/onyx5.png";

// Define ore order for consistent display (ruby -> emerald -> sapphire -> diamond -> onyx -> gold)
export const ORE_ORDER: OreColor[] = [
  "ruby",
  "emerald",
  "sapphire",
  "diamond",
  "onyx",
];

// All token colors including gold
export const ALL_TOKEN_COLORS: TokenColor[] = [
  "ruby",
  "emerald",
  "sapphire",
  "diamond",
  "onyx",
  "gold",
];

// Ore border colors
export const ORE_BORDER_COLORS: Record<OreColor, string> = {
  emerald: "border-green-700",
  sapphire: "border-blue-700",
  ruby: "border-red-700",
  diamond: "border-gray-400",
  onyx: "border-gray-600",
};

// Extended border colors including gold
export const ORE_BORDER_COLORS_WITH_GOLD: Record<TokenColor, string> = {
  ...ORE_BORDER_COLORS,
  gold: "border-yellow-600",
};

// Map colors to their images (includes gold for TokenColor)
export const ORE_IMAGES: Record<TokenColor, string> = {
  ruby: rubyImg,
  emerald: emeraldImg,
  sapphire: sapphireImg,
  diamond: diamondImg,
  onyx: onyxImg,
  gold: goldImg,
};

// Map colors to their 5-ore images (only for OreColor, not gold)
export const ORE_5_IMAGES: Partial<Record<OreColor, string>> = {
  ruby: ruby5Img,
  emerald: emerald5Img,
  sapphire: sapphire5Img,
  diamond: diamond5Img,
  onyx: onyx5Img,
};

// Ore background colors (for fallback when image is not available)
export const ORE_COLORS: Record<OreColor, string> = {
  emerald: "bg-green-500",
  sapphire: "bg-blue-500",
  ruby: "bg-red-500",
  diamond: "bg-gray-100",
  onyx: "bg-gray-800",
};
