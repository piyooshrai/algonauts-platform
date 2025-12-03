"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Upload,
  User,
  Mail,
  Phone,
  Bell,
  Shield,
  Save,
  Camera,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Checkbox,
  Separator,
} from "@/components/ui";

export default function CollegeSettingsPage() {
  const [collegeInfo, setCollegeInfo] = useState({
    name: "Indian Institute of Technology Delhi",
    shortName: "IIT Delhi",
    website: "https://iitd.ac.in",
    address: "Hauz Khas, New Delhi - 110016",
    establishedYear: "1961",
  });

  const [placementOfficer, setPlacementOfficer] = useState({
    name: "Dr. Rajesh Sharma",
    designation: "Head of Training & Placement",
    email: "placement@iitd.ac.in",
    phone: "+91 11 2659 1000",
  });

  const [notifications, setNotifications] = useState({
    newAssessments: true,
    studentSignups: true,
    weeklyReports: true,
    placementAlerts: true,
    systemUpdates: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your college profile and preferences
          </p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </motion.div>

      {/* College Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              College Information
            </CardTitle>
            <CardDescription>
              Basic information about your institution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">College Logo</h4>
                <p className="text-sm text-muted-foreground">
                  Upload your institution&apos;s logo. Recommended size: 200x200px
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </Button>
              </div>
            </div>

            <Separator />

            {/* College Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-2 block">College Name</label>
                <Input
                  value={collegeInfo.name}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, name: e.target.value })}
                  placeholder="Full college name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Short Name</label>
                <Input
                  value={collegeInfo.shortName}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, shortName: e.target.value })}
                  placeholder="e.g., IIT Delhi"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Established Year</label>
                <Input
                  value={collegeInfo.establishedYear}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, establishedYear: e.target.value })}
                  placeholder="e.g., 1961"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Website</label>
                <Input
                  value={collegeInfo.website}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Address</label>
                <Input
                  value={collegeInfo.address}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Placement Officer Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Placement Officer Details
            </CardTitle>
            <CardDescription>
              Contact information for the placement cell
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  icon={User}
                  value={placementOfficer.name}
                  onChange={(e) =>
                    setPlacementOfficer({ ...placementOfficer, name: e.target.value })
                  }
                  placeholder="Officer name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Designation</label>
                <Input
                  value={placementOfficer.designation}
                  onChange={(e) =>
                    setPlacementOfficer({ ...placementOfficer, designation: e.target.value })
                  }
                  placeholder="Job title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  icon={Mail}
                  type="email"
                  value={placementOfficer.email}
                  onChange={(e) =>
                    setPlacementOfficer({ ...placementOfficer, email: e.target.value })
                  }
                  placeholder="email@college.edu"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <Input
                  icon={Phone}
                  value={placementOfficer.phone}
                  onChange={(e) =>
                    setPlacementOfficer({ ...placementOfficer, phone: e.target.value })
                  }
                  placeholder="+91..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose what updates you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox
              id="newAssessments"
              checked={notifications.newAssessments}
              onChange={(e) =>
                setNotifications({ ...notifications, newAssessments: e.target.checked })
              }
              label="New assessment releases"
            />
            <p className="text-sm text-muted-foreground ml-6 -mt-2">
              Get notified when new assessments are available for your students
            </p>

            <Checkbox
              id="studentSignups"
              checked={notifications.studentSignups}
              onChange={(e) =>
                setNotifications({ ...notifications, studentSignups: e.target.checked })
              }
              label="Student signups"
            />
            <p className="text-sm text-muted-foreground ml-6 -mt-2">
              Receive alerts when students register through your college portal
            </p>

            <Checkbox
              id="weeklyReports"
              checked={notifications.weeklyReports}
              onChange={(e) =>
                setNotifications({ ...notifications, weeklyReports: e.target.checked })
              }
              label="Weekly performance reports"
            />
            <p className="text-sm text-muted-foreground ml-6 -mt-2">
              Get a summary of student performance every week
            </p>

            <Checkbox
              id="placementAlerts"
              checked={notifications.placementAlerts}
              onChange={(e) =>
                setNotifications({ ...notifications, placementAlerts: e.target.checked })
              }
              label="Placement opportunity alerts"
            />
            <p className="text-sm text-muted-foreground ml-6 -mt-2">
              Be notified when companies express interest in your students
            </p>

            <Checkbox
              id="systemUpdates"
              checked={notifications.systemUpdates}
              onChange={(e) =>
                setNotifications({ ...notifications, systemUpdates: e.target.checked })
              }
              label="System updates and maintenance"
            />
            <p className="text-sm text-muted-foreground ml-6 -mt-2">
              Important platform updates and scheduled maintenance
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <h4 className="font-medium">Change Password</h4>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
              <Button variant="outline">Change</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <h4 className="font-medium">Active Sessions</h4>
                <p className="text-sm text-muted-foreground">
                  View and manage your active login sessions
                </p>
              </div>
              <Button variant="outline">View</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-error-500/30">
          <CardHeader>
            <CardTitle className="text-error-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border border-error-500/30 bg-error-500/5">
              <div>
                <h4 className="font-medium text-error-600">Delete College Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your college account and all associated data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
