// src/pages/Settings.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  User,
  Lock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

export const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [userProfile, setUserProfile] = useState({
    fullName: 'Admin User',
    email: 'admin@downtown.edu',
    phone: '(555) 123-4567',
    role: 'admin'
  });
  
  const [appSettings, setAppSettings] = useState({
    theme: 'light',
    language: 'english',
    showWelcomeScreen: true,
    autoSave: true,
    enableNotifications: true,
    soundEffects: false
  });

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would call an API to save profile
    // await settingsApi.saveProfile(userProfile);
    
    setSaveLoading(false);
    alert('Profile updated successfully!');
  };
  
  const handleChangePassword = async () => {
    // Validate passwords
    if (!currentPassword) {
      alert('Please enter your current password');
      return;
    }
    
    if (!newPassword) {
      alert('Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setSaveLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would call an API to change password
    // await settingsApi.changePassword(currentPassword, newPassword);
    
    // Clear password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setSaveLoading(false);
    alert('Password changed successfully!');
  };
  
  const handleSaveAppSettings = async () => {
    setSaveLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would call an API to save settings
    // await settingsApi.saveAppSettings(appSettings);
    
    setSaveLoading(false);
    alert('Application settings saved successfully!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <Tabs defaultValue="profile" className="mb-6">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="mr-6">
                      <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                        {userProfile.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input 
                          value={userProfile.fullName}
                          onChange={(e) => setUserProfile({...userProfile, fullName: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input 
                          type="email"
                          value={userProfile.email}
                          onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <Input 
                          type="tel"
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Input 
                          value={userProfile.role}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">Your role cannot be changed</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saveLoading}>
                    {saveLoading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current Password</label>
                      <div className="relative">
                        <Input 
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                        <button 
                          className="absolute right-2 top-2 text-gray-500"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          type="button"
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Password</label>
                      <div className="relative">
                        <Input 
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button 
                          className="absolute right-2 top-2 text-gray-500"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          type="button"
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <button 
                          className="absolute right-2 top-2 text-gray-500"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          type="button"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={handleChangePassword} disabled={saveLoading}>
                      {saveLoading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white"></div>
                          Changing...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-4">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Enable two-factor authentication to add an extra layer of security to your account.
                  </p>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Setup Two-Factor Authentication
                  </Button>
                </div>
                
                <div className="border rounded-lg p-6 border-red-200">
                  <h3 className="font-medium mb-4 text-red-600">Session Management</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Sign out from all other sessions across all your devices.
                  </p>
                  <Button variant="destructive">
                    Sign Out From All Devices
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-4">Theme</h3>
                  <div className="flex space-x-4">
                    <label className={`border rounded-lg p-4 cursor-pointer ${appSettings.theme === 'light' ? 'ring-2 ring-blue-500' : ''}`}>
                      <input 
                        type="radio" 
                        name="theme" 
                        value="light" 
                        checked={appSettings.theme === 'light'} 
                        onChange={() => setAppSettings({...appSettings, theme: 'light'})}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center">
                        <Sun className="h-6 w-6 mb-2" />
                        <span>Light</span>
                      </div>
                    </label>
                    
                    <label className={`border rounded-lg p-4 cursor-pointer ${appSettings.theme === 'dark' ? 'ring-2 ring-blue-500' : ''}`}>
                      <input 
                        type="radio" 
                        name="theme" 
                        value="dark" 
                        checked={appSettings.theme === 'dark'} 
                        onChange={() => setAppSettings({...appSettings, theme: 'dark'})}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center">
                        <Moon className="h-6 w-6 mb-2" />
                        <span>Dark</span>
                      </div>
                    </label>
                    
                    <label className={`border rounded-lg p-4 cursor-pointer ${appSettings.theme === 'system' ? 'ring-2 ring-blue-500' : ''}`}>
                      <input 
                        type="radio" 
                        name="theme" 
                        value="system" 
                        checked={appSettings.theme === 'system'} 
                        onChange={() => setAppSettings({...appSettings, theme: 'system'})}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center">
                        <Monitor className="h-6 w-6 mb-2" />
                        <span>System</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-4">Language</h3>
                  <div className="space-y-2">
                    <select 
                      className="w-full border rounded-md h-10 px-3"
                      value={appSettings.language}
                      onChange={(e) => setAppSettings({...appSettings, language: e.target.value})}
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                    </select>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-4">Other Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Show Welcome Screen</h4>
                        <p className="text-sm text-gray-500">Show welcome screen on startup</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={appSettings.showWelcomeScreen}
                          onChange={() => setAppSettings({
                            ...appSettings, 
                            showWelcomeScreen: !appSettings.showWelcomeScreen
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto Save</h4>
                        <p className="text-sm text-gray-500">Automatically save changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={appSettings.autoSave}
                          onChange={() => setAppSettings({
                            ...appSettings, 
                            autoSave: !appSettings.autoSave
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Sound Effects</h4>
                        <p className="text-sm text-gray-500">Play sound on notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={appSettings.soundEffects}
                          onChange={() => setAppSettings({
                            ...appSettings, 
                            soundEffects: !appSettings.soundEffects
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveAppSettings} disabled={saveLoading}>
                    {saveLoading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
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
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">System Alerts</h4>
                        <p className="text-sm text-gray-500">Receive important system alerts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={appSettings.enableNotifications}
                          onChange={() => setAppSettings({
                            ...appSettings, 
                            enableNotifications: !appSettings.enableNotifications
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">New Messages</h4>
                        <p className="text-sm text-gray-500">Receive notifications for new messages</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={true}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">System Updates</h4>
                        <p className="text-sm text-gray-500">Receive notifications for system updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={true}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-4">Push Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Browser Notifications</h4>
                        <p className="text-sm text-gray-500">Allow browser notifications</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Request Permission
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Login Alerts</h4>
                        <p className="text-sm text-gray-500">Notify when someone logs into your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={true}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveAppSettings} disabled={saveLoading}>
                    {saveLoading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Notification Settings
                      </>
                    )}
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