import { getUserIDandRoleFromToken } from '@/utils/getUserIdandRoleFromToken';
import { DualViewSection } from './_components/landingPage/DualViewSection';
import { FAQSection } from './_components/landingPage/FAQS';
import { Features } from './_components/landingPage/Features';
import { Footer } from './_components/landingPage/Footer';
import { Hero } from './_components/landingPage/HeroSection';
import { Navbar } from './_components/landingPage/NavBar';



export const dynamic = 'force-dynamic';

export default async function Page() {
  const { name, role, isLoggedIn } = await getUserIDandRoleFromToken();
  const user = { name, role }
  // console.log(user)

  return (
    <div className="min-h-screen font-sans bg-white selection:bg-orange-100 selection:text-orange-900">
      <Navbar
        user={user}
        isLoggedIn={isLoggedIn}
      />
      <main>
        <Hero isLoggedIn={isLoggedIn} />
        <Features />
        <DualViewSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
