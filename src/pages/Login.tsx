import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client'; // Import instance supabase
// Hapus import useEffect, useState, useNavigate
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// Hapus import useSessionContext
// import { useSessionContext } from '@supabase/auth-ui-react';

function Login() {
  // Hapus state dan useEffect untuk pengecekan sesi manual
  // const navigate = useNavigate();
  // const [loading, setLoading] = useState(true);

  // useEffect(() => { ... }, [...]);

  // Hapus loading check
  // if (loading) { return <div>Loading...</div>; }

  // Render form login menggunakan Auth component
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