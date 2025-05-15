import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ReportsPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Laporan Persediaan</h1>
      {/* Report content will go here */}
      <p>Konten laporan akan ditampilkan di sini.</p>
       <Button variant="outline" asChild className="mt-4">
        <Link to="/">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
};

export default ReportsPage;