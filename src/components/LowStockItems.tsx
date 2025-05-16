import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PackageWarning } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  unit: string;
  stock: number;
}

interface LowStockItemsProps {
  items: Item[];
  lowStockThreshold?: number;
}

const LowStockItems: React.FC<LowStockItemsProps> = ({ items, lowStockThreshold = 5 }) => {
  const lowStockList = items.filter(item => item.stock < lowStockThreshold);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Barang Stok Rendah (<{lowStockThreshold})
        </CardTitle>
        <PackageWarning className="h-4 w-4 text-destructive" />
      </CardHeader>
      <CardContent>
        {lowStockList.length === 0 ? (
          <p className="text-center text-muted-foreground">Tidak ada barang dengan stok rendah.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Satuan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="font-medium text-destructive">{item.stock}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockItems;