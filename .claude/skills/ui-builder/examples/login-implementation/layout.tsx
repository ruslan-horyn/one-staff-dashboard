// Example: app/(auth)/layout.tsx
// Auth layout - centers content, no sidebar

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
