# 追加リファクタリング項目

## 1. 型安全性の向上

### 1.1 `Record<string, number>` の型統一
- **問題**: 複数箇所で `Record<string, number>` が使用されており、型安全性が低い
- **影響範囲**:
  - `PlayerController.tsx`: `tokenCounts`, `toDiscard`, `currentTokens`, `submitBuy` の `payment` パラメータ
  - `PaymentModal.tsx`: `tokenPayment`, `discount`, `initialPayment`
  - `ResourcesHeader.tsx`: `tokenCounts`
- **改善案**: `Record<TokenColor, number>` または `Partial<Record<TokenColor, number>>` に統一

### 1.2 `any` 型の削除
- **問題**: `PaymentModal.tsx` で `player.cards.forEach((c: any)` が使用されている
- **改善案**: 適切な型（`CardType`）を使用

### 1.3 未使用のimportの削除
- **問題**:
  - `PlayerController.tsx` で `GEM_COLORS` がimportされているが未使用
  - `PlayerController.tsx` で `wasReset` が取得されているが未使用
- **改善案**: 未使用のimportを削除

## 2. 重複コードの削除

### 2.1 `discount` 計算の共通化
- **問題**: `discount` の計算が複数箇所で重複
  - `utils/game.ts` の `canAffordCard` と `getMissingGems` で同じ計算
  - `PaymentModal.tsx` でも同じ計算
- **改善案**: `calculateDiscount(player: Player): Record<GemColor, number>` 関数を作成

### 2.2 `tokenCounts` 計算の共通化
- **問題**: `tokenCounts` の計算が複数箇所で重複
  - `PlayerController.tsx` の `Dashboard`
  - `ResourcesHeader.tsx`
- **改善案**: `calculateTokenCounts(player: Player): Record<TokenColor, number>` 関数を作成

### 2.3 `bonusCounts` 計算の統一
- **問題**: `bonusCounts` の計算が一部で直接計算されている
  - `PlayerController.tsx` の `Dashboard` で直接計算
  - `ResourcesHeader.tsx` で直接計算
- **改善案**: 既存の `calculateBonuses` 関数を使用

### 2.4 言語切り替えロジックの共通化
- **問題**: `changeLanguage` 関数が複数箇所で定義されている
  - `PlayerController.tsx`: `localStorage` に保存
  - `HostBoard.tsx`: `localStorage` に保存しない
  - `ControlsSection.tsx`: `localStorage` に保存しない
- **改善案**: `utils/i18n.ts` に共通関数を作成

### 2.5 `beforeunload` ハンドラーの共通化
- **問題**: `beforeunload` のハンドラーが `PlayerController.tsx` と `HostBoard.tsx` で重複
- **改善案**: カスタムフック `useBeforeUnload` を作成

### 2.6 不足宝石表示のコンポーネント化
- **問題**: `BuyCardView` 内で不足宝石表示のロジックが重複（予約カードと通常カードで同じコード）
- **改善案**: `MissingGemsIndicator` コンポーネントを作成

### 2.7 カードリスト表示の共通化
- **問題**: `BuyCardView` と `ReserveView` で似た構造のカードリスト表示
- **改善案**: `CardList` コンポーネントを作成

## 3. PlayerController.tsx の分割

### 3.1 ビューコンポーネントの分離
- **問題**: `PlayerController.tsx` が750行と大きく、内部で複数のビューコンポーネントが定義されている
- **影響範囲**:
  - `Dashboard` (170-329行)
  - `TakeGemsView` (331-370行)
  - `BuyCardView` (372-486行)
  - `ReserveView` (488-508行)
  - `DiscardTokensView` (510-583行)
- **改善案**: 各ビューを別ファイルに分離
  - `components/player/Dashboard.tsx`
  - `components/player/TakeGemsView.tsx`
  - `components/player/BuyCardView.tsx`
  - `components/player/ReserveView.tsx`
  - `components/player/DiscardTokensView.tsx`

### 3.2 ダイアログ管理の共通化
- **問題**: `PlayerController.tsx` と `HostBoard.tsx` で似たダイアログ管理ロジック
- **改善案**: カスタムフック `useDialog` を作成

## 4. 定数の統一

### 4.1 画像定数の共通化
- **問題**:
  - `LEVEL_IMAGES` が `Card.tsx` に定義されている
  - `NOBLE_IMAGES` が `Noble.tsx` に定義されている
- **改善案**: `constants/images.ts` に統合

### 4.2 サイズ定数の共通化
- **問題**: `CARD_SIZES` と `CARDBACK_SIZES` が `Card.tsx` に定義されている
- **改善案**: `constants/sizes.ts` に統合（必要に応じて）

## 5. コードの一貫性

### 5.1 宝石順序の統一
- **問題**: `DiscardTokensView` 内で宝石の順序がハードコードされている
  - `['diamond', 'sapphire', 'emerald', 'ruby', 'onyx', 'gold']`
- **改善案**: `GEM_ORDER` を使用

### 5.2 翻訳キーの統一
- **問題**: `BuyCardView` で `t('Available to Develop')` が使用されているが、他の箇所では `t('Available')` を使用
- **改善案**: 翻訳キーを統一

## 6. パフォーマンス最適化

### 6.1 メモ化の追加
- **問題**: `Dashboard` や `BuyCardView` で計算が毎回実行されている
- **改善案**: `useMemo` を使用して計算結果をメモ化

## 7. エラーハンドリング

### 7.1 エラー表示の統一
- **問題**: エラー表示が各コンポーネントで異なる
- **改善案**: 共通のエラー表示コンポーネントを作成

## 優先度

### 高優先度
1. 型安全性の向上（1.1, 1.2, 1.3）
2. `discount` 計算の共通化（2.1）
3. `tokenCounts` 計算の共通化（2.2）
4. `bonusCounts` 計算の統一（2.3）
5. 不足宝石表示のコンポーネント化（2.6）

### 中優先度
6. PlayerController.tsx の分割（3.1）
7. 言語切り替えロジックの共通化（2.4）
8. `beforeunload` ハンドラーの共通化（2.5）
9. 宝石順序の統一（5.1）

### 低優先度
10. 画像定数の共通化（4.1）
11. カードリスト表示の共通化（2.7）
12. メモ化の追加（6.1）
