// frontend/src/components/accounts/FinancialReports.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download, FileText, Calendar, Clock, Printer, BarChart, PieChart, 
  TrendingUp, ClipboardList, Loader2, CheckCircle2
} from 'lucide-react';
import { FinancialReport, financialApi, GenerateReportRequest } from '@/services/api-extension';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Sample reports for demonstration
const SAMPLE_REPORTS: FinancialReport[] = [
  {
    id: 'report-1',
    title: 'Term 1 Fee Collection Summary',
    description: 'Summary of all fee collections for Term 1 of 2024-2025',
    date: '2025-01-15T10:30:00Z',
    type: 'summary',
    url: '/reports/term1-summary.pdf'
  },
  {
    id: 'report-2',
    title: 'End of Year Financial Statement',
    description: 'Detailed financial statement for the 2023-2024 academic year',
    date: '2024-11-30T15:45:00Z',
    type: 'detailed',
    url: '/reports/year-end-2024.xlsx'
  },
  {
    id: 'report-3',
    title: 'Outstanding Fees Report',
    description: 'List of all outstanding fees as of March 1, 2025',
    date: '2025-03-01T09:15:00Z',
    type: 'detailed',
    url: '/reports/outstanding-fees-march.pdf'
  },
  {
    id: 'report-4',
    title: 'Payment Method Analysis',
    description: 'Analysis of fee payments by payment method',
    date: '2025-02-10T14:20:00Z',
    type: 'custom',
    url: '/reports/payment-method-analysis.pdf'
  }
];

// Report type definitions
const REPORT_TYPES = [
  { id: 'fee_collection', name: 'Fee Collection Summary', icon: BarChart },
  { id: 'outstanding_fees', name: 'Outstanding Fees', icon: ClipboardList },
  { id: 'payment_methods', name: 'Payment Methods', icon: PieChart },
  { id: 'collection_trends', name: 'Collection Trends', icon: TrendingUp },
  { id: 'detailed_ledger', name: 'Detailed Ledger', icon: FileText }
];

export const FinancialReports = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('generate');
  const [reports, setReports] = useState<FinancialReport[]>(SAMPLE_REPORTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Report generation form state
  const [reportType, setReportType] = useState<string>('fee_collection');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [includeDetails, setIncludeDetails] = useState<boolean>(false);
  const [feeTypes, setFeeTypes] = useState<string[]>([]);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  
  // Handle generate report
  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!reportType) {
        throw new Error('Please select a report type');
      }
      
      if (!startDate || !endDate) {
        throw new Error('Please select a date range');
      }
      
      // Prepare request
      const request: GenerateReportRequest = {
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
        include_details: includeDetails,
        format: reportFormat
      };
      
      if (feeTypes.length > 0) {
        request.fee_types = feeTypes;
      }
      
      // Call API
      const result = await financialApi.generateReport(request);
      
      // Show success
      setSuccess(true);
      
      // Add new report to list
      setTimeout(() => {
        const newReport: FinancialReport = {
          id: result.reportId,
          title: `${REPORT_TYPES.find(r => r.id === reportType)?.name || 'Custom Report'} - ${new Date().toLocaleDateString()}`,
          description: `${REPORT_TYPES.find(r => r.id === reportType)?.name || 'Custom Report'} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
          date: new Date().toISOString(),
          type: includeDetails ? 'detailed' : 'summary',
          url: result.downloadUrl
        };
        
        setReports([newReport, ...reports]);
        setSuccess(false);
        setActiveTab('history');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle download report
  const handleDownloadReport = (report: FinancialReport) => {
    // In a real app, this would navigate to the report URL or trigger a download
    console.log('Downloading report:', report);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Financial Reports</CardTitle>
        <CardDescription>Generate and view financial reports</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="history">Report History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6 mt-6">
            {success ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Report Generated Successfully</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Your financial report has been generated and is ready to download.
                </p>
                <div className="flex gap-4">
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('history')}>
                    View All Reports
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {REPORT_TYPES.map((type) => (
                        <div 
                          key={type.id}
                          className={`
                            border rounded-lg p-4 cursor-pointer transition-colors
                            ${reportType === type.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
                          `}
                          onClick={() => setReportType(type.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md ${reportType === type.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                              <type.icon className="h-5 w-5" />
                            </div>
                            <span className="font-medium">{type.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Fee Categories</Label>
                      <div className="border rounded-md p-3 space-y-2">
                        {['Tuition', 'Transportation', 'Lab Fees', 'Materials', 'Activities'].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`fee-type-${type}`}
                              checked={feeTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFeeTypes([...feeTypes, type]);
                                } else {
                                  setFeeTypes(feeTypes.filter(t => t !== type));
                                }
                              }}
                            />
                            <Label
                              htmlFor={`fee-type-${type}`}
                              className="cursor-pointer text-sm"
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">Leave empty to include all categories</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Report Format</Label>
                        <Select value={reportFormat} onValueChange={(value) => setReportFormat(value as 'pdf' | 'excel' | 'csv')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF Document</SelectItem>
                            <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                            <SelectItem value="csv">CSV File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-details"
                          checked={includeDetails}
                          onCheckedChange={(checked) => setIncludeDetails(!!checked)}
                        />
                        <Label
                          htmlFor="include-details"
                          className="cursor-pointer text-sm"
                        >
                          Include detailed transaction records
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleGenerateReport} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-4">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
                  <p className="text-muted-foreground">
                    Generate your first financial report to get started.
                  </p>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{report.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(report.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{new Date(report.date).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>{report.type === 'summary' ? 'Summary' : report.type === 'detailed' ? 'Detailed' : 'Custom'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};