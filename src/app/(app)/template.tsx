export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex-1 animate-page-in">
      {children}
    </div>
  );
}
