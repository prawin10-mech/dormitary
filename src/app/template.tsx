// Page transitions were removed: the full-screen banner animation blocked every
// navigation for ~1.5s. Navigation is now instant.
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
