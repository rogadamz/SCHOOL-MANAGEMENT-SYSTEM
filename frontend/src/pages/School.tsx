// src/pages/School.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  School as SchoolIcon,
  Users,
  Calendar,
  Clock,
  Save,
  Upload,
  Map,
  PhoneCall,
  Mail,
  Globe,
  FileText
} from 'lucide-react';

export const School = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saveLoading, setSaveLoading] = useState(false);
  const [schoolData, setSchoolData] = useState({
    name: 'Downtown Nursery School',
    motto: 'We shall reach the shore',
    address: '123 Education Street, Downtown, City',
    phone: '(555) 123-4567',
    email: 'info@downtown.edu',
    website: 'www.downtown.edu',
    principalName: 'Dr. Jane Smith',
    foundedYear: '2010',
    logo: '/logo.png'
  });
  
  const [academicSettings, setAcademicSettings] = useState({
    currentTerm: 'Term 2',
    currentAcademicYear: '2024-2025',
    termsPerYear: '3',
    schoolStartTime: '08:30',
    schoolEndTime: '15:30',
    lunchStartTime: '12:00',
    lunchEndTime: '13:00'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    sendAttendanceAlerts: true,
    sendFeeReminders: true,
    sendGradeNotifications: true,
    sendEventReminders: true,
    autoGenerateReports: true
  });

  const handleSaveGeneral = async () => {
    setSaveLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would call an API to save the settings
    // await schoolApi.saveGeneralSettings(schoolData);
    
    setSaveLoading(false);
    alert('General settings saved successfully!');
  };
  
  const handleSaveAcademic = async () => {
    setSaveLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would call an API to save the settings
    // await schoolApi.saveAcademicSettings(academicSettings);
    
    setSaveLoading(false);
    alert('Academic settings saved successfully!');
  };
  
  const handleSaveNotifications = async () => {
    setSaveLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would call an API to save the settings
    // await schoolApi.saveNotificationSettings(notificationSettings);
    
    setSaveLoading(false);
    alert('Notification settings saved successfully!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">School Settings</h2>
        <div>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate School Profile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backups">Backups & Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">School Name</label>
                    <Input 
                      value={schoolData.name}
                      onChange={(e) => setSchoolData({...schoolData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">School Motto</label>
                    <Input 
                      value={schoolData.motto}
                      onChange={(e) => setSchoolData({...schoolData, motto: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input 
                      value={schoolData.address}
                      onChange={(e) => setSchoolData({...schoolData, address: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input 
                      value={schoolData.phone}
                      onChange={(e) => setSchoolData({...schoolData, phone: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input 
                      value={schoolData.email}
                      onChange={(e) => setSchoolData({...schoolData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input 
                      value={schoolData.website}
                      onChange={(e) => setSchoolData({...schoolData, website: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Principal's Name</label>
                    <Input 
                      value={schoolData.principalName}
                      onChange={(e) => setSchoolData({...schoolData, principalName: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Founded Year</label>
                    <Input 
                      value={schoolData.foundedYear}
                      onChange={(e) => setSchoolData({...schoolData, foundedYear: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">School Logo</label>
                    <div className="border rounded-lg p-4 flex flex-col items-center justify-center">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        <SchoolIcon className="h-16 w-16 text-gray-400" />
                      </div>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveGeneral} disabled={saveLoading}>
                  {saveLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Term</label>
                    <select className="w-full border rounded-md h-10 px-3">
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2" selected>Term 2</option>
                      <option value="Term 3">Term 3</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Academic Year</label>
                    <Input 
                      value={academicSettings.currentAcademicYear}
                      onChange={(e) => setAcademicSettings({...academicSettings, currentAcademicYear: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Terms Per Year</label>
                    <Input 
                      type="number"
                      value={academicSettings.termsPerYear}
                      onChange={(e) => setAcademicSettings({...academicSettings, termsPerYear: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">School Hours</label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="time"
                        value={academicSettings.schoolStartTime}
                        onChange={(e) => setAcademicSettings({...academicSettings, schoolStartTime: e.target.value})}
                      />
                      <span>to</span>
                      <Input 
                        type="time"
                        value={academicSettings.schoolEndTime}
                        onChange={(e) => setAcademicSettings({...academicSettings, schoolEndTime: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lunch Break</label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="time"
                        value={academicSettings.lunchStartTime}
                        onChange={(e) => setAcademicSettings({...academicSettings, lunchStartTime: e.target.value})}
                      />
                      <span>to</span>
                      <Input 
                        type="time"
                        value={academicSettings.lunchEndTime}
                        onChange={(e) => setAcademicSettings({...academicSettings, lunchEndTime: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grade Scale</label>
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span>A: 90-100</span>
                        <span>Excellent</span>
                      </div>
                      <div className="flex justify-between">
                        <span>B: 80-89</span>
                        <span>Good</span>
                      </div>
                      <div className="flex justify-between">
                        <span>C: 70-79</span>
                        <span>Satisfactory</span>
                      </div>
                      <div className="flex justify-between">
                        <span>D: 60-69</span>
                        <span>Needs Improvement</span>
                      </div>
                      <div className="flex justify-between">
                        <span>F: Below 60</span>
                        <span>Unsatisfactory</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveAcademic} disabled={saveLoading}>
                  {saveLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Attendance Alerts</h3>
                    <p className="text-sm text-gray-500">Send alerts to parents when their child is marked absent</p>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.sendAttendanceAlerts}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings, 
                          sendAttendanceAlerts: !notificationSettings.sendAttendanceAlerts
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Fee Reminders</h3>
                    <p className="text-sm text-gray-500">Send reminders about upcoming fee due dates</p>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.sendFeeReminders}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings, 
                          sendFeeReminders: !notificationSettings.sendFeeReminders
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Grade Notifications</h3>
                    <p className="text-sm text-gray-500">Send notifications when new grades are recorded</p>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.sendGradeNotifications}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings, 
                          sendGradeNotifications: !notificationSettings.sendGradeNotifications
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Event Reminders</h3>
                    <p className="text-sm text-gray-500">Send reminders about upcoming school events</p>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.sendEventReminders}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings, 
                          sendEventReminders: !notificationSettings.sendEventReminders
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Auto-Generate Reports</h3>
                    <p className="text-sm text-gray-500">Automatically generate and send periodic reports</p>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.autoGenerateReports}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings, 
                          autoGenerateReports: !notificationSettings.autoGenerateReports
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveNotifications} disabled={saveLoading}>
                  {saveLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle>Backups & Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-blue-800 font-medium mb-2">Data Management</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Manage your school's data, create backups, and restore when needed.
                  </p>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-4">Backup Database</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Create a full backup of your school database. This includes all student records, grades, attendance, and financial data.
                  </p>
                  <div className="flex gap-4">
                    <Button>
                      Create Backup Now
                    </Button>
                    <Button variant="outline">
                      Schedule Regular Backups
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-4">Recent Backups</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">Full Backup</div>
                        <div className="text-sm text-gray-500">March 1, 2025 - 09:30 AM</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Restore</Button>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">Full Backup</div>
                        <div className="text-sm text-gray-500">February 1, 2025 - 09:30 AM</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Restore</Button>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">Full Backup</div>
                        <div className="text-sm text-gray-500">January 1, 2025 - 09:30 AM</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Restore</Button>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6 border-red-300">
                  <h3 className="font-medium mb-4 text-red-600">Data Reset</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Warning: This will remove all data from your school management system. This action cannot be undone.
                  </p>
                  <Button variant="destructive">
                    Reset All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};