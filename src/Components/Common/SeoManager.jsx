import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Route title mapping for GoTechEdu Portal
 */
function getRouteTitle(pathname) {
  if (pathname === "/" || pathname === "/auth/login") {
    return "GoTechEdu Portal | Login";
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
  return "GoTechEdu Portal | Login";
}

const PUBLIC_LOGIN_DESCRIPTION =
  "Official GoTechEdu Portal login for secure access to GoTechEdu’s HRMS, employee services, learning and training resources, career opportunities, and business management tools.";

function setMetaTag(attributeName, attributeValue, content) {
  let meta = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attributeName, attributeValue);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

/**
 * SeoManager dynamically manages document title, search engine directives,
 * Open Graph, Twitter metadata, and canonical links.
 *
 * Public login / root: index, follow with canonical https://portal.gotechedu.com/
 * Protected / internal pages: noindex, nofollow to safeguard private enterprise data.
 */
export default function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const isPublicLogin =
      location.pathname === "/" || location.pathname === "/auth/login";

    // 1. Document Title
    const title = getRouteTitle(location.pathname);
    document.title = title;

    // 2. Robots Directive
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.setAttribute("name", "robots");
      document.head.appendChild(robotsMeta);
    }

    if (isPublicLogin) {
      robotsMeta.setAttribute("content", "index, follow");

      // Canonical link for public entry
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", "https://portal.gotechedu.com/");

      // Description
      setMetaTag("name", "description", PUBLIC_LOGIN_DESCRIPTION);

      // Open Graph
      setMetaTag("property", "og:title", title);
      setMetaTag("property", "og:description", PUBLIC_LOGIN_DESCRIPTION);
      setMetaTag("property", "og:url", "https://portal.gotechedu.com/");

      // Twitter
      setMetaTag("name", "twitter:title", title);
      setMetaTag("name", "twitter:description", PUBLIC_LOGIN_DESCRIPTION);
    } else {
      // Private / Protected / Internal routes must never be indexed
      robotsMeta.setAttribute("content", "noindex, nofollow");

      // Remove canonical tag on internal/private routes
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.remove();
      }

      // Update Open Graph and Twitter titles for internal context
      setMetaTag("property", "og:title", title);
      setMetaTag("name", "twitter:title", title);
    }
  }, [location.pathname]);

  return null;
}
