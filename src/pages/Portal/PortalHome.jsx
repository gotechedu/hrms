import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Code2,
  Users2,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Sparkles,
  Building2,
  Lock,
  Layers,
  ChevronRight,
  Globe,
} from "lucide-react";

export default function PortalHome() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const pillars = [
    {
      id: "tech",
      name: "Tech",
      tagline: "IT Solutions & Technology-Based Services",
      description:
        "IT solutions and technology-based services. GoTechEdu engineers scalable enterprise software, autonomous AI agent architectures, multi-cloud DevOps pipelines, and robust cybersecurity defenses.",
      features: [
        "Full-Stack Enterprise Engineering",
        "Autonomous AI & Workflow Automation",
        "Cloud Architecture & DevOps Systems",
        "Zero-Trust Cybersecurity & Compliance",
      ],
      icon: Code2,
      image: "/pillars/tech.jpg",
      accent: "from-blue-600 to-cyan-500",
      pillBg: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "talent",
      name: "Talent",
      tagline: "Consulting & Expert Talent Solutions",
      description:
        "Consulting and expert talent solutions. We empower organizations with dedicated engineering pods, specialized technical advisors, and verified tech professionals tailored to high-velocity delivery.",
      features: [
        "Strategic Technical Consulting",
        "Dedicated Agile Engineering Pods",
        "Specialized Tech Talent Placement",
        "Architecture & Leadership Advisory",
      ],
      icon: Users2,
      image: "/pillars/talent.jpg",
      accent: "from-purple-600 to-indigo-500",
      pillBg: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      id: "training",
      name: "Training",
      tagline: "Learning, Teaching & Skill Development",
      description:
        "Learning, teaching and skill development. Bridging academic curriculum with real-world enterprise demands through hands-on bootcamps, accredited mentorship, and live project-driven training modules.",
      features: [
        "Industry-Accredited Tech Bootcamps",
        "Hands-On Cloud & DevOps Labs",
        "Corporate Workforce Upskilling",
        "Live Instructor-Led Cohorts",
      ],
      icon: GraduationCap,
      image: "/pillars/training.jpg",
      accent: "from-emerald-600 to-teal-500",
      pillBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "transformation",
      name: "Transformation",
      tagline: "Marketing, Branding & Business Growth",
      description:
        "Marketing, branding and business growth. Driving digital evolution through data-backed brand strategies, performance marketing systems, omni-channel acquisition, and modern corporate identity.",
      features: [
        "Omni-Channel Digital Brand Strategy",
        "Performance Growth & Conversion Systems",
        "Market Positioning & Narrative Design",
        "Data Analytics & Customer Intelligence",
      ],
      icon: TrendingUp,
      image: "/pillars/transformation.jpg",
      accent: "from-amber-600 to-orange-500",
      pillBg: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Brand & Pillar Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition"
            aria-label="GoTechEdu Portal Homepage"
          >
            <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 group-hover:border-blue-400 group-hover:shadow-md transition">
              <img
                src="/icons.png"
                alt="GoTechEdu Portal Logo"
                className="h-9 w-9 object-contain rounded-lg"
              />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
                GoTech<span className="text-blue-600">Edu</span>
                <span className="ml-1.5 text-xs font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                  Portal
                </span>
              </span>
            </div>
          </Link>

          {/* Navigation Links to Four Pillars */}
          <nav
            aria-label="Portal Pillars Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600"
          >
            <a
              href="#tech"
              className="hover:text-blue-600 transition flex items-center gap-1.5"
            >
              <Code2 size={15} className="text-blue-500" />
              Tech
            </a>
            <a
              href="#talent"
              className="hover:text-purple-600 transition flex items-center gap-1.5"
            >
              <Users2 size={15} className="text-purple-500" />
              Talent
            </a>
            <a
              href="#training"
              className="hover:text-emerald-600 transition flex items-center gap-1.5"
            >
              <GraduationCap size={15} className="text-emerald-500" />
              Training
            </a>
            <a
              href="#transformation"
              className="hover:text-amber-600 transition flex items-center gap-1.5"
            >
              <TrendingUp size={15} className="text-amber-500" />
              Transformation
            </a>
            <a
              href="https://gotechedu.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-900 transition flex items-center gap-1 text-xs border-l border-slate-200 pl-4"
            >
              Main Website
              <ExternalLink size={12} />
            </a>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition active:scale-98"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4.5 py-2 text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition active:scale-98"
              >
                <span>Sign In</span>
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Public Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 py-16 sm:py-24 border-b border-slate-200/80">
          {/* Ambient decorative gradient orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 -right-20 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Indexable Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 shadow-2xs">
              <Sparkles size={14} className="text-blue-600" />
              <span>Enterprise Human Resource &amp; Digital Ecosystem</span>
            </div>

            {/* Exactly ONE Primary H1 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 font-heading">
              GoTech<span className="text-blue-600">Edu</span> Portal
            </h1>

            {/* Authoritative Crawlable Lead Description */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
              GoTechEdu Portal is the digital platform of GoTechEdu, bringing
              together Tech, Talent, Training and Transformation solutions for
              businesses, professionals and learners.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 text-sm sm:text-base font-bold shadow-lg shadow-blue-500/25 transition active:scale-98"
                >
                  <span>Open Workstation Dashboard</span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 text-sm sm:text-base font-bold shadow-lg shadow-blue-500/25 transition active:scale-98"
                >
                  <span>Access Portal Workstation</span>
                  <ArrowRight size={18} />
                </Link>
              )}

              <a
                href="#pillars"
                className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-6 py-3.5 text-sm sm:text-base font-bold shadow-xs hover:border-slate-400 transition"
              >
                <span>Explore Four Pillars</span>
                <ChevronRight size={18} />
              </a>

              <a
                href="https://gotechedu.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 px-5 py-3.5 text-sm font-semibold transition"
              >
                <Globe size={16} />
                <span>Visit Main Website</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Quick Key Highlights Banner */}
            <div className="mt-12 pt-8 border-t border-slate-200/70 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Pillar 01</span>
                <strong className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Code2 size={14} className="text-blue-500" />
                  Tech Solutions
                </strong>
              </div>
              <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Pillar 02</span>
                <strong className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Users2 size={14} className="text-purple-500" />
                  Talent Consulting
                </strong>
              </div>
              <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Pillar 03</span>
                <strong className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <GraduationCap size={14} className="text-emerald-500" />
                  Training &amp; Labs
                </strong>
              </div>
              <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Pillar 04</span>
                <strong className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <TrendingUp size={14} className="text-amber-500" />
                  Transformation
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* The Four Pillars Section with Semantic IDs */}
        <section id="pillars" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Foundational Pillars
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 font-heading">
                Four Pillars Powering GoTechEdu
              </h2>
              <p className="mt-3 text-base text-slate-600">
                GoTechEdu delivers an integrated model connecting modern technology delivery, elite specialized talent, continuous technical education, and enterprise business transformation.
              </p>
            </div>

            {/* Pillars Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <article
                    key={pillar.id}
                    id={pillar.id}
                    className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Pillar Image Preview */}
                      <div className="relative rounded-xl overflow-hidden mb-6 aspect-video bg-slate-100 border border-slate-100">
                        <img
                          src={pillar.image}
                          alt={`GoTechEdu ${pillar.name} - ${pillar.tagline}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-md bg-white/90 text-slate-900 shadow-xs`}
                          >
                            <IconComponent size={14} />
                            {pillar.tagline}
                          </span>
                        </div>
                      </div>

                      {/* Pillar Title - H2 */}
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
                          {pillar.name}
                        </h2>
                        <span
                          className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-md border ${pillar.pillBg}`}
                        >
                          Pillar #{pillar.id.toUpperCase()}
                        </span>
                      </div>

                      {/* Natural Explanatory Content */}
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                        {pillar.description}
                      </p>

                      {/* Feature Bullet Points */}
                      <ul className="space-y-2 mb-6 text-xs sm:text-sm text-slate-700">
                        {pillar.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2
                              size={15}
                              className="text-emerald-500 shrink-0"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Integrated with GoTechEdu Portal</span>
                      <a
                        href="#pillars"
                        className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
                      >
                        Learn more <ChevronRight size={13} />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Portal Workspace Integration Section */}
        <section className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800/60 inline-block mb-4">
                  Unified Digital Gateway
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 font-heading">
                  One Unified Portal for Operations, Talent &amp; Learning
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                  The GoTechEdu Portal bridges our internal workforce intelligence, employee attendance, project lifecycle tracking, payroll governance, and Learning Hub LMS within an enterprise-grade environment.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-bold text-sm text-white">Role-Based Access Control</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Granular security permissions for Superadmins, HR, Managers, Trainers, and Trainees.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <Layers className="text-blue-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-bold text-sm text-white">Full-Spectrum Modules</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Timesheets, LMS video player, batch governance, and client consultations in one place.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 text-sm font-bold shadow-md transition"
                  >
                    <span>Sign In to Workstation</span>
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href="https://gotechedu.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 px-5 py-3 text-sm font-semibold transition"
                  >
                    <span>Visit gotechedu.com</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Crawlable Semantic Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-200/80">
            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <img
                  src="/icons.png"
                  alt="GoTechEdu Logo"
                  className="h-7 w-7 object-contain rounded-md"
                />
                <span className="font-heading font-bold text-base text-slate-900">
                  GoTech<span className="text-blue-600">Edu</span> Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enterprise workforce management, learning ecosystem, and client portal for GoTechEdu.
              </p>
            </div>

            {/* The Four Pillars Links */}
            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
                Four Pillars
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#tech" className="hover:text-blue-600 transition">
                    Tech Solutions
                  </a>
                </li>
                <li>
                  <a href="#talent" className="hover:text-blue-600 transition">
                    Talent Consulting
                  </a>
                </li>
                <li>
                  <a href="#training" className="hover:text-blue-600 transition">
                    Training &amp; LMS
                  </a>
                </li>
                <li>
                  <a href="#transformation" className="hover:text-blue-600 transition">
                    Transformation Growth
                  </a>
                </li>
              </ul>
            </div>

            {/* Portal Links */}
            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
                Portal Access
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/auth/login" className="hover:text-blue-600 transition">
                    Portal Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/auth/forgot-password" className="hover:text-blue-600 transition">
                    Password Reset
                  </Link>
                </li>
                <li>
                  <a href="https://portal.gotechedu.com/robots.txt" className="hover:text-blue-600 transition">
                    Robots.txt
                  </a>
                </li>
                <li>
                  <a href="https://portal.gotechedu.com/sitemap.xml" className="hover:text-blue-600 transition">
                    Sitemap.xml
                  </a>
                </li>
              </ul>
            </div>

            {/* Main Website & Organization */}
            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
                GoTechEdu Organization
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="https://gotechedu.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition flex items-center gap-1"
                  >
                    Main Website
                    <ExternalLink size={11} />
                  </a>
                </li>
                <li>
                  <span className="text-slate-400">Canonical: https://portal.gotechedu.com/</span>
                </li>
                <li>
                  <span className="text-slate-400">Gurugram, Haryana, India</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              &copy; 2026 GoTechEdu. All rights reserved. GoTechEdu Portal is the official digital platform of GoTechEdu.
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Canonical Production Gateway: portal.gotechedu.com</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
