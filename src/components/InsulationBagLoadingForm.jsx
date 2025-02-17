import React, { useState, useEffect } from 'react';

// ServiceM8 API utilities
const SM8_API_BASE = 'https://api.servicem8.com/api_1.0';
const APP_ID = '246773';
const APP_SECRET = 'b80286af212e4c4ca9b6226d56b9';

const serviceM8Api = {
  headers: {
    'Authorization': `Basic ${btoa(`${APP_ID}:${APP_SECRET}`)}`,
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://api.servicem8.com',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  },

  async getJobData(uuid) {
    const response = await fetch(`${SM8_API_BASE}/job/${uuid}`, {
      headers: this.headers
    });
    return response.json();
  },

  async getChecklists(jobUuid) {
    const response = await fetch(`${SM8_API_BASE}/checklist?job_uuid=${jobUuid}`, {
      headers: this.headers
    });
    return response.json();
  },

  async createChecklist(jobUuid, description) {
    const response = await fetch(`${SM8_API_BASE}/checklist`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        job_uuid: jobUuid,
        description: description,
        active: '1'
      })
    });
    return response.json();
  },

  async createJobNote(jobUuid, note) {
    const response = await fetch(`${SM8_API_BASE}/jobnote`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        job_uuid: jobUuid,
        note: note
      })
    });
    return response.json();
  },

  async deleteChecklist(uuid) {
    await fetch(`${SM8_API_BASE}/checklist/${uuid}`, {
      method: 'DELETE',
      headers: this.headers
    });
  }
};

const insulationData = {
  "R2.5": { "430mm": { m2PerBag: 7, bagsPerBale: 5 }, "580mm": { m2PerBag: 9.4, bagsPerBale: 5 } },
  "R2.7": { "430mm": { m2PerBag: 5, bagsPerBale: 5 }, "580mm": { m2PerBag: 6.7, bagsPerBale: 5 } },
  "R4.0": { "430mm": { m2PerBag: 7.4, bagsPerBale: 6 }, "580mm": { m2PerBag: 9.4, bagsPerBale: 4 } },
  "R4.1": { "430mm": { m2PerBag: 8.5, bagsPerBale: 5 }, "580mm": { m2PerBag: 11.4, bagsPerBale: 5 } },
  "R5.0": { "430mm": { m2PerBag: 5.5, bagsPerBale: 5 }, "580mm": { m2PerBag: 7.4, bagsPerBale: 5 } },
  "R6.0": { "430mm": { m2PerBag: 5.5, bagsPerBale: 5 }, "580mm": { m2PerBag: 7.4, bagsPerBale: 5 } },
  "R1.7 Hardie Fire": { "430mm": { m2PerBag: 3.8, bagsPerBale: 1 }, "580mm": { m2PerBag: 5, bagsPerBale: 1 } }
};

const LoadSummary = ({ row, onDelete }) => (
  <div className="mb-4 p-4 border rounded relative bg-white">
    <button
      onClick={onDelete}
      className="absolute top-2 right-2 text-red-500"
    >
      ×
    </button>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h3 className="font-bold">Specifications:</h3>
        <p>Area: {row.area} m²</p>
        <p>Type: {row.rValue} : {row.width}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold">Calculations:</h3>
        <p>Required Bags: {row.requiredBags}</p>
        <p>Spare Bags: {row.spareBags}</p>
        <p>Total Bags Needed: {row.totalBags}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold">Breakdown:</h3>
        <p>Complete Bales: {row.wholeBales} ({row.wholeBales * row.bagsPerBale} bags)</p>
        <p>Loose Bags: {row.extraBags}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-green-600">Loading Instructions:</h3>
        <p>Load {row.wholeBales} full bale{row.wholeBales !== 1 ? 's' : ''}</p>
        {row.extraBags > 0 && (
          <p>Plus {row.extraBags} individual bag{row.extraBags !== 1 ? 's' : ''}</p>
        )}
        <p className="text-sm text-gray-600">
          (Total: {row.totalBags} bags of which {row.spareBags} spare)
        </p>
      </div>
    </div>
  </div>
);

const InsulationBagLoadingForm = () => {
  const [jobUuid, setJobUuid] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalArea, setTotalArea] = useState("");
  const [rows, setRows] = useState([]);
  const [recordedRows, setRecordedRows] = useState([]);
  const maxRows = 5;

  useEffect(() => {
    const currentJobUuid = new URLSearchParams(window.location.search).get('job_uuid');
    if (currentJobUuid) {
      setJobUuid(currentJobUuid);
      loadJobData(currentJobUuid);
    }
  }, []);

  const loadJobData = async (uuid) => {
    try {
      setLoading(true);
      const data = await serviceM8Api.getJobData(uuid);
      setJobData(data);
    } catch (err) {
      setError('Failed to load job data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateBagsAndBales = (area, rValue, width, spareBags) => {
    const insulation = insulationData[rValue]?.[width];
    if (!insulation) return { 
      wholeBales: 0, 
      extraBags: 0, 
      totalBags: 0,
      requiredBags: 0,
      spareBags: 0,
      bagsPerBale: 0
    };

    const bagsRequired = Math.ceil(parseFloat(area) / insulation.m2PerBag);
    const spareBagsCount = parseInt(spareBags || 0);
    const totalBags = bagsRequired + spareBagsCount;
    const wholeBales = Math.floor(totalBags / insulation.bagsPerBale);
    const extraBags = totalBags - (wholeBales * insulation.bagsPerBale);

    return { 
      wholeBales, 
      extraBags, 
      totalBags,
      requiredBags: bagsRequired,
      spareBags: spareBagsCount,
      bagsPerBale: insulation.bagsPerBale
    };
  };

  const addRow = () => {
    if (rows.length < maxRows) {
      setRows([...rows, { id: rows.length, area: "", rValue: "", width: "", spareBags: "0" }]);
    }
  };

  const updateRow = (index, field, value) => {
    setRows(rows.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    ));
  };

  const loadRow = (index) => {
    const rowToLoad = rows[index];
    if (!rowToLoad.area || !rowToLoad.rValue || !rowToLoad.width) {
      alert("Please complete all fields before loading.");
      return;
    }

    const calculations = calculateBagsAndBales(
      rowToLoad.area,
      rowToLoad.rValue,
      rowToLoad.width,
      rowToLoad.spareBags
    );

    setRecordedRows([...recordedRows, { 
      ...rowToLoad,
      ...calculations
    }]);
    setRows(rows.filter((_, i) => i !== index));
  };

  const deleteRecordedRow = (index) => {
    setRecordedRows(recordedRows.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (recordedRows.length === 0) {
      alert("Please load at least one entry before submitting.");
      return;
    }

    try {
      setLoading(true);
      
      // Create checklists for each loaded item
      for (const row of recordedRows) {
        const checklistDescription = `${row.rValue} ${row.width}: Load ${row.wholeBales} bales${
          row.extraBags > 0 ? ` plus ${row.extraBags} loose bags` : ''
        } (Total: ${row.totalBags} bags including ${row.spareBags} spare)`;
        
        await serviceM8Api.createChecklist(jobUuid, checklistDescription);
      }

      // Create a summary job note
      const summaryNote = `Insulation Loading Summary:\n${
        recordedRows.map(row => 
          `- ${row.rValue} ${row.width}: ${row.totalBags} bags (${row.wholeBales} bales + ${row.extraBags} loose)`
        ).join('\n')
      }`;
      
      await serviceM8Api.createJobNote(jobUuid, summaryNote);

      alert('Successfully submitted loading instructions!');
    } catch (err) {
      setError('Failed to submit data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAgain = async () => {
    try {
      setLoading(true);
      
      // Delete all checklists for this job
      const checklists = await serviceM8Api.getChecklists(jobUuid);
      for (const checklist of checklists) {
        await serviceM8Api.deleteChecklist(checklist.uuid);
      }

      // Clear form state
      setRows([]);
      setRecordedRows([]);
      setTotalArea("");

      alert('Form cleared and checklists deleted. You can start again.');
    } catch (err) {
      setError('Failed to clear data');
      console.error(err);
    } finally {
      setLoading(false);
    }
