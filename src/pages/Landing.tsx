import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Vision } from "@/components/landing/Vision";
import { Ecosystem } from "@/components/landing/Ecosystem";
import { Impact } from "@/components/landing/Impact";
import { Infrastructure } from "@/components/landing/Infrastructure";
import { Footer } from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white font-sans text-black">
      <Navbar />
      <main>
        <Hero />
        <Vision />
        <Ecosystem />
        <Impact />
        <Infrastructure />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
