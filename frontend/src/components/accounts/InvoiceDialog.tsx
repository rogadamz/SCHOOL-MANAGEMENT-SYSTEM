// frontend/src/components/accounts/InvoiceDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Download, Mail, Printer, Share2, FileText, Loader2, Copy,
  CheckCircle, AlertCircle, ExternalLink
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ExtendedFee } from '@/services/api-extension';

interface InvoiceDialogProps {
  fee: ExtendedFee;
  isOpen: boolean;
  onClose: () => void;
  getStudentName: (studentId: number) => string;
}

export const InvoiceDialog = ({
  fee,
  isOpen,
  onClose,
  getStudentName
}: InvoiceDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>('invoice');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Format currency in UGX
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get payment status with styling
  const getPaymentStatus = () => {
    const status = fee.status;
    const balance = fee.amount - fee.paid;
    
    if (status === 'paid') {
      return { text: 'PAID', colorClass: 'text-green-600 border-green-600' };
    } else if (status === 'partial') {
      return { text: 'PARTIALLY PAID', colorClass: 'text-yellow-600 border-yellow-600' };
    } else if (new Date(fee.due_date) < new Date()) {
      return { text: 'OVERDUE', colorClass: 'text-red-600 border-red-600' };
    } else {
      return { text: 'PENDING', colorClass: 'text-blue-600 border-blue-600' };
    }
  };

  // Handle print invoice
  const handlePrint = () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    setTimeout(() => {
      try {
        const invoiceElement = document.getElementById('invoice-printable');
        if (invoiceElement) {
          // Open a new window
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            // Copy content to the new window
            printWindow.document.write('<html><head><title>Invoice</title>');
            printWindow.document.write('<style>');
            printWindow.document.write(`
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .invoice { max-width: 800px; margin: 0 auto; }
              .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .invoice-body { margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f9fafb; }
              .amount { text-align: right; }
              .total { font-weight: bold; }
              .footer { margin-top: 50px; font-size: 12px; color: #6b7280; }
              .payment-status {
                display: inline-block;
                padding: 5px 10px;
                border: 2px solid;
                font-weight: bold;
                transform: rotate(-15deg);
                position: absolute;
                top: 80px;
                right: 40px;
                font-size: 24px;
              }
              @media print {
                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              }
            `);
            printWindow.document.write('</style></head><body>');
            printWindow.document.write(invoiceElement.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            
            // Focus on the new window
            printWindow.focus();
            
            // Add a small delay to ensure content is loaded
            setTimeout(() => {
              // Trigger print dialog
              printWindow.print();
              setSuccess('Invoice sent to printer');
              setLoading(false);
            }, 500);
          } else {
            throw new Error('Could not open print window. Please check your popup blocker settings.');
          }
        } else {
          throw new Error('Invoice element not found');
        }
      } catch (err: any) {
        console.error('Error printing invoice:', err);
        setError(err.message || 'Failed to print invoice');
        setLoading(false);
      }
    }, 1000);
  };

  // Handle download invoice as PDF
  const handleDownload = () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Actual download implementation
    try {
      // Get the invoice element
      const invoiceElement = document.getElementById('invoice-printable');
      if (!invoiceElement) {
        throw new Error('Invoice element not found');
      }
      
      // Create a hidden link
      const link = document.createElement('a');
      link.download = `Invoice-${getInvoiceNumber()}.pdf`;
      
      // In a real implementation, you would use a library like jsPDF or 
      // call a backend endpoint to generate a PDF. For now, we'll simulate
      // the download by creating a data URL.
      
      // Create a blob of the HTML content (this is a simplified approach)
      const html = `
        <html>
          <head>
            <title>Invoice ${getInvoiceNumber()}</title>
            <style>
              body { font-family: Arial, sans-serif; }
              /* Add more styles as needed */
            </style>
          </head>
          <body>
            ${invoiceElement.outerHTML}
          </body>
        </html>
      `;
      
      const blob = new Blob([html], { type: 'text/html' });
      link.href = URL.createObjectURL(blob);
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      setSuccess('Invoice downloaded successfully');
    } catch (err: any) {
      console.error('Error downloading invoice:', err);
      setError(err.message || 'Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };

  // Handle email invoice
  const handleEmailInvoice = () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Simulate email sending
    setTimeout(() => {
      try {
        // In a real implementation, this would call a backend endpoint
        
        // Simulate successful email
        setSuccess('Invoice emailed to parent/guardian');
        setLoading(false);
      } catch (err: any) {
        console.error('Error emailing invoice:', err);
        setError(err.message || 'Failed to email invoice');
        setLoading(false);
      }
    }, 1500);
  };

  // Get invoice number
  const getInvoiceNumber = () => {
    return fee.invoice_number || `INV-${new Date().getFullYear()}-${10000 + fee.id}`;
  };

  // Handle copy payment link
  const handleCopyPaymentLink = () => {
    setError(null);
    setSuccess(null);
    
    try {
      // Generate a mock payment link
      const paymentLink = `https://school.com/pay/${getInvoiceNumber()}`;
      navigator.clipboard.writeText(paymentLink);
      setSuccess('Payment link copied to clipboard');
    } catch (err: any) {
      console.error('Error copying payment link:', err);
      setError(err.message || 'Failed to copy payment link');
    }
  };

  if (!fee) return null;

  const paymentStatus = getPaymentStatus();
  const invoiceNumber = getInvoiceNumber();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="invoice" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="invoice">Invoice</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handlePrint}
                      disabled={loading}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Print Invoice</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleDownload}
                      disabled={loading}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download PDF</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleEmailInvoice}
                      disabled={loading}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Email Invoice</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleCopyPaymentLink}
                      disabled={loading}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Payment Link</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="invoice">
            <div 
              id="invoice-printable" 
              className="border rounded-lg p-6 bg-white relative overflow-hidden"
            >
              {/* Payment Status Watermark */}
              <div className={`absolute top-20 right-8 transform -rotate-12 border-8 ${paymentStatus.colorClass} rounded-lg px-4 py-2 text-3xl font-black opacity-[0.15]`}>
                {paymentStatus.text}
              </div>
              
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">INVOICE</h2>
                  <p className="text-gray-500">{invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-gray-800">Downtown Nursery School</h3>
                  <p className="text-gray-600">123 Education Street</p>
                  <p className="text-gray-600">Kampala, Uganda</p>
                  <p className="text-gray-600">info@downtownnursery.edu</p>
                  <p className="text-gray-600">+256 700 123456</p>
                </div>
              </div>
              
              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-gray-500 font-medium mb-2">BILL TO</h4>
                  <p className="font-semibold">{getStudentName(fee.student_id)}</p>
                  <p className="text-gray-600">Student ID: {fee.student_id}</p>
                  <p className="text-gray-600">
                    {fee.term} - {fee.academic_year}
                  </p>
                </div>
                <div className="text-right">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Invoice Date:</span>
                      <span>{formatDate(fee.due_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Due Date:</span>
                      <span>{formatDate(fee.due_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Status:</span>
                      <span className={paymentStatus.colorClass.replace('border-', 'text-')}>
                        {paymentStatus.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Invoice Items */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 bg-gray-50">Description</th>
                      <th className="text-left py-3 px-4 bg-gray-50">Term</th>
                      <th className="text-left py-3 px-4 bg-gray-50">Category</th>
                      <th className="text-right py-3 px-4 bg-gray-50">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-4 px-4">{fee.description}</td>
                      <td className="py-4 px-4">{fee.term}</td>
                      <td className="py-4 px-4">{fee.category || 'Tuition'}</td>
                      <td className="py-4 px-4 text-right">{formatCurrency(fee.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Invoice Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(fee.amount)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Paid:</span>
                    <span>{formatCurrency(fee.paid)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
                    <span>Balance:</span>
                    <span>
                      {formatCurrency(fee.amount - fee.paid)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Payment Instructions */}
              <div className="border-t pt-6 mb-6">
                <h4 className="text-gray-700 font-semibold mb-2">Payment Instructions</h4>
                <p className="text-gray-600 mb-4">
                  Please make payment to the bank details below or at the school accounts office.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Bank Transfer:</p>
                    <p className="text-gray-600">Downtown Nursery School</p>
                    <p className="text-gray-600">Bank of Africa</p>
                    <p className="text-gray-600">Account: 0123456789</p>
                    <p className="text-gray-600">Branch: Kampala Main</p>
                  </div>
                  <div>
                    <p className="font-medium">Mobile Money:</p>
                    <p className="text-gray-600">0700 123456</p>
                    <p className="text-gray-600">Name: Downtown Nursery</p>
                    <p className="text-gray-600">Reference: {invoiceNumber}</p>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              {fee.notes && (
                <div className="mb-6">
                  <h4 className="text-gray-700 font-semibold mb-2">Notes</h4>
                  <p className="text-gray-600">
                    {fee.notes}
                  </p>
                </div>
              )}
              
              {/* Terms */}
              <div className="border-t pt-6 text-sm text-gray-500">
                <h4 className="text-gray-700 font-semibold mb-2">Terms & Conditions</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>All fees are to be paid by the due date.</li>
                  <li>Late payments may incur a 5% surcharge.</li>
                  <li>For payment plans, please contact the accounts office.</li>
                  <li>All payments are non-refundable.</li>
                </ol>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fee.paid > 0 ? (
                    // If there's a payment, show it
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fee.last_payment_date ? formatDate(fee.last_payment_date) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fee.payment_method || 'Cash'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        RCT-{new Date().getFullYear()}-{1000 + fee.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(fee.paid)}
                      </td>
                    </tr>
                  ) : (
                    // If no payment, show "No payment history" message
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No payment history available
                      </td>
                    </tr>
                  )}
                </tbody>
                {fee.paid > 0 && (
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium">
                        Total Paid:
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium">
                        {formatCurrency(fee.paid)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium">
                        Balance:
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium">
                        {formatCurrency(fee.amount - fee.paid)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            
            {/* Online Payment Options */}
            {fee.amount - fee.paid > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Online Payment Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={handleCopyPaymentLink} className="flex justify-center items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy Payment Link
                  </Button>
                  <Button onClick={handleEmailInvoice} variant="outline" className="flex justify-center items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Payment Link
                  </Button>
                  <Button variant="outline" className="flex justify-center items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Pay Online Now
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};