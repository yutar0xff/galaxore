import { GemColor, TokenColor } from "@local-splendor/shared";

// Import gem images
import rubyImg from "../assets/gems/ruby.png";
import emeraldImg from "../assets/gems/emerald.png";
import sapphireImg from "../assets/gems/sapphire.png";
import diamondImg from "../assets/gems/diamond.png";
import onyxImg from "../assets/gems/onyx.png";
import goldImg from "../assets/gems/gold.png";

// Import 5-gem images
import ruby5Img from "../assets/gems/ruby5.png";
import emerald5Img from "../assets/gems/emerald5.png";
import sapphire5Img from "../assets/gems/sapphire5.png";
import diamond5Img from "../assets/gems/diamond5.png";
import onyx5Img from "../assets/gems/onyx5.png";

// Define gem order for consistent display (ruby -> emerald -> sapphire -> diamond -> onyx -> gold)
export const GEM_ORDER: GemColor[] = [
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

// Gem border colors
export const GEM_BORDER_COLORS: Record<GemColor, string> = {
  emerald: "border-green-700",
  sapphire: "border-blue-700",
  ruby: "border-red-700",
  diamond: "border-gray-400",
  onyx: "border-gray-600",
};

// Extended border colors including gold
export const GEM_BORDER_COLORS_WITH_GOLD: Record<TokenColor, string> = {
  ...GEM_BORDER_COLORS,
  gold: "border-yellow-600",
};

// Map colors to their images (includes gold for TokenColor)
export const GEM_IMAGES: Record<TokenColor, string> = {
  ruby: rubyImg,
  emerald: emeraldImg,
  sapphire: sapphireImg,
  diamond: diamondImg,
  onyx: onyxImg,
  gold: goldImg,
};

// Map colors to their 5-gem images (only for GemColor, not gold)
export const GEM_5_IMAGES: Partial<Record<GemColor, string>> = {
  ruby: ruby5Img,
  emerald: emerald5Img,
  sapphire: sapphire5Img,
  diamond: diamond5Img,
  onyx: onyx5Img,
};

// Gem background colors (for fallback when image is not available)
export const GEM_COLORS: Record<GemColor, string> = {
  emerald: "bg-green-500",
  sapphire: "bg-blue-500",
  ruby: "bg-red-500",
  diamond: "bg-gray-100",
  onyx: "bg-gray-800",
};
