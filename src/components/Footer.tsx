export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-muted/50 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <p className="text-sm font-medium text-foreground">
            麦其科技
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} 心动相遇 machbook. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>备XXXXXXXX号</span>
            <span>|</span>
            
          </div>
        </div>
      </div>
    </footer>
  );
}
