import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from 'react-select';

const Home = () => {
  const [date, setDate] = useState("");
  const [provider, setProvider] = useState("");
  const [facility, setFacility] = useState("");

  const [providersList, setProvidersList] = useState([]);

  const [VisitList, setVisitList] = useState([]);
  const navigate = useNavigate();




  const providerOptions =  providersList.map(pro => ({ value: pro, label: pro }));

  const uniqueFacilities =  VisitList.map(fac => ({ value: fac, label: fac }));

  //useEffect(() => {
  //  const fetchData = async () => {
  //    try {
  //      const queryParams = new URLSearchParams();
  //      if (date) queryParams.append("date", date );
  //       queryParams.append("provider", provider || "%%");
  //       queryParams.append("facility", facility || "%%");

  //      const visit = `http://172.22.6.98:100/api/Home/daily?${queryParams.toString()}`;

  //      const vistdaily = await fetch(visit);
  //      const dailyData = await vistdaily.json();

  //      // Get unique facilities
  //      const uniqueFacilities = [...new Set(dailyData.map(item => item.facility))];


  //      // Get unique providers
  //      const providerData = [...new Set(dailyData.map(item => item.provider))];


  //      setVisitList(uniqueFacilities);
  //      setProvidersList(providerData);

  //    } catch (error) {
  //      console.error("❌ Fetch error:", error);
  //    }
  //  };

  //  if (date) {
  //    fetchData();
  //  }
    //}, [date, provider, facility]);


    useEffect(() => {
        if (!date) return;

        const fetchProviders = async () => {
            try {
                const params = new URLSearchParams({ date, facility: facility || "" });
                const res = await fetch(`http://172.22.6.98:100/api/Home/providersForDate?${params}`);
                const data = await res.json();
                setProvidersList(data);
            } catch (err) {
                console.error("Provider fetch failed", err);
            }
        };

        const fetchFacilities = async () => {
            try {
                const params = new URLSearchParams({ date, provider: provider || "" });
                const res = await fetch(`http://172.22.6.98:100/api/Home/facilitiesForDate?${params}`);
                const data = await res.json();
                setVisitList(data);
            } catch (err) {
                console.error("Facility fetch failed", err);
            }
        };

        fetchProviders();
        fetchFacilities();
    }, [date, provider, facility]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (date || provider || facility) {
      navigate("/provider", {
        state: { date, provider, facility }
      });
    }
  };

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center ">
      <div className="card shadow p-5 w-100" style={{ maxWidth: "900px" }}>
        <h3 className="text-center text-primary mb-3">
          Horizon Chart Prep Software
        </h3>
        <p className="text-center text-muted mb-4">
          Select a date of service, provider, and facility to begin chart prepping.
        </p>

        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <label className="form-label">Date of Service</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Provider</label>
            <Select
              options={providerOptions}
              value={providerOptions.find(opt => opt.value === provider) || null}
              onChange={(selectedOption) =>
                setProvider(selectedOption ? selectedOption.value : "")
              }
              placeholder="Select Provider"
              isSearchable
              isClearable
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Facility</label>
            <Select
              options={uniqueFacilities}
              value={uniqueFacilities.find(opt => opt.value === facility) || null}
              onChange={(selectedOption) =>
                setFacility(selectedOption ? selectedOption.value : "")
              }
              placeholder="Select Facility"
              isSearchable
              isClearable
            />
          </div>
        </div>

        <div className="d-grid">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Load Visits
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;