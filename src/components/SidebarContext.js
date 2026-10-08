// SidebarContext.js
import { createContext, useContext, useState, useEffect, useCallback  } from "react";
import { useLocation } from 'react-router-dom';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  

  const location = useLocation();

  const initialState = location.state || {};
  const [patientInfo, setPatientInfo] = useState(initialState);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
 
  const [patients, setPatients] = useState([]);
  const [reloadFlag, setReloadFlag] = useState(false);

  const [pendingordersL , setpendingorders] = useState([]);
  const [unpreppPatients , setunprepPatients] = useState([]);

  const reloadPatientData = () => {
    setReloadFlag(prev => !prev);
  };


  // ✅ Function to fetch sidebar data
  const refreshPatients = useCallback(async () => {
    try {
      if (!patientInfo.date) return; 
      
      const queryParams = new URLSearchParams();
      if (patientInfo.date) queryParams.append("date", patientInfo.date);
      queryParams.append("provider", patientInfo.provider || "%%");
      queryParams.append("facility", patientInfo.facility || "%%");

        const visit = `http://172.22.6.98:100/api/Home/daily?${queryParams.toString()}`;

        const pendingorders = `http://172.22.6.98:100/api/Home/pendingordersLH`;

        const unpreppedPatients = `http://172.22.6.98:100/api/Home/preppedByByFacility?date=${patientInfo.date.toString()}`;


      const response = await fetch(visit);
      const pendingresponse = await fetch(pendingorders);
      const unprepPatients = await fetch(unpreppedPatients);


      if(unprepPatients.ok)
      {
        const dataa = await unprepPatients.json();
        const filter= dataa.data.map(dat => ({
          encounterId : dat.encounterID,
          visitDate : dat.visitDate,
          controllNo : dat.ptAccount,
          ptName : dat.ptName
        }));
        
        setunprepPatients(filter);
      }

      if(pendingresponse.ok)
      {
        const dataa = await pendingresponse.json();
        const filtered = dataa.data.map(dat => ({
          encounterId : dat.encounterID,
          pendingOrdersFlag : dat.pendingOrdersFlag,
          controllNo : dat.ptAccount,
          ptName : dat.ptName
        }));
        setpendingorders(filtered); 
      }

      if (response.ok) {
        const data = await response.json();
        const filteredData = data.map(item => ({
          encounterId: item.encounterid,
          Patient: item.patient,
          controllNo: item.controllNo,
          Preppedby: item.preppedby,
          Preppedtime: item.preppedtime,
          visitdate : item.visitdate,
          starttime : item.starttime,
          visittype : item.visittype,
          pendingflag : item.pendingflag
        }));
        setPatients(filteredData);
      }  

    } catch (error) {
      
    }
  }, [patientInfo]);

  // Automatically load sidebar data when patientInfo changes
  useEffect(() => {
    refreshPatients();
  }, [refreshPatients]);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        selectedPatient,
        setSelectedPatient,
        patientInfo,
        setPatientInfo,
        patients,
        setPatients,
        pendingordersL,
        setpendingorders,
        unpreppPatients,
        setunprepPatients,
        refreshPatients ,
        reloadFlag,
        reloadPatientData

      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const usePatient = () => {
  const { patientInfo, setPatientInfo } = useContext(SidebarContext);
  return { patientInfo, setPatientInfo };
};

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
