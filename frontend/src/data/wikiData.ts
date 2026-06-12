// ============================================
// 星布谷地 Wiki - 统一数据配置文件
// 修改此文件即可更新全站数据
// ============================================

import type { Character, HotContent, UpdateItem, Crop, Recipe, Fish, Weather, Season, Ore, BeachItem, MapArea, GameFeature, GameBasic, Skill, DailySchedule, ContributeRank } from '@/types';

/** 角色数据 */
export const characters: Character[] = [];

export const characterCategories = [
  { id: 'all', label: '全部' },
  { id: 'romance', label: '可攻略' },
  { id: 'social', label: '可社交' },
  { id: 'shop', label: '商店' },
  { id: 'other', label: '其他' },
];

/** 首页热门内容 */
export const hotContent: HotContent[] = [];

/** 近期更新 */
export const recentUpdates: UpdateItem[] = [];

/** 首页统计数据 */
export const homeStats = [
  { label: '— 个条目', icon: 'FileText' },
  { label: '— 名编辑者', icon: 'UsersRound' },
  { label: '— 次编辑', icon: 'Pencil' },
  { label: '持续更新中', icon: 'Calendar' },
];

/** 快速入口卡片 */
export const quickCards = [
  { title: '友邻百科', desc: '了解星布谷地的每一位居民', icon: 'Users', color: 'bg-[#81c784]', page: 'neighbors' as const },
  { title: '种植指南', desc: '从播种到丰收的全攻略', icon: 'Sprout', color: 'bg-[#aed581]', page: 'farming' as const },
  { title: '菜肴大全', desc: '收集所有美味食谱', icon: 'ChefHat', color: 'bg-[#ffb74d]', page: 'dishes' as const },
  { title: '鱼类图鉴', desc: '捕获每一条珍稀鱼类', icon: 'Fish', color: 'bg-[#4fc3f7]', page: 'fishes' as const },
];

/** 种植 - 作物数据 */
export const crops: Crop[] = [];

export const cropSeasons = ['全部', '春季', '夏季', '秋季', '冬季'];

/** 烹饪 - 食谱 */
export const recipes: Recipe[] = [];

/** 渔获 - 鱼类 */
export const fishes: Fish[] = [];

/** 天气 */
export const weathers: Weather[] = [];

/** 季节 */
export const seasons: Season[] = [];

/** 矿产 */
export const ores: Ore[] = [];

/** 赶海 */
export const beachItems: BeachItem[] = [];

/** 地图区域 */
export const mapAreas: MapArea[] = [];

/** 游戏简介 - 特色 */
export const gameFeatures: GameFeature[] = [];

/** 游戏概述 - 基础设定 */
export const gameBasics: GameBasic[] = [];

/** 技能系统 */
export const skills: Skill[] = [];

/** 每日活动建议 */
export const dailySchedule: DailySchedule[] = [];

/** 共建排行榜 */
export const contributeRanks: ContributeRank[] = [];


