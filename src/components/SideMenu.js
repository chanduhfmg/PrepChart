import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import '../SideMenu.css';
import { useRef , useEffect } from "react";
import { useSidebar, usePatient } from './SidebarContext';
import { useNavigate } from 'react-router-dom';
import dayjs from "dayjs";  

export default function SideMenu() {
  //console.log("Second");
  const containerRef = useRef(null);
  const { isOpen, setIsOpen, setSelectedPatient, selectedPatient,  patients ,pendingordersL,unpreppPatients ,reloadPatientData } = useSidebar();
  const { patientInfo , setPatientInfo } = usePatient();
  const navigate = useNavigate(); 
  const { refreshPatients } = useSidebar();
  const prepped = selectedPatient?.Preppedby && Object.keys(selectedPatient.Preppedby).length > 0;

  const storedUser = localStorage.getItem("user");
  const goHome = () => navigate("/home");
 // console.log("",selectedPatient);
  
  async function completed(id, username, prepped) {
    try {
      let url = "";
      if (Object.keys(prepped).length < 1) {
          url = `http://172.22.6.98:100/api/Home/markPrepped?encounterid=${id}&username=${username}`;
      } else {
          url = `http://172.22.6.98:100/api/Home/markNotPrepped?encounterid=${id}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Request failed");


      // 🔁 Refresh sidebar contents
      await refreshPatients();
      
      setSelectedPatient(prev => ({
        ...prev,
        Preppedby: Object.keys(prepped).length < 1 ? { marked: true } : {}
      }));

    } catch (error) {
      console.error("Error:", error);
    }
  }
  const isPending = selectedPatient?.pendingflag === 1;

  async function Pending(id,storedUser, pending) {
    
    const newPending = pending === 1 ? 0 : 1;
    let url = "";
      url = `http://172.22.6.98:100/api/Home/markPendingOrNot?encounterid=${id}&pending=${newPending}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Request failed");


      // 🔁 Refresh sidebar contents
      await refreshPatients();
      
      setSelectedPatient(prev => ({
        ...prev,
        pendingflag: newPending
      }));
  }
  const handlePreviousDate = () => {
    if (!patientInfo.date) return;
    setIsOpen(true);
    const newDate = dayjs(patientInfo.date).subtract(1, "day").format("YYYY-MM-DD");
    setPatientInfo(prev => ({ ...prev, date: newDate }));
  };

  // Handle next date
  const handleNextDate = () => {
    if (!patientInfo.date) return;
    setIsOpen(true);
    const newDate = dayjs(patientInfo.date).add(1, "day").format("YYYY-MM-DD");
    setPatientInfo(prev => ({ ...prev, date: newDate }));
  };


 // console.log("patientInfo ",selectedPatient);
  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  const handlePatientClick = async (patient) => {
    setSelectedPatient(patient);
    await refreshPatients();   
    setIsOpen(false);
  };


  const currentIndex = selectedPatient
  ? patients.findIndex((p) => p.controllNo === selectedPatient.controllNo)
  : -1;
  const backPatient = async () => {
    if (currentIndex > 0) {
      setSelectedPatient(patients[currentIndex - 1]);
      await refreshPatients();
    }
    else{
      alert("Select Patient");
    }
  };
  
  const nextPatient = async () => {
    if (currentIndex < patients.length - 1) {
      setSelectedPatient(patients[currentIndex + 1]);
      await refreshPatients();
    }
    else{
      alert("Last Patinet of the List ");
    }

    
  };
  useEffect(() => {
    setIsOpen(true);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <div className="d-flex flex-column position-relative border 1px solid" style={{ height: "100vh" }}>
      <div ref={containerRef}>
      <button
        className="btn btn-primary position-fixed top-0 start-0 m-3 mt-2"
        onClick={() => setIsOpen(!isOpen)}
        style={{ zIndex: 1050 }}>
        ☰
      </button>

    <div>
      <div className='d-flex mt-1'>
          <button onClick={backPatient} className='btn btn-info px-3 position-fixed top-10 start-0 m-3 mt-5'>Back</button>
          <button onClick={nextPatient} className='btn btn-info px-3 position-fixed top-10 end-0 m-3 mt-5'>Next</button>
      </div>
        
    </div>
     

      <div
        className={`side-menu bg-white text-white pt-4 ${isOpen ? "show" : "hide"}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          color: 'black',
          width: "350px",
          zIndex: 1040,
          transition: "transform 0.3s ease",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className='text-primary mt-5 p-0'>
          <p className='m-0 p-0 fs-3'>
            {patientInfo?.date}  {patientInfo?.provider}  {patientInfo?.facility}
          </p>
        </div>

        <ul className="list-unstyled" style={{ margin: 0, padding: 0 }}>
          {patients.length > 0 ? (
            patients.map((patient, idx) => (
              <li
                key={idx}
                onClick={() => handlePatientClick(patient)}
                className={`list-item px-1 p-1 ${selectedPatient?.controllNo === patient.controllNo ? "active-patient" : ""}`}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "400",fontSize: "15px" }}>
                    {patient.Patient} {patient.controllNo}
                  </span>
                </div>

                {patient.Preppedby && Object.keys(patient.Preppedby).length > 0 && (
                  <span style={{ color: "green", fontSize: "15px" }}>✅</span>
                )}
                {patient.pendingflag > 0 && (
                  <span style={{ color: "red", fontSize: "15px" }}>*</span>
                )}
              </li>
            ))
          ) : (
            <li>No patients</li>
          )}
        </ul>
      </div>
    </div>
    <div className="position-fixed bottom-0 start-0 end-0 bg-white border-top p-2" style={{ zIndex: 1000 , fontSize: "8px" }}>
      <div className='d-flex gap-3 justify-content-between'>
        <div>
          <button className='btn btn-secondary px-3' onClick={goHome}>  Home</button>
        </div>
        <div>
          <button  className={`btn btn-secondary px-3  ${
              isPending  ? "bg-danger text-white" : ""
            }`}
          onClick={() =>
              Pending(selectedPatient.encounterId, storedUser, selectedPatient.pendingflag)
            }>
            pending </button>
        </div>
        <div>
          <button
            className={`btn btn-secondary px-3  ${
              prepped ? "bg-success text-white" : ""
            }`}
            onClick={() =>
              completed(selectedPatient.encounterId, storedUser, selectedPatient.Preppedby)
            }
          >
             Complete
          </button>
        </div>
        <div className='d-flex gap-4 '>
          <button className='btn btn-secondary px-3' onClick={handlePreviousDate}> Previous Date </button>
          <button className='btn'> {patientInfo?.date} </button>
          <button className='btn btn-secondary' onClick={handleNextDate}> Next Date </button>
        </div>
        <div className='dropup '>
        <div className="btn-group">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{
                backgroundColor: pendingordersL.length > 0 ? "#d9534f" : "initial"
              }}
            >
              Pending Orders ({pendingordersL.length})
            </button>

            <ul className="dropdown-menu">
              {pendingordersL.length > 0 ? (
                pendingordersL.map((item, index) => (
                  <li key={index}>
                     <a className={`dropdown-item ${selectedPatient?.controllNo === item.controllNo ? "active-patient" : ""}`}
                     href="#"  onClick={() => handlePatientClick(item)}>
                      {item.ptName}
                    </a>
                  </li>
                ))
              ) : (
                <li>
                  <span className="dropdown-item-text text-muted">No pending orders</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className='dropup'>
        <div className="btn-group">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{
                backgroundColor: unpreppPatients.length > 0 ? "#d9534f" : "initial"
              }}
            >
              Unprepped Same-Day Patients ({unpreppPatients.length})
            </button>

            <ul className="dropdown-menu scrollable-dropdown">
              {unpreppPatients.length > 0 ? (
                unpreppPatients.map((item, index) => (
                  <li key={index}>
                    <a className={`dropdown-item ${selectedPatient?.controllNo === item.controllNo ? "active-patient" : ""}`}
                     href="#"  onClick={() => handlePatientClick(item)}>
                      {item.ptName} {item.controllNo}
                    </a>
                  </li>
                ))
              ) : (
                <li>
                  <span className="dropdown-item-text text-muted">No pending orders</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div>
        <button className='btn ' onClick={reloadPatientData}>Refresh</button>
        </div>

      </div>
      
    </div>
    </div>
    
  );
}
