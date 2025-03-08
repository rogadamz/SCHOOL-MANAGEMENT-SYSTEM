// src/components/accounts/InvoiceDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, Mail, ExternalLink } from 'lucide-react';
import { Fee } from '@/services/api';

interface InvoiceDialogProps {
  fee: Fee;
  studentName: string;
  onClose: () => void;
}

export function InvoiceDialog({ fee, studentName, onClose }: InvoiceDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate fake invoice number
  const invoiceNumber = `INV-${new Date().getFullYear()}-${10000 + fee.id}`;
  
  // Generate issue date (a week before due date)
  const issueDate = new Date(new Date(fee.due_date).getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Print invoice
  const handlePrint = () => {
    setIsPrinting(true);
    
    // In a real app, we would have a proper print mechanism
    // For demo purposes, we'll just simulate printing
    setTimeout(() => {
      setIsPrinting(false);
      alert('Print job sent to printer');
    }, 1500);
  };
  
  // Download invoice
  const handleDownload = () => {
    alert('Invoice downloaded as PDF');
  };
  
  // Send invoice by email
  const handleSendEmail = () => {
    alert('Invoice sent to parent/guardian by email');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Invoice #{invoiceNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-gray-500">Downtown Nursery School</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Invoice #{invoiceNumber}</p>
              <p className="text-gray-500">Issue Date: {formatDate(issueDate.toISOString())}</p>
              <p className="text-gray-500">Due Date: {formatDate(fee.due_date)}</p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Bill To:</h3>
              <p className="mt-1">Parent/Guardian of</p>
              <p className="font-medium">{studentName}</p>
              <p className="text-gray-500">ID: {fee.student_id}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">From:</h3>
              <p className="mt-1">Downtown Nursery School</p>
              <p>123 School Street</p>
              <p>Kampala, Uganda</p>
              <p>Tel: +256 123 456 789</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium text-gray-900 mb-4">Invoice Details:</h3>
            <table className="w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3">{fee.description} ({fee.term}, {fee.academic_year})</td>
                  <td className="py-3 text-right">{formatCurrency(fee.amount)}</td>
                </tr>
                {/* If there were more items, they would go here */}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-300">
                  <th className="text-left py-3">Total Due</th>
                  <th className="text-right py-3">{formatCurrency(fee.amount)}</th>
                </tr>
                <tr>
                  <th className="text-left py-2">Amount Paid</th>
                  <th className="text-right py-2">{formatCurrency(fee.paid)}</th>
                </tr>
                <tr className="font-bold">
                  <th className="text-left py-2">Balance Due</th>
                  <th className="text-right py-2 text-red-600">{formatCurrency(fee.amount - fee.paid)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="mt-8 border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Payment Information:</h3>
            <p className="text-sm">Please make payment to the school account below:</p>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Bank:</p>
                <p>Standard Bank Uganda</p>
              </div>
              <div>
                <p className="text-gray-500">Account Number:</p>
                <p>1234567890</p>
              </div>
              <div>
                <p className="text-gray-500">Account Name:</p>
                <p>Downtown Nursery School</p>
              </div>
              <div>
                <p className="text-gray-500">Payment Reference:</p>
                <p>{invoiceNumber}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-500 border-t pt-4">
            <p className="font-medium text-gray-900 mb-2">Terms & Conditions:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Payment is due within 14 days of invoice date.</li>
              <li>Late payments may be subject to a 5% penalty.</li>
              <li>For questions about this invoice, contact the accounts office.</li>
            </ul>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Thank you for your prompt payment!</p>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2 mt-4">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handlePrint} disabled={isPrinting}>
            <Printer className="h-4 w-4 mr-2" />
            {isPrinting ? 'Printing...' : 'Print'}
          </Button>
          <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}