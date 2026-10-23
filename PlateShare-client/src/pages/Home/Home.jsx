import { usePlateShare } from '../../context/usePlateShare';
import HeroSection from '../../components/Home/HeroSection';
import CommunityStats from '../../components/Home/CommunityStats';
import FeaturedFoods from '../../components/Home/FeaturedFoods';
import CategoriesSection from '../../components/Home/CategoriesSection';
import HowItWorks from '../../components/Home/HowItWorks';
import MissionSection from '../../components/Home/MissionSection';
import CommunitySection from '../../components/Home/CommunitySection';
import FaqSection from '../../components/Home/FaqSection';
import ClosingCTA from '../../components/Home/ClosingCTA';
import RecentFoods from '../../components/Home/RecentFoods';

export default function Home() {
  const {
    foods,
    recentFoods,
    categories,
    stats,
    user,
    loading,
    recentLoading,
    error,
  } = usePlateShare();

  return (
    <main>
      <HeroSection user={user} />
      <CommunityStats stats={stats} />
      <FeaturedFoods foods={foods} loading={loading} error={error} />
      <RecentFoods foods={recentFoods} loading={recentLoading} error={error} />
      <CategoriesSection categories={categories} />
      <HowItWorks />
      <MissionSection />
      <CommunitySection />
      <FaqSection />
      <ClosingCTA user={user} />
    </main>
  );
}
