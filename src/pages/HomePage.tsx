import Sidebar from "@/components/Sidebar";

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <Sidebar />
      <main className="flex-1 bg-white" />
    </div>
  );
}
