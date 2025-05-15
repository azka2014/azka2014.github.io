import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const OutgoingTransactionListPage = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Barang Keluar</h1>
         {/* Button to add new outgoing transaction will go here */}
        <Button>Tambah Barang Keluar</Button>
      </div>
      {/* Table or list of outgoing transactions will go here */}
      <p>Daftar transaksi barang keluar akan ditampilkan di sini.</p>
       <Button variant="outline" asChild className="mt-4">
        <Link to="/">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
};

export default OutgoingTransactionListPage;