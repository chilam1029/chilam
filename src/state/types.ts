export type MochiStage = 'newborn' | 'baby' | 'growing' | 'young';
export type MochiCondition = 'well' | 'low' | 'unwell';
export type CosmeticArea = 'baby_environment' | 'village';
export type CosmeticRarity = 'common' | 'uncommon' | 'rare' | 'special';

export type MochiGenetics = {
  face: string;
  ears: string;
  eyes: string;
  furType: string;
  furColor: string;
  markings: string;
  tail: string;
  signatureFeature: string;
};

export type Mochi = {
  id: string;
  monthKey: string;
  stage: MochiStage;
  genetics: MochiGenetics;
  condition: MochiCondition;
};

export type Cosmetic = {
  id: string;
  name: string;
  area: CosmeticArea;
  rarity: CosmeticRarity;
};
