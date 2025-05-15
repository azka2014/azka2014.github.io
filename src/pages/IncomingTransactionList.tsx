import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const IncomingTransactionListPage = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Barang Masuk</h1>
        {/* Button to add new incoming transaction will go here */}
        <Button>Tambah Barang Masuk</Button>
      </div>
      {/* Table or list of incoming transactions will go here */}
      <p>Daftar transaksi barang masuk akan ditampilkan di sini.</p>
       <Button variant="outline" asChild className="mt-4">
        <Link to="/">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
};

export default IncomingTransactionListPage;