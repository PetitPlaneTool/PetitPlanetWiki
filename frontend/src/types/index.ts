export type PageId =
  | 'home'
  | 'changes'
  | 'contribute'
  | 'login'
  | 'game-intro'
  | 'game-overview'
  | 'gameplay'
  | 'map'
  | 'neighbors'
  | 'constellations'
  | 'dishes'
  | 'furniture'
  | 'dressup'
  | 'insects'
  | 'fishes'
  | 'shore-residents'
  | 'plants'
  | 'items'
  | 'decorations'
  | 'farming'
  | 'crafting'
  | 'music'
  | 'screenshot'
  | 'feedback'
  | 'settings'
  | 'profile'
  | 'credits';

export interface NavItem {
  id: PageId;
  label: string;
  icon: string;
}

export interface Character {
  portrait: string;
  avatar: string;
  name: string;
  occupation: string;
  intro1: string;
  intro2: string;
}

export interface Crop {
  id: string;
  name: string;
  season: string;
  growTime: number;
  sellPrice: number;
  description: string;
}

export interface HotContent {
  id: string;
  title: string;
  image: string;
  category: string;
}

export interface UpdateItem {
  id: string;
  title: string;
  page: string;
  time: string;
}

export interface BackgroundSettings {
  mode: 'solid' | 'image';
  imageUrl: string;
  opacity: number;
}

export interface Recipe {
  name: string;
  ingredients: string[];
  energy: number;
  sell: number;
}

export interface Fish {
  name: string;
  season: string;
  location: string;
  difficulty: string;
  price: number;
}

export interface Weather {
  name: string;
  icon: string;
  effect: string;
  color: string;
}

export interface Season {
  name: string;
  color: string;
  months: string;
  features: string[];
  crops: string;
}

export interface Ore {
  name: string;
  depth: string;
  sell: number;
  use: string;
}

export interface BeachItem {
  name: string;
  season: string;
  location: string;
  rarity: string;
  price: number;
}

export interface MapArea {
  name: string;
  color: string;
}

export interface GameFeature {
  title: string;
  desc: string;
}

export interface GameBasic {
  label: string;
  value: string;
}

export interface Skill {
  name: string;
  level: number;
  desc: string;
  actions: string[];
}

export interface DailySchedule {
  time: string;
  tasks: string;
}

export interface ContributeRank {
  name: string;
  edits: number;
  rank: number;
}


