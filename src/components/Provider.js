import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebar, usePatient } from './SidebarContext';
import { useUser } from "../components/UserContext";

const Provider = () => {
  //console.log("Third");
  const location = useLocation();
  //const { user } = useUser();
  const { date, provider, facility } = location.state || {};
  
  //const { setPatientInfo } = usePatient();
  
  const { selectedPatient, reloadFlag } = useSidebar();
  
  
  const [Providers, setProviders] = useState([]);
  const [CircleofCare, setCare] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [CloseOrders, setClosedOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  
  const prepped = selectedPatient?.Preppedby || {};
  

  // useEffect(() => {
  //   //console.log("provoder : ", date, provider, facility)
  //   setPatientInfo({ date, provider, facility });
  // }, [date, provider, facility]);
  
  function renderSafe(value) {
    if (value == null) return '-';                     // null or undefined
    if (typeof value === 'object') {
      if (Object.keys(value).length === 0) return '-'; // empty object
      return JSON.stringify(value);                    // non-empty object
    }
    return String(value);                              // string or number
  }
  function renderSafeDate(value) { 
    if (!value) return '-'; // null or undefined
    if (typeof value === 'object') {
      if (Object.keys(value).length === 0) return '-'; 
      value = value.date ?? Object.values(value)[0]; 
    }
    const d = new Date(value);
    if (isNaN(d)) return '-'; 
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');  
    const day = String(d.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }

  const storedUser = localStorage.getItem("user");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchAllData = async () => {
      //console.log(selectedPatient);
      setLoading(true); 
      try {
        const { controllNo: pcontrolno } = selectedPatient;
          const base = "http://172.22.6.98:100/api/Chart";
  
        const [Pro, CircleCare , docsRes, referralsRes , popenorders , closedorder] = await Promise.all([
          fetch(`${base}/Providers?controlNo=${pcontrolno}`),
          fetch(`${base}/CircleofCare?controlNo=${pcontrolno}`),
          fetch(`${base}/Documents?pcontrolno=${pcontrolno}`),
          fetch(`${base}/Referrals?pcontrolno=${pcontrolno}`),
          fetch(`${base}/OpenOrders?controlNo=${pcontrolno}`),
          fetch(`${base}/ClosedOrders?pcontrolno=${pcontrolno}`)
        ]);
  
        if (Pro.ok) setProviders(await Pro.json());
        
  
        if (CircleCare.ok) setCare(await CircleCare.json());
        
  
        if (docsRes.ok) setDocuments(await docsRes.json());
        
  
        if (referralsRes.ok) setReferrals(await referralsRes.json());
        

        
         // read JSON once here
         const popenJson = await popenorders.json();
         const closedJson = await closedorder.json();
         
         const openData = popenJson.map(o => ({
          code: o.cvx ? String(o.cvx) : '-',     
          resultDate:
          typeof o.givenDateTime === 'object'
            ? o.givenDateTime.date ?? null
            : o.givenDateTime ?? null,
          age: null,
          name: o.vaccineName ?? '-',
          status: o.immstatus ?? '-',
          orderType: o.givenBy ?? '-'
        }));

        const closedData = closedJson
        .filter(o => o.Order_Status === 'Recieved')
        .map(o => ({
          code: o.Loinc ?? '-',                  
          resultDate:
          typeof o.resultdate === 'object'
          ? o.resultdate.date ?? null
          : o.resultdate ?? null,
          age: o.ageOfResultDate ?? '-',
          name: o.Test_Name ?? '-',
          status: o.Order_Status ?? '-',
          orderType: o.Order_Type ?? '-'
        }));
         
         // combined array
         setAllOrders([...openData, ...closedData]);
         setClosedOrders(closedJson);

        // console.log("done");

      } catch (err) {
        console.error("❗ Error fetching data:", err);
      }finally {
        await new Promise(resolve => setTimeout(resolve, 500));
          setLoading(false);
      }
    };
    
    if(selectedPatient)
    {
      fetchAllData(); 
    }
  },[selectedPatient ,reloadFlag]);
  

  const TableSkeleton = ({ columns, rows = 5 }) => {
    return (
      <tbody>
        {[...Array(rows)].map((_, idx) => (
          <tr key={idx}>
            {columns.map((_, colIdx) => (
              <td key={colIdx}>
                <div className="skeleton-cell"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };


  return (

      <div className='d-flex  justify-content-center text-center mb-4'>
                  {loading ? (
      <div className="container-fluid p-3">
        <div className="row g-4">
          {/* Skeleton for Past Provider Visits */}
          <div className="col-lg-4 col-md-6">
            <h5>Past Provider Visits</h5>
            <div className="scroll-table">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Provider</th>
                    <th>Specialty</th>
                    <th>Visit Type</th>
                  </tr>
                </thead>
                <TableSkeleton columns={[0,1,2,3]} rows={5} />
              </table>
            </div>
          </div>

          {/* Skeleton for Circle of Care */}
          <div className="col-lg-4 col-md-6">
            <h5>Circle of Care</h5>
            <div className="scroll-table">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Circle Name</th>
                    <th>Provider</th>
                    <th>Specialty</th>
                  </tr>
                </thead>
                <TableSkeleton columns={[0,1,2]} rows={5} />
              </table>
            </div>
          </div>

          {/* Skeleton for Future Provider Visits */}
          <div className="col-lg-4 col-md-6">
            <h5>Future Provider Visits</h5>
            <div className="scroll-table">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Provider</th>
                    <th>Specialty</th>
                    <th>Visit Type</th>
                  </tr>
                </thead>
                <TableSkeleton columns={[0,1,2,3]} rows={5} />
              </table>
            </div>
          </div>

          {/* Skeleton for Documents */}
          <div className="col-lg-6 col-md-12">
            <h5>Documents</h5>
            <div className="scroll-table">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Scan Date</th>
                    <th>Document Name</th>
                    <th>Folder</th>
                  </tr>
                </thead>
                <TableSkeleton columns={[0,1,2]} rows={5} />
              </table>
            </div>
          </div>

          {/* Skeleton for Referrals */}
          <div className="col-lg-6 col-md-12">
            <h5>Referrals</h5>
            <div className="scroll-table">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Specialty</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Appointment Date</th>
                  </tr>
                </thead>
                <TableSkeleton columns={[0,1,2,3,4,5,6]} rows={5} />
              </table>
            </div>
          </div>

          {/* Skeleton for Open Orders */}
          <div className="col-lg-6 col-md-12">
            <h5>Open Orders</h5>
            <div className="scroll-table">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Loinc</th>
                    <th>Order Date</th>
                    <th>Ordering Provider</th>
                    <th>Test Name</th>
                    <th>Order Status</th>
                    <th>Order Type</th>
                  </tr>
                </thead>
                <TableSkeleton columns={[0,1,2,3,4,5]} rows={5} />
              </table>
            </div>
          </div>

          {/* Skeleton for Closed Orders & Immunizations */}
          <div className="col-lg-6 col-md-12">
            <h5>Closed Orders & Immunizations</h5>
            <div className="scroll-table">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Loinc/CVX</th>
                    <th>Result Date</th>
                    <th>Age</th>
                    <th>Test/Vaccine Name</th>
                    <th>Status</th>
                    <th>Order Type</th>
                  </tr>
                </thead>
                <TableSkeleton columns={[0,1,2,3,4,5]} rows={5} />
              </table>
            </div>
          </div>

        </div>
      </div>
    ) :(  
         <div style={{ fontWeight: "500",fontSize: "14px" }}>
         <div className='d-flex justify-content-between px-3 pt-3 container'>
          <p>
            {/* Visit Date & Time */}
            {selectedPatient?.visitdate
              ? new Date(selectedPatient.visitdate).toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
              : '-'}
            {' - '}
            {selectedPatient?.starttime  ||  '-'}
            {' - '}
            {selectedPatient?.visittype || '-'}
          </p>

          <p className='text-center'>
            {selectedPatient?.controllNo || '-'} - {selectedPatient?.Patient || '-'}{' '}
            Last Prepped -{' '}
            {selectedPatient?.Preppedtime
              ? new Date(selectedPatient.Preppedtime).toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
              : '-'}
          </p>

          <p>
            {provider || '-'} {facility || '-'}
          </p>
        </div>

        
          
          <div className="container-fluid p-3">
          <div className="row g-4">
        {/* Past Provider Visits */}
        <div className="col-lg-4 col-md-6">
          <h5>Past Provider Visits</h5>
          <div className="scroll-table">
            <table className="table table-bordered table-sm">
              <thead className="table-light" >
                <tr>
                  <th>Date</th>
                  <th>Provider</th>
                  <th>Specialty</th>
                  <th>Visit Type</th>
                </tr>
              </thead>
              <tbody>
              {Providers.length > 0 ? (
                    [...Providers]
                    .filter(a => a.future === 0)
                      .sort((a, b) => new Date(b.date) - new Date(a.date)) 
                      .map((visit, idx) => (
                        <tr className='gray-row' key={idx} >
                        <td>{renderSafeDate(visit.DOS)}</td>
                          <td>{visit.printname}</td>
                          <td>{visit.Specialty}</td>
                          <td>{visit.visittype}</td>
                        </tr>
                      ))
                  ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No past visits found
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Circle of Care */}
        <div className="col-lg-4 col-md-6">
          <h5>Circle of Care</h5>
          <div className="scroll-table">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Circle Name</th>
                  <th>Provider</th>
                  <th>Specialty</th>
                </tr>
              </thead>
              <tbody>
              {CircleofCare.length > 0 ? (
                    [...CircleofCare]
                      .map((Circle, idx) => (
                        <tr key={idx}>
                          <td>{renderSafe(Circle.cocName)}</td>
                          <td>{renderSafe(Circle.fullName)}</td>
                          <td>{renderSafe(Circle.speciality)}</td>
                        </tr>
                      ))
                  ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No Circle of Care found
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Future Provider Visits */}
        <div className="col-lg-4 col-md-6">
          <h5>Future Provider Visits</h5>
          <div className="scroll-table">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Provider</th>
                  <th>Specialty</th>
                  <th>Visit Type</th>
                </tr>
              </thead>
              <tbody>
              {Providers.length > 0 ? (
                    [...Providers]
                    .filter(a => a.future === 1)
                      .sort((a, b) => new Date(b.date) - new Date(a.date)) 
                      .map((visit, idx) =>{
                        try {
                          return (
                        <tr key={idx}>
                          <td>{renderSafeDate(visit.DOS)}</td>
                          <td>{visit.printname}</td>
                          <td>{visit.Specialty}</td>
                          <td>{visit.visittype}</td>
                        </tr>
                    );
                    } catch (err) {
                      console.log('❌ Error at Providers row:', idx, visit);
                      throw err;
                    }
                  })
                    ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No future visits found
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documents */}
        <div className="col-lg-6 col-md-12">
          <h5>Documents</h5>
          <div className="scroll-table">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Scan Date</th>
                  <th>Document Name</th>
                  <th>Folder</th>
                </tr>
              </thead>
              <tbody>
              {documents.length > 0 ? (
                documents.map((doc, idx) =>{
                  try {
                    return (
                  <tr key={idx}>
                    <td>{renderSafeDate(doc.scanDate)}</td>
                    <td>{doc.docname}</td>
                    <td>{doc.folder}</td>
                  </tr>
              );
              } catch (err) {
                console.log('❌ Error at documents row:', idx, doc);
                throw err;
              }
            })
              )  : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No Documents  found
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referrals */}
        <div className="col-lg-6 col-md-12">
          <h5>Referrals</h5>
          <div className="scroll-table">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Speciality</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Appt Date</th>
                </tr>
              </thead>
              <tbody>
              {referrals.length > 0 ? (
                
                referrals.map((ref, idx) =>{
                  try {
                    return (
                      <tr key={`${ref.ControlNo}-${idx}`}>
                      <td>{renderSafeDate (ref.date)} </td>
                      <td>{renderSafe(ref.From)}</td>
                      <td>{renderSafe(ref.To)}</td>
                      <td>{renderSafe(ref.Speciality)}</td>
                      <td>{renderSafe(ref.reason)}</td>
                      <td>{renderSafe(ref.status)}</td>
                      <td>{renderSafe(ref.AppointmentDate)}</td>
                    </tr>
                );
              } catch (err) {
                console.log('❌ Error at referrals row:', idx, ref);
                throw err;
              }
            })
              )  : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No Documents  found
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Open Orders */}
        <div className="col-lg-6 col-md-12">
          <h5>Open Orders</h5>
          <div className="scroll-table">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Loinc</th>
                  <th>Order Date</th>
                  <th>Ordering Provider</th>
                  <th>Test Name</th>
                  <th>Order Status</th>
                  <th>Order Type</th>
                </tr>
              </thead>
              <tbody>
              
              {CloseOrders.length > 0 ? (
                    CloseOrders
                      .filter(a => a.Order_Status === "Not Received")
                      .map((ref, idx) => {
                        try {
                          return (
                        <tr key={idx}>
                          <td></td>
                          <td>
                          {renderSafeDate (ref.orderdate)}
                                
                          </td>
                          <td>{renderSafe(ref.Ordering_Provider)}</td> 
                          <td>{renderSafe(ref.Test_Name)}</td>
                          <td>{renderSafe(ref.Order_Status)}</td>
                          <td>{renderSafe(ref.Order_Type)}</td>
                        </tr>
                      );
                  } catch (err) {
                    console.log('❌ Error at CloseOrders row:', idx, ref);
                    throw err;
                  }
                })
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No Open Orders
                      </td>
                    </tr>
                  )}

              </tbody>
            </table>
          </div>
        </div>

        {/* Closed Orders & Immunizations */}
        <div className="col-lg-6 col-md-12">
          <h5>Closed Orders & Immunizations</h5>
          <div className="scroll-table">
            <table className="table table-bordered scroll-table table-sm">
              <thead className="table-light">
                <tr>
                  <th>Loinc/CVX</th>
                  <th>Result Date</th>
                  <th>Age</th>
                  <th>Test/Vaccine Name</th>
                  <th>Status</th>
                  <th>Order Type</th>
                </tr>
              </thead>
              <tbody>
              {allOrders.length > 0 ? (
                allOrders.map((c, idx) => {
                  try {
                    return (
                      <tr key={idx}  >
                        <td>{renderSafe(c.code)}</td>
                        <td>{renderSafeDate(c.resultDate)}</td>
                        <td>{renderSafe(c.age)}</td>
                        <td>{renderSafe(c.name)}</td>
                        <td>{renderSafe(c.status)}</td>
                        <td>{renderSafe(c.orderType)}</td>
                      </tr>
                    );
                  } catch (err) {
                    console.log('❌ Error at allOrders row:', idx, c);
                    throw err;
                  }
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No Close Orders
                  </td>
                </tr>
              )}

              </tbody>
            </table>
          </div>
        </div>
      </div>


    </div>

        </div>)}
      </div>
  ); 
};

export default Provider;