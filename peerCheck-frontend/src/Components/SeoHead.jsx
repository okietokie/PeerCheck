import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://peercheck.online";
const DEFAULT_TITLE = "PeerCheck | Peer Review and Project Collaboration Platform";
const DEFAULT_DESCRIPTION =
  "PeerCheck helps students and educators manage peer review, project collaboration, feedback, task tracking, and team progress in one structured workspace.";
const DEFAULT_IMAGE = `${SITE_URL}/favicon.svg`;

const ROUTE_META = [
  {
    match: (pathname) => pathname === "/",
    title: DEFAULT_TITLE,
    description:
      "PeerCheck is a peer review and project collaboration platform for students, teams, and educators.",
    robots: "index,follow",
  },
  {
    match: (pathname) => pathname === "/login",
    title: "Login | PeerCheck",
    description:
      "Sign in to PeerCheck to access your peer review workspace, projects, tasks, and collaboration dashboard.",
    robots: "index,follow",
  },
  {
    match: (pathname) => pathname === "/sign-up",
    title: "Create Your Account | PeerCheck",
    description:
      "Create a PeerCheck account to manage peer feedback, collaborative projects, and team progress in one place.",
    robots: "index,follow",
  },
  {
    match: (pathname) => pathname.startsWith("/forgot-password"),
    title: "Forgot Password | PeerCheck",
    description: "Reset your PeerCheck password and recover access to your account securely.",
    robots: "noindex,nofollow",
  },
  {
    match: (pathname) => pathname.startsWith("/reset-password"),
    title: "Reset Password | PeerCheck",
    description: "Choose a new password for your PeerCheck account.",
    robots: "noindex,nofollow",
  },
  {
    match: (pathname) => pathname.startsWith("/user-app"),
    title: "Student Workspace | PeerCheck",
    description:
      "Manage student projects, peer reviews, team coordination, and task tracking inside PeerCheck.",
    robots: "noindex,nofollow",
  },
  {
    match: (pathname) => pathname.startsWith("/teacher-app"),
    title: "Teacher Workspace | PeerCheck",
    description:
      "Review classes, feedback, analytics, and collaboration activity inside the PeerCheck teacher workspace.",
    robots: "noindex,nofollow",
  },
  {
    match: (pathname) => pathname.startsWith("/admin-page") || pathname.startsWith("/sec-n-auth"),
    title: "Admin | PeerCheck",
    description: "PeerCheck administration and security workspace.",
    robots: "noindex,nofollow",
  },
];

function setMeta(attribute, key, value) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

function setLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function getPageMeta(pathname) {
  const matched = ROUTE_META.find((entry) => entry.match(pathname));
  return matched ?? {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    robots: "index,follow",
  };
}

export default function SeoHead() {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    const meta = getPageMeta(pathname);
    const canonicalUrl = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;

    document.title = meta.title;

    setMeta("name", "description", meta.description);
    setMeta("name", "robots", meta.robots);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", DEFAULT_IMAGE);
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    setMeta("name", "twitter:image", DEFAULT_IMAGE);
    setLink("canonical", canonicalUrl);
  }, [location]);

  return null;
}
