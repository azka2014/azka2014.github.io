import Layout from "@/components/Layout"; // Import Layout if not already wrapped in App.tsx

const Index = () => {
  return (
    <div className="flex items-center justify-center h-full"> {/* Use h-full to center within main content area */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Selamat Datang di Aplikasi Persediaan RSUD Kabupaten Karo</h1>
        <p className="text-xl text-muted-foreground">
          Pilih menu di samping untuk memulai.
        </p>
      </div>
    </div>
  );
};

export default Index;