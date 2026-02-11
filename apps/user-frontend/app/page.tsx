import { HeroSection } from '@/components/hero-section';
import { TopGamesSection } from '@/components/top-games-section';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className=" w-full mx-auto">
        <HeroSection />
        <TopGamesSection />
      </main>
    </div>
  );
}
