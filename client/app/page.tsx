'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChefHat,
  ArrowRight,
  Menu,
  X,
  LogOut,
  CheckCircle2,
  QrCode,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  LayoutDashboard,
  BarChart3,
  Receipt,
  Clock,
  FileSignature
} from 'lucide-react';

// --- Types ---
type AuthState = boolean;
interface FAQItem {
  question: string;
  answer: string;
}

const validateSession = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/validate-session`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      return data.success === true;
    }
    return false;
  } catch {
    return false;
  }
};

// --- Components ---

export const Navbar = ({
  isLoggedIn,
  onLogout
}: {
  isLoggedIn: AuthState,
  onLogout: () => void
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);


    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'System Features', href: '#features' },
    { name: 'QR Solution', href: '#benefits' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-white/50 backdrop-blur-sm py-5'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-orange-600 cursor-pointer"
        >
          <LayoutDashboard className="h-8 w-8" />
          <span className="text-2xl font-bold tracking-tighter text-gray-900">
            Table<span className="text-orange-600">Tap</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-600 hover:text-orange-600 transition-colors font-medium text-sm"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4 animate-in fade-in">
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 transition-all text-sm font-semibold"
              >
                <LogOut size={16} /> Logout
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-lg shadow-orange-600/20 text-sm font-semibold"
              >
                Get Started <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-orange-600 font-semibold px-3 py-2 text-sm transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register?role=ADMIN')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 hover:bg-orange-600 text-white transition-all shadow-lg shadow-gray-900/10 hover:shadow-orange-600/20 text-sm font-semibold"
              >
                Register <FileSignature size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-700 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t shadow-xl p-6 flex flex-col space-y-4 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-600 font-medium block py-2"
            >
              {link.name}
            </a>
          ))}

          <div className="border-t pt-4 mt-2">
            {isLoggedIn ? (
              <button onClick={onLogout} className="w-full py-3 rounded-lg bg-gray-100 text-red-600 font-semibold">
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3 rounded-lg border border-gray-200 text-gray-700 font-semibold"
                >
                  Log In
                </button>
                <button
                  onClick={() => router.push('/register?role=ADMIN')}
                  className="w-full py-3 rounded-lg bg-orange-600 text-white font-semibold"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = ({ isLoggedIn }: { isLoggedIn: AuthState }) => {
  const router = useRouter();

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Restaurant Management System
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
            Master Your Service.<br />
            <span className=" bg-clip-text text-amber-500">
              Automate Your Orders.
            </span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto font-light">
            The all-in-one platform for restaurant owners. Monitor revenue in real-time, eliminate waiter errors, and provide a seamless QR dine-in experience for your customers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <button onClick={() => router.push('/dashboard')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-600/20">
                <LayoutDashboard size={20} /> Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/register?role=ADMIN')}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2"
                >
                  Get Started <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full  from-orange-100/50 to-transparent blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full  from-gray-100 to-transparent blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: React.ElementType, title: string, desc: string }) => (
  <div className="bg-gray-50 p-8 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group cursor-default">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 text-gray-900 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
      <Icon size={24} strokeWidth={2} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

const Features = () => {
  return (
    <section id="features" className="py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Complete Control Over Your Venue</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={BarChart3}
            title="Revenue & Order Tracking"
            desc="View real-time sales data, track active tables, and monitor payment statuses instantly from the owner dashboard."
          />
          <FeatureCard
            icon={QrCode}
            title="QR Dine-In Facility"
            desc="Empower your customers to scan, order, and pay directly from the table. Reduce waiter workload by up to 40%."
          />
          <FeatureCard
            icon={ChefHat}
            title="Digital Kitchen Flow"
            desc="Replace confusing paper tickets with digital order tracking. Reduce errors and speed up preparation times."
          />
        </div>
      </div>
    </section>
  );
};

const DualViewSection = () => {
  return (
    <section id="benefits" className="py-24 bg-white border-t border-gray-100 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Visual: The Solution in Action */}
          <div className="relative">
            <div className="absolute inset-0  from-orange-100 to-transparent rounded-3xl transform rotate-3"></div>
            <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md tracking-wide">LIVE ORDER</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Receipt className="text-gray-400" size={20} />
                    <span className="text-sm text-gray-600">Order #1299</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">Paid ($24.00)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <Clock className="text-orange-400" size={20} />
                    <span className="text-sm text-gray-900 font-medium">Order #1300 (Pending)</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">$32.50</span>
                </div>
                <div className="pt-4 text-center">
                  <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold">
                    Display of Orders and Payment History
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Side Text */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Solve the &quot;Busy Waiter&quot; Problem</h2>
              <p className="text-gray-500 leading-relaxed">
                Manual order taking is slow, confusing, and frustrating for customers. TableTap automates the process, allowing your staff to focus on hospitality while the system handles the logistics.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Accept individual ordering even in group settings",
                "Secure Payment Gateway Integration",
                "Real-time Admin Dashboard for Sales",
                "Customizable Menu & Pricing"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="mt-1 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How does the QR Dine-In feature help my restaurant?",
      answer: "It speeds up table turnover by allowing customers to order immediately without waiting for a server. It also increases average order value as customers can easily browse the full menu with visuals."
    },
    {
      question: "Can I track sales and orders in real-time?",
      answer: "Yes. The Admin Dashboard provides live updates on every order placed, table status, and total revenue collected, giving you full control over your floor."
    },
    {
      question: "How does the group billing/split payment work?",
      answer: "Our system allows multiple people at the same table to scan the same QR code. They can order individually and pay their own share, or one person can pay for the whole table. The system tracks it all automatically."
    },
    {
      question: "What hardware do I need to run TableTap?",
      answer: "No proprietary hardware is required. You can access the Owner Portal on any laptop, tablet, or smartphone. Customers use their own smartphones to order."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-gray-50 scroll-mt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-500">Common questions from Restaurant Owners.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="text-orange-600" size={20} />
                ) : (
                  <ChevronDown className="text-gray-400" size={20} />
                )}
              </button>
              <div
                className={`px-6 text-gray-500 text-sm leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-orange-600 mb-6">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-lg font-bold text-gray-900">TableTap</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            The complete operating system for modern restaurants.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-4 text-sm">Product</h4>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><a href="#features" className="hover:text-orange-600 transition-colors">System Features</a></li>
            <li><a href="#benefits" className="hover:text-orange-600 transition-colors">QR Solution</a></li>
            <li><a href="#faq" className="hover:text-orange-600 transition-colors">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-900 mb-4 text-sm">Contact Us</h4>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>
              <a href="tel:+9779807373150" className="hover:text-orange-600 transition-colors">+977 9807373150</a>
            </li>
            <li>
              <a href="mailto:s.dhimal006@gmail.com" className="hover:text-orange-600 transition-colors">s.dhimal006@gmail.com</a>
            </li>
            <li className="text-gray-500">Sano Gaucharan, Naxal, Nepal</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-900 mb-4 text-sm">Follow Us</h4>
          <div className="flex gap-3">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-orange-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733a4.67 4.67 0 0 0 2.048-2.578 9.3 9.3 0 0 1-2.958 1.13a4.66 4.66 0 0 0-7.938 4.25 13.229 13.229 0 0 1-9.602-4.868c-.333.564-.523 1.234-.523 1.962a4.66 4.66 0 0 0 2.072 3.878 4.63 4.63 0 0 1-2.11-.583v.06a4.66 4.66 0 0 0 3.737 4.568 4.69 4.69 0 0 1-2.104.08 4.66 4.66 0 0 0 4.35 3.234 9.348 9.348 0 0 1-5.786 1.995 9.5 9.5 0 0 1-1.112-.065 13.175 13.175 0 0 0 7.14 2.093c8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602a9.47 9.47 0 0 0 2.323-2.41z" /></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-orange-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.116 0-3.472.012-4.695.068-2.61.12-3.832 1.343-3.952 3.952-.056 1.223-.067 1.578-.067 4.695s.011 3.472.067 4.695c.12 2.61 1.342 3.832 3.952 3.952 1.223.056 1.578.067 4.695.067s3.472-.011 4.695-.067c2.61-.12 3.832-1.342 3.952-3.952.056-1.223.067-1.578.067-4.695s-.011-3.472-.067-4.695c-.12-2.61-1.342-3.832-3.952-3.952-1.223-.056-1.578-.067-4.695-.067zm0 3.068a5.938 5.938 0 1 0 0 11.876 5.938 5.938 0 0 0 0-11.876zm0 9.808a3.87 3.87 0 1 1 0-7.74 3.87 3.87 0 0 1 0 7.74zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" /></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-orange-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} TableTap Systems.
        </p>
        <div className="flex gap-4">
          {/* Social placeholders could go here */}
        </div>
      </div>
    </div>
  </footer>
);

// --- Main Page Component ---

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const ok = await validateSession();
      setIsLoggedIn(ok);
    };
    bootstrap();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch { }
    setIsLoggedIn(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen font-sans bg-white selection:bg-orange-100 selection:text-orange-900">
      <Navbar
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