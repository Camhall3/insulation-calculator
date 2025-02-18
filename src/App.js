import React from 'react';
import InsulationBagLoadingForm from './components/InsulationBagLoadingForm';

function App() {
  // Get job_uuid from URL parameters (when opened from ServiceM8)
  const urlParams = new URLSearchParams(window.location.search);
  const jobUuid = urlParams.get('job_uuid');

  return (
    <div className="App">
      <InsulationBagLoadingForm jobUuid={jobUuid} />
    </div>
  );
}

export default App;
