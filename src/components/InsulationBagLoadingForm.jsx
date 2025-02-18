// InsulationBagLoadingForm.jsx

import React, { useState, useEffect } from 'react';

// ServiceM8 API utilities
const SM8_API_BASE = 'https://api.servicem8.com/api_1.0';
const APP_ID = '246773';
const APP_SECRET = 'b80286af212e4c4ca9b6226d56b9fe7b';

// ... (keep all the existing code up until the render return)

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Insulation Bag Loading Form</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Total Job Area (m²):</label>
        <input
          type="number"
          value={totalArea}
          onChange={(e) => setTotalArea(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <button 
        onClick={addRow} 
        disabled={rows.length >= maxRows}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        + Add Stock
      </button>

      {rows.map((row, index) => (
        <div key={row.id} className="mb-4 p-4 border rounded">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="number"
              placeholder="m²"
              value={row.area}
              onChange={(e) => updateRow(index, "area", e.target.value)}
              className="p-2 border rounded"
            />

            <select
              value={row.rValue}
              onChange={(e) => updateRow(index, "rValue", e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Select R-Value</option>
              {Object.keys(insulationData).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              value={row.width}
              onChange={(e) => updateRow(index, "width", e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Select Width</option>
              <option value="430mm">430mm</option>
              <option value="580mm">580mm</option>
            </select>

            <div className="flex gap-2">
              <select
                value={row.spareBags}
                onChange={(e) => updateRow(index, "spareBags", e.target.value)}
                className="p-2 border rounded"
              >
                {[...Array(11)].map((_, i) => (
                  <option key={i} value={i}>{i} spare</option>
                ))}
              </select>
              <button
                onClick={() => loadRow(index)}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Load
              </button>
            </div>
          </div>
        </div>
      ))}

      {recordedRows.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Load Summary</h2>
          {recordedRows.map((row, index) => (
            <LoadSummary 
              key={index} 
              row={row} 
              onDelete={() => deleteRecordedRow(index)}
            />
          ))}
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Submit
        </button>
        
        <button
          onClick={handleStartAgain}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded"
        >
          Start Again
        </button>
      </div>
    </div>
  );
};

export default InsulationBagLoadingForm;
