import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client'; // Import instance supabase
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@supabase/auth-ui-react'; // Import useSession hook

function Login() {
  const navigate = useNavigate();
  const session = useSession(); // Gunakan useSession dari context

  // Redirect jika pengguna sudah login
  useEffect(() => {
    if (session) {
      navigate('/'); // Arahkan ke halaman utama jika sudah login
    }
  }, [session, navigate]); // Tambahkan session dan navigate sebagai dependency

  // Jika session masih loading atau sudah ada, jangan tampilkan form login
  if (session) {
      return null; // Atau tampilkan loading spinner jika diinginkan
  }


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