import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://www.peercheck.online";
const DEFAULT_TITLE = "PeerCheck | Contribution Tracking and Fair Peer Review";
const DEFAULT_DESCRIPTION =
  "PeerCheck helps educators and student teams track contributions, verify work with proof, and run fairer peer review.";
const DEFAULT_IMAGE = `${SITE_URL}/favicon.svg`;

const ROUTE_META = [
  {
    match: (pathname) => pathname === "/",
    title: DEFAULT_TITLE,
    description:
      "Track contributions, upload proof of work, and support fairer peer review with a workspace built for team projects.",
    robots: "index,follow",
  },
  {
    match: (pathname) => pathname === "/login",
    title: "Login | PeerCheck",
    description:
      "Sign in to PeerCheck to review contributions, manage projects, and keep peer evaluation organized.",
    robots: "index,follow",
  },
  {
    match: (pathname) => pathname === "/sign-up",
    title: "Create Your Account | PeerCheck",
    description:
      "Create a PeerCheck account to track team work, upload proof, and make peer review more reliable.",
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
      "Manage project tasks, proof of work, peer reviews, and contribution tracking inside PeerCheck.",
    robots: "noindex,nofollow",
  },
  {
    match: (pathname) => pathname.startsWith("/teacher-app"),
    title: "Teacher Workspace | PeerCheck",
    description:
      "Monitor team health, validate peer reviews, and evaluate collaboration inside the PeerCheck teacher workspace.",
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
