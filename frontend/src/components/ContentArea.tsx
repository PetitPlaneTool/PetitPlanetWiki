import { motion, AnimatePresence } from 'framer-motion';
import type { PageId } from '@/types';
import { useActivePage } from '@/hooks/useActivePage';
import { HomePage } from '@/pages/HomePage';
import { CharacterPage } from '@/pages/CharacterPage';
import { CropPage } from '@/pages/CropPage';
import { MapPage } from '@/pages/MapPage';
import { ChangesPage } from '@/pages/ChangesPage';
import { CookingPage } from '@/pages/CookingPage';
import { FishingPage } from '@/pages/FishingPage';
import { BeachPage } from '@/pages/BeachPage';
import { GameIntroPage } from '@/pages/GameIntroPage';
import { GameOverviewPage } from '@/pages/GameOverviewPage';
import { GameplayPage } from '@/pages/GameplayPage';
import { FeedbackPage } from '@/pages/FeedbackPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ContributePage } from '@/pages/ContributePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { CreditsPage } from '@/pages/CreditsPage';
import { ConstellationsPage } from '@/pages/ConstellationsPage';
import { FurniturePage } from '@/pages/FurniturePage';
import { DressupPage } from '@/pages/DressupPage';
import { InsectsPage } from '@/pages/InsectsPage';
import { PlantsPage } from '@/pages/PlantsPage';
import { ItemsPage } from '@/pages/ItemsPage';
import { DecorationsPage } from '@/pages/DecorationsPage';
import { CraftingPage } from '@/pages/CraftingPage';
import { MusicPage } from '@/pages/MusicPage';
import { ScreenshotPage } from '@/pages/ScreenshotPage';

const pageComponents: Record<PageId, React.ComponentType> = {
  home: HomePage,
  changes: ChangesPage,
  contribute: ContributePage,
  login: LoginPage,
  'game-intro': GameIntroPage,
  'game-overview': GameOverviewPage,
  gameplay: GameplayPage,
  map: MapPage,
  neighbors: CharacterPage,
  constellations: ConstellationsPage,
  dishes: CookingPage,
  furniture: FurniturePage,
  dressup: DressupPage,
  insects: InsectsPage,
  fishes: FishingPage,
  'shore-residents': BeachPage,
  plants: PlantsPage,
  items: ItemsPage,
  decorations: DecorationsPage,
  farming: CropPage,
  crafting: CraftingPage,
  music: MusicPage,
  screenshot: ScreenshotPage,
  feedback: FeedbackPage,
  settings: SettingsPage,
  profile: ProfilePage,
  credits: CreditsPage,
};

export function ContentArea() {
  const { activePage } = useActivePage();
  const PageComponent = pageComponents[activePage] ?? NotFoundPage;

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={activePage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen"
      >
        <PageComponent />
      </motion.main>
    </AnimatePresence>
  );
}
