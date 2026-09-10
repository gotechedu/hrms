import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Route title dictionary with prefix matching for GoTechEdu Portal routes
 */
function getRouteTitle(pathname) {
  if (pathname === "/") {
    return "GoTechEdu Portal | Tech, Talent, Training & Transformation";
  }
  if (pathname === "/auth/login") {
    return "GoTechEdu Portal | Sign In";
  }
  if (pathname === "/auth/forgot-password") {
    return "GoTechEdu Portal | Reset Password";
  }
  if (pathname === "/dashboard") {
    return "GoTechEdu Portal | Dashboard";
  }
  if (pathname.startsWith("/employees")) {
    return "GoTechEdu Portal | Employee Directory";
  }
  if (pathname.startsWith("/attendance")) {
    return "GoTechEdu Portal | Attendance Intelligence";
  }
  if (pathname.startsWith("/timesheets")) {
    return "GoTechEdu Portal | Timesheets";
  }
  if (pathname.startsWith("/projects")) {
    return "GoTechEdu Portal | Projects";
  }
  if (pathname.startsWith("/tasks")) {
    return "GoTechEdu Portal | Task Management";
  }
  if (pathname.startsWith("/holidays")) {
    return "GoTechEdu Portal | Holiday Calendar";
  }
  if (pathname.startsWith("/payroll")) {
    return "GoTechEdu Portal | Payroll Operations";
  }
  if (pathname.startsWith("/learninghub/player")) {
    return "GoTechEdu Portal | Course Player";
  }
  if (pathname.startsWith("/learninghub")) {
    return "GoTechEdu Portal | Learning Hub LMS";
  }
  if (pathname.startsWith("/careerpost")) {
    return "GoTechEdu Portal | Careers";
  }
  if (pathname.startsWith("/applications")) {
    return "GoTechEdu Portal | Applicant Tracking";
  }
  if (pathname.startsWith("/contacts")) {
    return "GoTechEdu Portal | Consultations";
  }
  if (pathname.startsWith("/discussions")) {
    return "GoTechEdu Portal | Team Discussions";
  }
  if (pathname.startsWith("/accusations")) {
    return "GoTechEdu Portal | Policy & Ethics";
  }
  if (pathname.startsWith("/blogs")) {
    return "GoTechEdu Portal | Knowledge Base";
  }
  if (pathname.startsWith("/profile")) {
    return "GoTechEdu Portal | Profile";
  }
  if (pathname.startsWith("/chat")) {
    return "GoTechEdu Portal | Enterprise Chat";
  }
  if (pathname.startsWith("/settings")) {
    return "GoTechEdu Portal | Settings";
  }
  if (pathname.startsWith("/recycle-bin")) {
    return "GoTechEdu Portal | Recycle Bin";
  }
  return "GoTechEdu Portal";
}

/**
 * SeoManager dynamically manages document title, canonical link,
 * and robots meta directives based on whether the route is the public homepage
 * or private internal application modules.
 */
export default function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const isPublicHome = location.pathname === "/";

    // 1. Dynamic Page Title
    document.title = getRouteTitle(location.pathname);

    // 2. Robots Meta Directive Management
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.setAttribute("name", "robots");
      document.head.appendChild(robotsMeta);
    }

    if (isPublicHome) {
      // Public homepage is indexable
      robotsMeta.setAttribute("content", "index, follow");
    } else {
      // CRITICAL: Default all authenticated, auth flows, subroutes,
      // and unknown private routes strictly to noindex, nofollow
      robotsMeta.setAttribute("content", "noindex, nofollow");
    }

    // 3. Canonical Link Management
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }

    if (isPublicHome) {
      canonicalLink.setAttribute("href", "https://portal.gotechedu.com/");
    } else {
      // Remove canonical on private/noindex pages to prevent mistaken consolidation
      canonicalLink.removeAttribute("href");
    }
  }, [location.pathname]);

  return null;
}
