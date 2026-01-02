import { TokenColor } from "@galaxore/shared";

export type CardLevel = 1 | 2 | 3;

export type TokenPayment = Partial<Record<TokenColor, number>>;
