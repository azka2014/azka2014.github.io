import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client'; // Import instance supabase
import { useEffect, useState } from 'react'; // Import useState
import { useNavigate } from 'react-router-dom';
// Hapus import useSessionContext
// import { useSessionContext } from '@supabase/auth-ui-react';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Tambahkan state loading

  // Cek sesi saat komponen dimuat
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/'); // Arahkan ke halaman utama jika sudah login
      } else {
        setLoading(false); // Sesi tidak ada, tampilkan form login
      }
    };

    checkSession();
  }, [navigate]); // Tambahkan navigate sebagai dependency

  // Jika masih loading, tampilkan loading spinner atau null
  if (loading) {
      return <div>Loading...</div>; // Atau null, atau spinner
  }

  // Jika tidak loading dan tidak ada sesi, tampilkan form login
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Login atau Daftar</h2>
        <Auth
          supabaseClient={supabase}
          providers={[]} // Nonaktifkan provider pihak ketiga
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))', // Menggunakan warna primary dari tailwind config
                  brandAccent: 'hsl(var(--primary-foreground))', // Menggunakan warna primary-foreground
                },
              },
            },
          }}
          theme="light" // Menggunakan tema terang
          redirectTo={window.location.origin + '/'} // Arahkan ke root setelah login
        />
      </div>
    </div>
  );
}

export default Login;