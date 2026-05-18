import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-[4.5rem] md:pt-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
