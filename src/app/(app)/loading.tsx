export default function AppLoading() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-150">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl border-2 border-primary/20 border-t-primary animate-spin" />
        <span className="absolute text-sm font-bold text-primary animate-pulse">語</span>
      </div>
      <p className="text-xs text-muted-foreground font-medium animate-pulse">
        Đang tải dữ liệu...
      </p>
    </div>
  );
}
