import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  name: string;
  total: number;
}

interface TransactionChartProps {
  incomingTotal: number;
  outgoingTotal: number;
}

const TransactionChart: React.FC<TransactionChartProps> = ({ incomingTotal, outgoingTotal }) => {
  const data: ChartData[] = [
    { name: 'Barang Masuk', total: incomingTotal },
    { name: 'Barang Keluar', total: outgoingTotal },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Transaksi</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mengurangi tinggi div pembungkus grafik */}
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Total Kuantitas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionChart;