import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    joiningDate: '',
    salary: '',
    location: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/pdf/generate',
        formData,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'OfferLetter.pdf';
      link.click();
    } catch (error) {
      console.error('PDF generation failed', error);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>Offer Letter Generator</h2>
      <form onSubmit={handleSubmit}>
        {['name', 'role', 'company', 'joiningDate', 'salary', 'location'].map(field => (
          <div key={field}>
            <label>{field}</label><br/>
            <input type="text" name={field} onChange={handleChange} required /><br/><br/>
          </div>
        ))}
        <button type="submit">Generate Offer Letter</button>
      </form>
    </div>
  );
}

export default App;




