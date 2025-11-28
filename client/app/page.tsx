
import { Footer } from './_components/landingPage/Footer';
import { FAQSection } from './_components/landingPage/FAQS';
import { DualViewSection } from './_components/landingPage/DualViewSection';

import { handleLogout } from './utils/handleLogout';
import { Navbar } from './_components/landingPage/NavBar';
import { Hero } from './_components/landingPage/HeroSection';
import { Features } from './_components/landingPage/Features';





export default async function Page() {
  let user = null;
  let isLoggedIn = false;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session-info`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (response.ok) {
      const data = await response.json();
      user = data.user;
      isLoggedIn = true;
    }
  } catch {

  }

  return (
    <div className="min-h-screen font-sans bg-white selection:bg-orange-100 selection:text-orange-900">
      <Navbar
        user={user}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
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
