import { TokenColor } from "@local-splendor/shared";

export type CardLevel = 1 | 2 | 3;

export type TokenPayment = Partial<Record<TokenColor, number>>;
