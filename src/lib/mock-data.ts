
import { type User } from "firebase/auth"; // Placeholder, not used due to no Firebase integration

export type CustomerLog = {
  id: string;
  timestamp: string;
  customerId: string;
  customerName: string;
  type: "entry" | "exit";
  employeeInvolved: string;
};

export const mockCustomerLogs: CustomerLog[] = [
  { id: "cl1", timestamp: "2024-07-28 10:05:15", customerId: "CUST001", customerName: "Ayşe Yılmaz", type: "entry", employeeInvolved: "Ahmet Kaya" },
  { id: "cl2", timestamp: "2024-07-28 10:30:42", customerId: "CUST002", customerName: "Mehmet Öz", type: "entry", employeeInvolved: "Zeynep Demir" },
  { id: "cl3", timestamp: "2024-07-28 11:15:03", customerId: "CUST001", customerName: "Ayşe Yılmaz", type: "exit", employeeInvolved: "Ahmet Kaya" },
  { id: "cl4", timestamp: "2024-07-28 12:00:50", customerId: "CUST003", customerName: "Fatma Şahin", type: "entry", employeeInvolved: "Ahmet Kaya" },
  { id: "cl5", timestamp: "2024-07-28 12:45:22", customerId: "CUST002", customerName: "Mehmet Öz", type: "exit", employeeInvolved: "Zeynep Demir" },
];

export type Membership = {
  id: string;
  memberId: string;
  name: string;
  status: "active" | "inactive" | "expired";
  joinDate: string;
  lastVisit: string;
  email: string;
};

export const mockMemberships: Membership[] = [
  { id: "mem1", memberId: "MEM001", name: "Ali Veli", status: "active", joinDate: "2023-01-15", lastVisit: "2024-07-25", email: "ali.veli@example.com" },
  { id: "mem2", memberId: "MEM002", name: "Buse Can", status: "active", joinDate: "2022-11-01", lastVisit: "2024-07-20", email: "buse.can@example.com" },
  { id: "mem3", memberId: "MEM003", name: "Cem Durmaz", status: "inactive", joinDate: "2023-05-10", lastVisit: "2024-03-10", email: "cem.durmaz@example.com" },
  { id: "mem4", memberId: "MEM004", name: "Deniz Arslan", status: "expired", joinDate: "2023-07-01", lastVisit: "2024-06-30", email: "deniz.arslan@example.com" },
];

export type EmployeeActivity = {
  id: string;
  timestamp: string;
  employeeName: string;
  employeeEmail: string; 
  description: string; 
  eventType: "TASK" | "QR_ENTRY" | "QR_EXIT" | "LEAVE_REQUEST";
  status?: "started" | "in_progress" | "completed" | "pending" | "approved" | "rejected"; // For TASK and LEAVE_REQUEST
  duration?: string; // For TASK type
  leaveReason?: string; // For LEAVE_REQUEST
  leaveStartDate?: string; // For LEAVE_REQUEST
  leaveEndDate?: string; // For LEAVE_REQUEST
};

const initialEmployeeActivities: EmployeeActivity[] = [
  { id: "ea1", timestamp: "2024-07-28 09:00:00", employeeName: "Ahmet Kaya", employeeEmail: "ahmet@example.com", description: "Sabah kontrolü", eventType: "TASK", status: "completed", duration: "15dk" },
  { id: "ea2", timestamp: "2024-07-28 09:30:00", employeeName: "Zeynep Demir", employeeEmail: "zeynep@example.com", description: "Yeni üye kaydı: MEM005", eventType: "TASK", status: "completed", duration: "10dk" },
];

export type Personnel = {
  id: string;
  name: string;
  email: string;
};

const initialPersonnel: Personnel[] = [
  { id: "p1", name: "Ahmet Kaya", email: "ahmet@example.com" },
  { id: "p2", name: "Zeynep Demir", email: "zeynep@example.com" },
  { id: "p3", name: "Mehmet Yılmaz", email: "mehmet@example.com" },
  { id: "admin", name: "Admin Patron", email: "admin@biztrack.com" }, // Added admin user
];

export const mockEmployees = initialPersonnel.map(p => p.name);
export const PATRON_EMAIL = "admin@biztrack.com";


// localStorage helpers for Employee Activities
const EMPLOYEE_ACTIVITIES_STORAGE_KEY = "biztrack_employee_activities";

export const getEmployeeActivitiesFromStorage = (): EmployeeActivity[] => {
  if (typeof window === "undefined") return initialEmployeeActivities;
  const storedActivities = localStorage.getItem(EMPLOYEE_ACTIVITIES_STORAGE_KEY);
  if (storedActivities) {
    try {
      return JSON.parse(storedActivities);
    } catch (e) {
      console.error("Error parsing employee activities from localStorage", e);
      localStorage.setItem(EMPLOYEE_ACTIVITIES_STORAGE_KEY, JSON.stringify(initialEmployeeActivities));
      return initialEmployeeActivities;
    }
  }
  localStorage.setItem(EMPLOYEE_ACTIVITIES_STORAGE_KEY, JSON.stringify(initialEmployeeActivities));
  return initialEmployeeActivities;
};

export const saveEmployeeActivityToStorage = (activity: Omit<EmployeeActivity, 'id' | 'timestamp' | 'employeeName'> & { employeeName?: string }): EmployeeActivity => {
  if (typeof window === "undefined") {
    const nameToUse = activity.employeeName || activity.employeeEmail.split('@')[0];
    const newActivity = { ...activity, employeeName: nameToUse, id: `ea${Date.now()}`, timestamp: new Date().toISOString()};
    initialEmployeeActivities.unshift(newActivity); 
    return newActivity;
  }
  
  const activities = getEmployeeActivitiesFromStorage();
  const currentUser = getCurrentUser();
  
  const nameToUse = activity.employeeName || (currentUser?.name) || activity.employeeEmail.split('@')[0];

  const newActivity: EmployeeActivity = {
    ...activity,
    employeeName: nameToUse,
    id: `ea${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  const updatedActivities = [newActivity, ...activities]; 
  localStorage.setItem(EMPLOYEE_ACTIVITIES_STORAGE_KEY, JSON.stringify(updatedActivities));
  
  window.dispatchEvent(new StorageEvent('storage', {
    key: EMPLOYEE_ACTIVITIES_STORAGE_KEY,
    newValue: JSON.stringify(updatedActivities),
  }));

  return newActivity;
};

// Personnel localStorage helpers
const PERSONNEL_STORAGE_KEY = "biztrack_personnel_list";

export const getPersonnelListFromStorage = (): Personnel[] => {
  if (typeof window === "undefined") return initialPersonnel;
  const storedPersonnel = localStorage.getItem(PERSONNEL_STORAGE_KEY);
  if (storedPersonnel) {
    try {
      return JSON.parse(storedPersonnel);
    } catch (e) {
      console.error("Error parsing personnel list from localStorage", e);
      localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(initialPersonnel));
      return initialPersonnel;
    }
  }
  localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(initialPersonnel));
  return initialPersonnel;
};

export const addPersonnelToStorage = (personnel: Omit<Personnel, 'id'>): Personnel => {
  if (typeof window === "undefined") {
    const newPersonnel = { ...personnel, id: `p${Date.now()}` };
    initialPersonnel.push(newPersonnel);
    return newPersonnel;
  }
  const personnelList = getPersonnelListFromStorage();
  const newPersonnel: Personnel = {
    ...personnel,
    id: `p${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };
  const updatedPersonnelList = [...personnelList, newPersonnel];
  localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(updatedPersonnelList));
  window.dispatchEvent(new StorageEvent('storage', { key: PERSONNEL_STORAGE_KEY, newValue: JSON.stringify(updatedPersonnelList) }));
  return newPersonnel;
};

export const removePersonnelFromStorage = (personnelId: string): void => {
  if (typeof window === "undefined") {
    const index = initialPersonnel.findIndex(p => p.id === personnelId);
    if (index > -1) initialPersonnel.splice(index, 1);
    return;
  }
  let personnelList = getPersonnelListFromStorage();
  personnelList = personnelList.filter(p => p.id !== personnelId);
  localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(personnelList));
  window.dispatchEvent(new StorageEvent('storage', { key: PERSONNEL_STORAGE_KEY, newValue: JSON.stringify(personnelList) }));
};


// Current User helper
export const getCurrentUser = (): { email: string, name: string } | null => {
  if (typeof window === "undefined") return null;
  const storedUser = localStorage.getItem("biztrack_currentUser");
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser) as { email: string, name?:string };
      if (parsedUser.email && !parsedUser.name) {
         const personnelList = getPersonnelListFromStorage(); // Make sure this is initialized if empty
         const matchedPersonnel = personnelList.find(p => p.email === parsedUser.email);
         if (matchedPersonnel && matchedPersonnel.name) {
           parsedUser.name = matchedPersonnel.name;
         } else {
           parsedUser.name = parsedUser.email.split('@')[0]; 
         }
      }
      if (!parsedUser.name && parsedUser.email) {
        parsedUser.name = parsedUser.email.split('@')[0];
      }
      return parsedUser as { email: string, name: string };
    } catch (e) {
      console.error("Failed to parse current user from localStorage", e);
      return null;
    }
  }
  return null;
};


// Leave Request Type
export type LeaveRequest = {
  id: string;
  employeeEmail: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  submissionTimestamp: string;
  status: "pending" | "approved" | "rejected";
};

const LEAVE_REQUESTS_STORAGE_KEY = "biztrack_leave_requests";
const initialLeaveRequests: LeaveRequest[] = [];

export const getLeaveRequestsFromStorage = (): LeaveRequest[] => {
  if (typeof window === "undefined") return initialLeaveRequests;
  const storedRequests = localStorage.getItem(LEAVE_REQUESTS_STORAGE_KEY);
  if (storedRequests) {
    try {
      return JSON.parse(storedRequests);
    } catch (e) {
      console.error("Error parsing leave requests from localStorage", e);
      localStorage.setItem(LEAVE_REQUESTS_STORAGE_KEY, JSON.stringify(initialLeaveRequests));
      return initialLeaveRequests;
    }
  }
  localStorage.setItem(LEAVE_REQUESTS_STORAGE_KEY, JSON.stringify(initialLeaveRequests));
  return initialLeaveRequests;
};

export const saveLeaveRequestToStorage = (requestData: Omit<LeaveRequest, 'id' | 'submissionTimestamp' | 'employeeName' | 'employeeEmail' | 'status'> & {reason: string; startDate: string; endDate: string }): LeaveRequest => {
  if (typeof window === "undefined") {
     // This case should ideally not happen for user-initiated actions
    console.warn("Saving leave request outside browser context");
    return { ...requestData, id: `lr_no_window_${Date.now()}`, submissionTimestamp: new Date().toISOString(), employeeName: "Unknown", employeeEmail: "unknown", status: "pending" };
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("User must be logged in to submit a leave request.");
  }

  const requests = getLeaveRequestsFromStorage();
  const newRequest: LeaveRequest = {
    ...requestData,
    id: `lr${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    employeeEmail: currentUser.email,
    employeeName: currentUser.name,
    submissionTimestamp: new Date().toISOString(),
    status: "pending",
  };

  const updatedRequests = [newRequest, ...requests];
  localStorage.setItem(LEAVE_REQUESTS_STORAGE_KEY, JSON.stringify(updatedRequests));
  
  window.dispatchEvent(new StorageEvent('storage', {
    key: LEAVE_REQUESTS_STORAGE_KEY,
    newValue: JSON.stringify(updatedRequests),
  }));
  // Also trigger employee activity update for potential wider notifications
  window.dispatchEvent(new StorageEvent('storage', {
    key: EMPLOYEE_ACTIVITIES_STORAGE_KEY, 
  }));


  // Optionally, also save a simplified version to employee activities if needed for a unified log
  // saveEmployeeActivityToStorage({
  //   employeeEmail: newRequest.employeeEmail,
  //   description: `İzin talebi: ${newRequest.reason.substring(0,30)}...`,
  //   eventType: "LEAVE_REQUEST",
  //   status: "pending",
  //   leaveReason: newRequest.reason,
  //   leaveStartDate: newRequest.startDate,
  //   leaveEndDate: newRequest.endDate,
  // });


  return newRequest;
};

// Function to update leave request status (for admin)
export const updateLeaveRequestStatusInStorage = (requestId: string, newStatus: LeaveRequest['status']): LeaveRequest | undefined => {
  if (typeof window === "undefined") return undefined;

  const requests = getLeaveRequestsFromStorage();
  const requestIndex = requests.findIndex(req => req.id === requestId);

  if (requestIndex === -1) {
    console.error(`Leave request with id ${requestId} not found.`);
    return undefined;
  }

  requests[requestIndex].status = newStatus;
  localStorage.setItem(LEAVE_REQUESTS_STORAGE_KEY, JSON.stringify(requests));

  window.dispatchEvent(new StorageEvent('storage', {
    key: LEAVE_REQUESTS_STORAGE_KEY,
    newValue: JSON.stringify(requests),
  }));
   window.dispatchEvent(new StorageEvent('storage', {
    key: EMPLOYEE_ACTIVITIES_STORAGE_KEY,
  }));

  return requests[requestIndex];
}
