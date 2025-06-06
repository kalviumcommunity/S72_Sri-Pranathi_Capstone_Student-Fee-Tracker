import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import '../styles/CentralContent.css';

const CentralContent = ({ activeSubTab }) => {
  const [pieData, setPieData] = useState([
    { name: 'Collected Fees', value: 0, color: '#1de9b6' },
    { name: 'Pending Fees', value: 0, color: '#ff5252' },
  ]);
  const [collectedPercentage, setCollectedPercentage] = useState(0);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [femaleData, setFemaleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barData, setBarData] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [waterfallData, setWaterfallData] = useState([]);
  const [fillingData, setFillingData] = useState([]);
  const [previousYearsData, setPreviousYearsData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');

  // Fetch last update time
  useEffect(() => {
    fetch('http://localhost:5000/students/last-updated')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.lastModified) {
          setLastUpdate(data.lastModified);
        } else {
          setLastUpdate(new Date().toLocaleDateString('en-GB'));
        }
      })
      .catch(error => {
        console.error('Error fetching last update time:', error);
        setLastUpdate(new Date().toLocaleDateString('en-GB'));
      });
  }, []);

  // Update pie chart when values change
  useEffect(() => {
    setPieData([
      { name: 'Collected Fees', value: totalCollected, color: '#1de9b6' },
      { name: 'Pending Fees', value: totalPending - totalCollected, color: '#ff5252' },
    ]);
  }, [totalCollected, totalPending]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch fee collection data
        const feeResponse = await fetch('http://localhost:5000/students/sem-fee-paid');
        const feeData = await feeResponse.json();
        const totalFees = feeData.reduce((sum, item) => sum + (item.fees * 350000), 0);
        setTotalCollected(totalFees);

        // Fetch total students
        const studentResponse = await fetch('http://localhost:5000/students/count');
        const studentData = await studentResponse.json();
        setTotalStudents(studentData.count);
        setTotalPending(studentData.count * 350000);

        // Fetch female data
        await fetchFemaleData();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (activeSubTab === 'year2025') {
      fetchData();
    }
  }, [activeSubTab]);

  useEffect(() => {
    const fetchWithdrawalData = async () => {
      try {
        const response = await fetch('http://localhost:5000/students/withdrawals');
        if (!response.ok) throw new Error('Failed to fetch withdrawal data');
        const data = await response.json();
        
        // Transform the data into the waterfall format
        const transformedData = data.map(item => ({
          name: item.college,
          value: -item.count, // Make the value negative for withdrawals
          color: '#f44336' // Red color for withdrawals
        }));
        
        setWaterfallData(transformedData);
      } catch (error) {
        console.error('Error fetching withdrawal data:', error);
      }
    };

    if (activeSubTab === 'year2025') {
      fetchWithdrawalData();
    }
  }, [activeSubTab]);

  useEffect(() => {
    const fetchFillingData = async () => {
      try {
        console.log('Fetching filling status data...');
        const response = await fetch('http://localhost:5000/students/filling-status');
        if (!response.ok) throw new Error('Failed to fetch filling status data');
        const data = await response.json();
        console.log('Received filling status data:', data);
        // Format the data to match what the chart expects
        const formattedData = data.map(item => ({
          type: item.type,
          count: item.count,
          colleges: item.colleges
        }));
        console.log('Formatted filling status data:', formattedData);
        setFillingData(formattedData);
      } catch (error) {
        console.error('Error fetching filling status:', error);
      }
    };

    if (activeSubTab === 'year2025') {
      fetchFillingData();
    }
  }, [activeSubTab]);

  // Add this useEffect for previous years data
  useEffect(() => {
    const fetchPreviousYearsData = async () => {
      try {
        const response = await fetch('http://localhost:5000/students/previous-years');
        if (!response.ok) throw new Error('Failed to fetch previous years data');
        const data = await response.json();
        setPreviousYearsData(data);
      } catch (error) {
        console.error('Error fetching previous years data:', error);
      }
    };

    if (activeSubTab === 'previous') {
      fetchPreviousYearsData();
    }
  }, [activeSubTab]);

  const fetchFemaleData = async () => {
    try {
      const response = await fetch('http://localhost:5000/students/girls');
      if (!response.ok) {
        throw new Error(`Failed to fetch female student data: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      
      // Transform the data into the format expected by the chart
      const formattedData = Object.entries(result).map(([college, count]) => ({
        college,
        count: Number(count) // Ensure count is a number
      }));
      
      setFemaleData(formattedData);
    } catch (err) {
      console.error('Error in fetchFemaleData:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBarClick = (college) => {
    setSelectedCollege(college);
  };

  return (
    <div className="central-content">
      {activeSubTab === 'year2025' && (
        <div className="central-content-container-2">
          {/* First row of charts */}
          <div className="chart-row">
            <div className="chart-section">
              <div className="chart-header">
                <h3 className="chart-title">University Fee Status</h3>
                <p className="chart-subtitle">Last updated: {lastUpdate}</p>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `₹${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="fee-legend">
                  <div className="fee-legend-item">
                    <div className="fee-legend-text">
                      <div className="fee-legend-title">
                        <div className="fee-legend-color-square collected"></div>
                        <p>Collected Fees</p>
                      </div>
                      <div className="fee-legend-value">₹{totalCollected.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="fee-legend-item">
                    <div className="fee-legend-text">
                      <div className="fee-legend-title">
                        <div className="fee-legend-color-square pending"></div>
                        <p>Pending Fees</p>
                      </div>
                      <div className="fee-legend-value">₹{(totalPending - totalCollected).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <h3 className="chart-title">Seats withdrawn</h3>
                <p className="chart-subtitle">Last updated: {lastUpdate}</p>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {waterfallData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Second row of charts */}
          <div className="chart-row">
            <div className="chart-section">
              <div className="chart-header">
                <h3 className="chart-title">Girls Count</h3>
                <p className="chart-subtitle">Last updated: {lastUpdate}</p>
              </div>
              <div className="chart-content">
                {loading ? (
                  <div>Loading...</div>
                ) : error ? (
                  <div>Error: {error}</div>
                ) : !femaleData.length ? (
                  <div>No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart layout="vertical" data={femaleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis 
                        type="number" 
                        domain={[0, 10]} 
                        tickCount={11}
                      />
                      <YAxis type="category" dataKey="college" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8">
                        {femaleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#e3d1f4" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <h3 className="chart-title">Colleges-Fast Filling</h3>
                <p className="chart-subtitle">Last updated: {lastUpdate}</p>
              </div>
              <div className="chart-content">
                <div className="gauge-chart-container">
                  {fillingData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={fillingData}
                          cx="50%"
                          cy="50%"
                          startAngle={180}
                          endAngle={0}
                          outerRadius={140}
                          innerRadius={110}
                          paddingAngle={0}
                          dataKey="count"
                        >
                          {fillingData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.type === "Fast Filling" ? "#4CAF50" : "#FFC107"} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => {
                            const entry = fillingData.find(d => d.count === value);
                            return [`${value} colleges`, entry?.type || ""];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div>No data available</div>
                  )}
                  <div 
                    className="gauge-needle"
                    style={{
                      transform: `translateX(-50%) rotate(${
                        fillingData.length > 0 
                          ? -45 + (225 * (fillingData[0]?.count || 0) / (fillingData[0]?.count + fillingData[1]?.count || 1))
                          : -45
                      }deg)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeSubTab === 'previous' && (
        <div className="previous-years-container">
          <div className="chart-section full-width">
            <div className="chart-header">
              <h3 className="chart-title">Student Enrollment by University</h3>
              <p className="chart-subtitle">Last updated: {lastUpdate}</p>
            </div>
            <div className="previous-years-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={previousYearsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="university" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend 
                    verticalAlign="bottom" 
                    height={60}
                    wrapperStyle={{
                      paddingTop: "20px"
                    }}
                  />
                  <Line type="monotone" dataKey="2023" stroke="#8884d8" name="2023" />
                  <Line type="monotone" dataKey="2024" stroke="#82ca9d" name="2024" />
                  <Line type="monotone" dataKey="2025" stroke="#ffc658" name="2025" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentralContent; 