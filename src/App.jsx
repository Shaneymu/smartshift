import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, Calendar, Users, FileText, Settings, LogOut, Bell, Search, Menu,
  User, Mail, Smartphone, CheckCircle, AlertTriangle, Zap, X, Eye, EyeOff, Clock, Briefcase,
  Edit2, Trash2, Plus, Printer, FileSpreadsheet, Save, BarChart2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

// --- CONSTANTS ---
const SHIFT_TYPES = { DAY: 'Day', NIGHT: 'Night', WEEKEND: 'Weekend', SURGERY: 'Surgery', SUPPORT: 'Support', LONG: 'Long' };
const DEPARTMENTS = ['General', 'Emergency', 'Pediatrics', 'Radiology', 'ICU', 'Surgery'];
const CONTRACT_TYPES = ['Full-Time', 'Part-Time', 'Student', 'Compressed', 'Specialist', 'Resident'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// --- ID GENERATOR ---
let shiftIdCounter = 0;
const generateShiftId = () => `shift-${Date.now()}-${++shiftIdCounter}`;

// --- DATE UTILS ---
const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateDates = (startDate, days) => {
  const dates = [];
  const start = new Date(startDate.getTime());
  for (let i = 0; i < days; i++) {
    const date = new Date(start.getTime());
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// --- UTILITY FUNCTIONS ---
const getShiftColors = (type) => {
  const colorMap = {
    [SHIFT_TYPES.NIGHT]: 'bg-purple-100 text-purple-700 border-purple-200',
    [SHIFT_TYPES.WEEKEND]: 'bg-orange-100 text-orange-700 border-orange-200',
    [SHIFT_TYPES.SURGERY]: 'bg-teal-100 text-teal-700 border-teal-200',
  };
  return colorMap[type] || 'bg-blue-100 text-blue-700 border-blue-200';
};

const calculateUtilization = (currentHours, capacity) => {
  const utilization = capacity > 0 ? (currentHours / capacity) * 100 : 0;
  let statusColor = 'bg-green-100 text-green-700 border-green-200';
  let barColor = 'bg-green-500';
  if (utilization > 100) {
    statusColor = 'bg-red-100 text-red-700 border-red-200';
    barColor = 'bg-red-500';
  } else if (utilization < 50) {
    statusColor = 'bg-yellow-100 text-yellow-700 border-yellow-200';
    barColor = 'bg-yellow-500';
  }
  return { utilization: Math.round(utilization), statusColor, barColor };
};

// --- INITIAL DATA ---
const INITIAL_STAFF_DATA = [
  { id: 1, name: 'Dr. Sarah Jenkin', role: 'Senior Doctor', department: 'Emergency', capacity: 40, type: 'Full-Time', email: 's.jenkin@hospital.com' },
  { id: 2, name: 'Nurse John Doe', role: 'Nurse', department: 'Pediatrics', capacity: 40, type: 'Full-Time', email: 'j.doe@hospital.com' }, 
  { id: 3, name: 'Tech Mike Ross', role: 'Technician', department: 'Radiology', capacity: 35, type: 'Part-Time', email: 'm.ross@hospital.com' },
  { id: 4, name: 'Dr. Emily Blunt', role: 'Junior Doctor', department: 'Emergency', capacity: 48, type: 'Resident', email: 'e.blunt@hospital.com' },
  { id: 5, name: 'Nurse Raj Patel', role: 'Senior Nurse', department: 'ICU', capacity: 36, type: 'Compressed', email: 'r.patel@hospital.com' },
  { id: 6, name: 'Student Lisa Wong', role: 'Intern', department: 'Pediatrics', capacity: 20, type: 'Student', email: 'l.wong@hospital.com' },
  { id: 7, name: 'Dr. Aisha Khan', role: 'Surgeon', department: 'Surgery', capacity: 50, type: 'Specialist', email: 'a.khan@hospital.com' },
  { id: 8, name: 'Porter Gary Oldman', role: 'Support', department: 'General', capacity: 40, type: 'Full-Time', email: 'g.oldman@hospital.com' }
];

const generateInitialShifts = () => {
  const shifts = [];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const allDates = generateDates(startOfWeek, 84);

  allDates.forEach(date => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateKey = formatDateKey(date);
    
    if (['Mon', 'Tue', 'Wed', 'Thu'].includes(dayName)) {
      shifts.push({ id: generateShiftId(), staffId: 1, date: dateKey, start: '09:00', end: '17:00', type: SHIFT_TYPES.DAY, hours: 8 });
    }
    if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(dayName)) {
      shifts.push({ id: generateShiftId(), staffId: 2, date: dateKey, start: '08:00', end: '16:00', type: SHIFT_TYPES.DAY, hours: 8 });
    } else if (dayName === 'Sat') {
      shifts.push({ id: generateShiftId(), staffId: 2, date: dateKey, start: '08:00', end: '16:00', type: SHIFT_TYPES.WEEKEND, hours: 8 });
    }
    if (['Mon', 'Wed'].includes(dayName)) {
      shifts.push({ id: generateShiftId(), staffId: 3, date: dateKey, start: '08:00', end: '18:00', type: SHIFT_TYPES.LONG, hours: 10 });
    }
    if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(dayName)) {
      shifts.push({ id: generateShiftId(), staffId: 4, date: dateKey, start: '09:00', end: '17:00', type: SHIFT_TYPES.DAY, hours: 8 });
    }
    if (['Mon', 'Tue', 'Thu'].includes(dayName)) {
      shifts.push({ id: generateShiftId(), staffId: 5, date: dateKey, start: '07:00', end: '19:00', type: SHIFT_TYPES.NIGHT, hours: 12 });
    }
    if (['Sat', 'Sun'].includes(dayName)) {
      shifts.push({ id: generateShiftId(), staffId: 6, date: dateKey, start: '09:00', end: '16:30', type: SHIFT_TYPES.WEEKEND, hours: 7.5 });
    }
    if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(dayName)) {
      shifts.push({ id: generateShiftId(), staffId: 7, date: dateKey, start: '08:00', end: '17:00', type: SHIFT_TYPES.SURGERY, hours: 9 });
    }
    if (['Tue', 'Thu'].includes(dayName)) {
      shifts.push({ id: generateShiftId(), staffId: 8, date: dateKey, start: '10:00', end: '15:00', type: SHIFT_TYPES.SUPPORT, hours: 5 });
    }
  });
  return shifts;
};

// --- COMPONENTS ---

// 0. Patient Self-Triage Component
const PatientTriage = ({ onBack }) => {
  const [step, setStep] = useState('emergency');
  const [triageData, setTriageData] = useState({
    hasEmergency: null,
    bodySystem: '',
    commonComplaint: '',
    painScale: 5,
    duration: '',
    dailyImpact: '',
    hasFever: null,
    feverTemp: '',
  });
  const [referenceNumber, setReferenceNumber] = useState('');
  const [showClinician, setShowClinician] = useState(false);

  const generateReference = () => {
    const ref = `ST-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setReferenceNumber(ref);
    return ref;
  };

  const handleEmergencyCheck = (hasEmergency) => {
    setTriageData({ ...triageData, hasEmergency });
    if (hasEmergency) {
      setStep('call999');
    } else {
      setStep('symptoms');
    }
  };

  const handleSymptomsNext = () => {
    if (!triageData.bodySystem && !triageData.commonComplaint) return;
    setStep('severity');
  };

  const handleSeverityNext = () => {
    generateReference();
    setStep('results');
  };

  const getRecommendation = () => {
    const { painScale, dailyImpact, hasFever, bodySystem } = triageData;
    const isUrgent = painScale >= 8 || dailyImpact === 'severe' || (hasFever && parseFloat(triageData.feverTemp) >= 39);
    const isModerate = painScale >= 5 || dailyImpact === 'moderate' || hasFever;
    
    if (bodySystem === 'unsure' || isUrgent) {
      return { level: 'urgent', message: 'We recommend speaking with a clinician as soon as possible.', color: 'red' };
    } else if (isModerate) {
      return { level: 'moderate', message: 'Please book an appointment within 24-48 hours.', color: 'yellow' };
    }
    return { level: 'mild', message: 'Your symptoms appear mild. Monitor and seek help if they worsen.', color: 'green' };
  };

  const bodySystemOptions = [
    { value: 'respiratory', label: 'Respiratory (breathing, cough, chest)' },
    { value: 'digestive', label: 'Digestive (stomach, nausea, bowel)' },
    { value: 'musculoskeletal', label: 'Musculoskeletal (muscles, joints, back)' },
    { value: 'neurological', label: 'Neurological (headache, dizziness, numbness)' },
    { value: 'skin', label: 'Skin (rash, itching, wounds)' },
    { value: 'urinary', label: 'Urinary (pain, frequency, blood)' },
    { value: 'mental', label: 'Mental Health (anxiety, mood, sleep)' },
    { value: 'other', label: 'Other' },
    { value: 'unsure', label: "I'm not sure" },
  ];

  const commonComplaints = [
    'Headache', 'Cold/Flu symptoms', 'Sore throat', 'Ear pain', 
    'Back pain', 'Stomach ache', 'Fatigue', 'Skin rash', 'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
            <X size={20} /> Back to Login
          </button>
          <button 
            onClick={() => setShowClinician(true)}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 flex items-center gap-2 border border-red-200"
          >
            <AlertTriangle size={18} /> Speak to Clinician
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Zap className="text-blue-600" /> Patient Self-Triage
          </h1>
          <p className="text-gray-500 mt-2">Answer a few questions to help us understand your needs</p>
        </div>

        {step !== 'call999' && step !== 'results' && (
          <div className="flex justify-center gap-2 mb-8">
            {['emergency', 'symptoms', 'severity'].map((s, i) => (
              <div key={s} className={`h-2 w-16 rounded-full ${
                step === s ? 'bg-blue-600' : 
                ['emergency', 'symptoms', 'severity'].indexOf(step) > i ? 'bg-blue-300' : 'bg-gray-200'
              }`} />
            ))}
          </div>
        )}

        {step === 'emergency' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <h2 className="text-lg font-bold text-red-800 flex items-center gap-2 mb-3">
                <AlertTriangle className="text-red-600" /> Immediate Warning Signs
              </h2>
              <p className="text-red-700 mb-4">Are you experiencing any of the following?</p>
              <ul className="space-y-2 text-red-700 text-sm">
                <li className="flex items-start gap-2"><span className="text-red-500">•</span> Chest pain or pressure</li>
                <li className="flex items-start gap-2"><span className="text-red-500">•</span> Difficulty breathing or shortness of breath</li>
                <li className="flex items-start gap-2"><span className="text-red-500">•</span> Severe or uncontrolled bleeding</li>
                <li className="flex items-start gap-2"><span className="text-red-500">•</span> Signs of stroke (face drooping, arm weakness, speech difficulty)</li>
                <li className="flex items-start gap-2"><span className="text-red-500">•</span> Loss of consciousness or confusion</li>
                <li className="flex items-start gap-2"><span className="text-red-500">•</span> Severe allergic reaction</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => handleEmergencyCheck(true)}
                className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                Yes - I need emergency help
              </button>
              <button 
                onClick={() => handleEmergencyCheck(false)}
                className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors"
              >
                No - Continue assessment
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">* Required question</p>
          </div>
        )}

        {step === 'call999' && (
          <div className="bg-red-600 rounded-2xl shadow-lg p-8 text-white text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Call 999 Immediately</h2>
            <p className="text-red-100 text-lg mb-6">
              Based on your symptoms, you need emergency medical attention.
            </p>
            <a 
              href="tel:999" 
              className="inline-block bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-xl hover:bg-red-50 transition-colors"
            >
              📞 Call 999 Now
            </a>
            <p className="text-red-200 text-sm mt-6">
              If you cannot call, ask someone nearby to help you.
            </p>
            <button 
              onClick={() => { setTriageData({...triageData, hasEmergency: false}); setStep('symptoms'); }}
              className="mt-6 text-red-200 underline hover:text-white text-sm"
            >
              I made a mistake - go back
            </button>
          </div>
        )}

        {step === 'symptoms' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Tell us about your symptoms</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which body system is affected? <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={triageData.bodySystem}
                  onChange={(e) => setTriageData({...triageData, bodySystem: e.target.value})}
                >
                  <option value="">Select an option...</option>
                  {bodySystemOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or select a common complaint:
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonComplaints.map(complaint => (
                    <button
                      key={complaint}
                      onClick={() => setTriageData({...triageData, commonComplaint: complaint})}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        triageData.commonComplaint === complaint 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {complaint}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setStep('emergency')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200"
              >
                Back
              </button>
              <button 
                onClick={handleSymptomsNext}
                disabled={!triageData.bodySystem && !triageData.commonComplaint}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'severity' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Symptom Severity Assessment</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pain level (1-10) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">No pain</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={triageData.painScale}
                    onChange={(e) => setTriageData({...triageData, painScale: parseInt(e.target.value)})}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">Severe</span>
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    triageData.painScale <= 3 ? 'bg-green-500' : 
                    triageData.painScale <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {triageData.painScale}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How long have you had these symptoms? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Less than 24 hours', '1-3 days', '4-7 days', 'More than a week'].map(dur => (
                    <button
                      key={dur}
                      onClick={() => setTriageData({...triageData, duration: dur})}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors border ${
                        triageData.duration === dur 
                          ? 'bg-blue-50 border-blue-500 text-blue-700' 
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact on daily activities <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'mild', label: 'Mild', desc: 'Can do most activities' },
                    { value: 'moderate', label: 'Moderate', desc: 'Some activities affected' },
                    { value: 'severe', label: 'Severe', desc: 'Unable to do normal activities' }
                  ].map(impact => (
                    <button
                      key={impact.value}
                      onClick={() => setTriageData({...triageData, dailyImpact: impact.value})}
                      className={`p-3 rounded-lg text-center transition-colors border ${
                        triageData.dailyImpact === impact.value 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`font-medium ${triageData.dailyImpact === impact.value ? 'text-blue-700' : 'text-gray-800'}`}>
                        {impact.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{impact.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you have a fever or elevated temperature? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTriageData({...triageData, hasFever: true})}
                    className={`flex-1 p-3 rounded-lg font-medium transition-colors border ${
                      triageData.hasFever === true 
                        ? 'bg-red-50 border-red-500 text-red-700' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setTriageData({...triageData, hasFever: false, feverTemp: ''})}
                    className={`flex-1 p-3 rounded-lg font-medium transition-colors border ${
                      triageData.hasFever === false 
                        ? 'bg-green-50 border-green-500 text-green-700' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    No
                  </button>
                </div>
                {triageData.hasFever && (
                  <div className="mt-3">
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Temperature in °C (e.g., 38.5)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={triageData.feverTemp}
                      onChange={(e) => setTriageData({...triageData, feverTemp: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setStep('symptoms')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200"
              >
                Back
              </button>
              <button 
                onClick={handleSeverityNext}
                disabled={!triageData.duration || !triageData.dailyImpact || triageData.hasFever === null}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Results
              </button>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            {(() => {
              const rec = getRecommendation();
              return (
                <>
                  <div className={`text-center p-6 rounded-xl mb-6 ${
                    rec.color === 'red' ? 'bg-red-50 border border-red-200' :
                    rec.color === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-green-50 border border-green-200'
                  }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      rec.color === 'red' ? 'bg-red-100' :
                      rec.color === 'yellow' ? 'bg-yellow-100' :
                      'bg-green-100'
                    }`}>
                      {rec.color === 'red' ? <AlertTriangle className="text-red-600" size={32} /> :
                       rec.color === 'yellow' ? <Clock className="text-yellow-600" size={32} /> :
                       <CheckCircle className="text-green-600" size={32} />}
                    </div>
                    <h2 className={`text-xl font-bold mb-2 ${
                      rec.color === 'red' ? 'text-red-800' :
                      rec.color === 'yellow' ? 'text-yellow-800' :
                      'text-green-800'
                    }`}>
                      {rec.level === 'urgent' ? 'Urgent Care Recommended' :
                       rec.level === 'moderate' ? 'Book an Appointment' :
                       'Self-Care Advised'}
                    </h2>
                    <p className={`${
                      rec.color === 'red' ? 'text-red-700' :
                      rec.color === 'yellow' ? 'text-yellow-700' :
                      'text-green-700'
                    }`}>
                      {rec.message}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Your Reference Number</p>
                      <p className="text-2xl font-mono font-bold text-gray-800">{referenceNumber}</p>
                      <p className="text-xs text-gray-400 mt-2">Please save this for your records</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                    <h3 className="font-medium text-blue-800 mb-2">Summary of your responses:</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Body system: {triageData.bodySystem || triageData.commonComplaint}</li>
                      <li>• Pain level: {triageData.painScale}/10</li>
                      <li>• Duration: {triageData.duration}</li>
                      <li>• Daily impact: {triageData.dailyImpact}</li>
                      <li>• Fever: {triageData.hasFever ? `Yes${triageData.feverTemp ? ` (${triageData.feverTemp}°C)` : ''}` : 'No'}</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={onBack}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200"
                    >
                      Return to Home
                    </button>
                    <button 
                      onClick={() => setShowClinician(true)}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <User size={18} /> Speak to Clinician
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {showClinician && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Contact a Clinician</h3>
            <p className="text-gray-600 mb-6">
              If you need to speak with a healthcare professional immediately, please use one of the following options:
            </p>
            <div className="space-y-3">
              <a href="tel:111" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-center hover:bg-blue-700">
                📞 Call NHS 111
              </a>
              <a href="tel:999" className="block w-full bg-red-600 text-white py-3 rounded-xl font-bold text-center hover:bg-red-700">
                🚨 Emergency: Call 999
              </a>
            </div>
            {referenceNumber && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Your reference: <span className="font-mono font-bold">{referenceNumber}</span>
              </p>
            )}
            <button 
              onClick={() => setShowClinician(false)}
              className="w-full mt-4 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 1. Login Page
const LoginPage = ({ onLogin, staffData, onTriageClick }) => {
  const [email, setEmail] = useState('admin@hospital.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (loading || !email || !password) return;
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (email === 'admin@hospital.com') {
        onLogin({ role: 'admin', name: 'Admin User', email: 'admin@hospital.com' });
      } else {
        const staffMember = staffData.find(s => s.email.toLowerCase() === email.toLowerCase());
        if (staffMember) {
          onLogin({ role: 'staff', ...staffMember });
        } else {
          setError('Invalid email or password. Try s.jenkin@hospital.com');
          setLoading(false);
        }
      }
    }, 800);
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <div className="hidden lg:flex w-5/12 bg-blue-600 text-white flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="relative z-10"><h1 className="text-3xl font-bold flex items-center gap-2"><Zap className="text-yellow-300" /> SmartShift</h1></div>
        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-6 leading-tight">Smart scheduling <br/>for smarter care.</h2>
          <p className="text-blue-100 text-xl font-light">Optimize workforce efficiency and reduce burnout with our AI-powered rostering solution.</p>
        </div>
        <div className="relative z-10 text-sm text-blue-200 font-medium">© 2025 SmartShift System</div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold flex items-center gap-2 lg:hidden justify-center mb-6 text-blue-600"><Zap className="text-yellow-500" /> SmartShift</h1>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-500">Please enter your details to sign in.</p>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" autoComplete="email" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10" autoComplete="current-password" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
            <button onClick={handleLogin} disabled={loading} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {loading ? 'Signing in...' : 'Log in'}
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-500 border border-gray-200">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Admin: admin@hospital.com</p>
            <p>Staff: s.jenkin@hospital.com (or any other staff email)</p>
            <p>Pass: password (any)</p>
          </div>
          
          <button 
            onClick={onTriageClick}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <User size={18} /> Patient Self-Triage
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Sidebar
const Sidebar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen, currentUser }) => {
  const adminItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
    { id: 'staff', icon: Users, label: 'Staff' },
    { id: 'reports', icon: FileText, label: 'Reports' },
  ];
  const staffItems = [
    { id: 'staff-dashboard', icon: LayoutDashboard, label: 'My Overview' },
    { id: 'schedule', icon: Calendar, label: 'Team Schedule' },
  ];
  const menuItems = currentUser.role === 'admin' ? adminItems : staffItems;

  return (
    <>
      {mobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <nav className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-600 text-white transform transition-transform duration-300 ease-in-out shadow-xl lg:translate-x-0 lg:shadow-none ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} role="navigation" aria-label="Main navigation">
        <div className="p-6 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="text-yellow-300" /> SmartShift</h1>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-white hover:bg-blue-700 p-1 rounded" aria-label="Close menu"><X size={24} /></button>
        </div>
        <div className="px-6 pb-6"><p className="text-blue-200 text-xs font-medium uppercase tracking-wider">{currentUser.role === 'admin' ? 'Admin Portal' : 'Staff Portal'}</p></div>
        <div className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === item.id ? 'bg-white text-blue-700 font-bold shadow-md' : 'text-blue-100 hover:bg-blue-500'}`} aria-current={activeTab === item.id ? 'page' : undefined}>
              <item.icon size={20} className={activeTab === item.id ? "text-blue-600" : "text-blue-200 group-hover:text-white"} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-blue-500 mt-auto">
          <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-white text-blue-700 font-semibold' : 'text-blue-100 hover:bg-blue-500'}`}>
            <Settings size={20} /> Settings
          </button>
        </div>
      </nav>
    </>
  );
};

// 3. Staff List
const StaffList = ({ staff, shifts, weekDates, searchQuery, onAddStaff, onEditStaff, onDeleteStaff }) => {
  const filteredStaff = useMemo(() => staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  ), [staff, searchQuery]);

  const weekStart = formatDateKey(weekDates[0]);
  const weekEnd = formatDateKey(weekDates[6]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
          <p className="text-gray-500 text-sm">Managing {filteredStaff.length} active personnel.</p>
        </div>
        <button onClick={onAddStaff} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <User size={16} /> Add New Staff
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStaff.map((member) => {
          const memberShifts = shifts.filter(s => s.staffId === member.id && s.date >= weekStart && s.date <= weekEnd);
          const currentHours = memberShifts.reduce((acc, curr) => acc + curr.hours, 0);
          const { utilization, statusColor, barColor } = calculateUtilization(currentHours, member.capacity);
          const initials = member.name.split(' ').map(n => n[0]).join('');

          return (
            <article key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => onEditStaff(member)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md" aria-label={`Edit ${member.name}`}><Edit2 size={14}/></button>
                <button onClick={() => onDeleteStaff(member.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md" aria-label={`Delete ${member.name}`}><Trash2 size={14}/></button>
              </div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100">{initials}</div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColor}`}>{utilization}% Load</span>
              </div>
              <h3 className="font-bold text-gray-900 truncate pr-8">{member.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{member.role}</p>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2"><Briefcase size={14} className="text-gray-400" /><span>{member.department}</span></div>
                <div className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /><span>{member.type}</span></div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Weekly Hours</span>
                  <span className="font-medium text-gray-900">{currentHours} / {member.capacity} hrs</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${Math.min(utilization, 100)}%` }}></div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

// 4. Schedule View
const ScheduleView = ({ shifts, setShifts, staff, weekDates, onPrevWeek, onNextWeek, searchQuery, isReadOnly }) => {
  const [editingShift, setEditingShift] = useState(null);

  const filteredStaff = useMemo(() => staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  ), [staff, searchQuery]);

  const handleShiftClick = (shift) => { if (!isReadOnly) setEditingShift(shift); };
  
  const handleAddShift = (staffId, dateKey) => {
    if (isReadOnly) return;
    const newShift = { id: generateShiftId(), staffId, date: dateKey, start: '09:00', end: '17:00', type: SHIFT_TYPES.DAY, hours: 8 };
    setShifts(prev => [...prev, newShift]);
  };

  const handleDeleteShift = () => {
    setShifts(prev => prev.filter(s => s.id !== editingShift.id));
    setEditingShift(null);
  };

  const handleReassign = (newStaffId) => {
    setShifts(prev => prev.map(s => s.id === editingShift.id ? { ...s, staffId: parseInt(newStaffId) } : s));
    setEditingShift(null);
  };

  return (
    <div className="space-y-6 max-w-full relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Weekly Roster</h2>
          <p className="text-gray-500 text-sm">{weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onPrevWeek} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50">Previous Week</button>
          <button onClick={onNextWeek} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50">Next Week</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-48 sticky left-0 bg-gray-50 z-10">Staff Member</th>
                {weekDates.map(date => (
                  <th key={formatDateKey(date)} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-l border-gray-100">
                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStaff.map(member => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-100">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.role}</div>
                      </div>
                    </div>
                  </td>
                  {weekDates.map(date => {
                    const dateKey = formatDateKey(date);
                    const shift = shifts.find(s => s.staffId === member.id && s.date === dateKey);
                    
                    if (!shift) {
                      return (
                        <td key={dateKey} className={`px-2 py-3 border-l border-gray-100 bg-gray-50/30 text-center relative group ${!isReadOnly ? 'cursor-pointer hover:bg-gray-100' : ''}`}>
                          {!isReadOnly && (
                            <button onClick={() => handleAddShift(member.id, dateKey)} className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Plus size={16} className="text-gray-400" />
                            </button>
                          )}
                        </td>
                      );
                    }

                    const shiftColor = getShiftColors(shift.type);
                    return (
                      <td key={dateKey} className="px-2 py-3 border-l border-gray-100">
                        <button onClick={() => handleShiftClick(shift)} disabled={isReadOnly} className={`w-full rounded-md p-2 text-xs border ${shiftColor} shadow-sm text-left ${!isReadOnly ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>
                          <div className="font-semibold">{shift.start} - {shift.end}</div>
                          <div className="opacity-75 text-[10px] uppercase mt-0.5">{shift.type}</div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingShift && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 w-80">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Edit Shift</h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <p><strong>Date:</strong> {editingShift.date}</p>
                <p><strong>Time:</strong> {editingShift.start} - {editingShift.end}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Reassign To:</label>
                <select className="w-full text-sm border border-gray-300 rounded p-2" onChange={(e) => handleReassign(e.target.value)} defaultValue="">
                  <option value="" disabled>Select Staff</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleDeleteShift} className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded text-sm hover:bg-red-100 flex items-center justify-center gap-2"><Trash2 size={16}/> Delete</button>
                <button onClick={() => setEditingShift(null)} className="flex-1 bg-gray-50 text-gray-600 border border-gray-200 py-2 rounded text-sm hover:bg-gray-100">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Admin Dashboard
const AdminDashboard = ({ staff, shifts, weekDates, setActiveTab, onRunOptimization }) => {
  const [showOptimization, setShowOptimization] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const weekStart = formatDateKey(weekDates[0]);
  const weekEnd = formatDateKey(weekDates[6]);
  
  const tuesdayDate = weekDates.find(d => d.getDay() === 2);
  const tuesdayKey = tuesdayDate ? formatDateKey(tuesdayDate) : null;
  const optimizationAvailable = tuesdayKey && shifts.some(s => s.staffId === 2 && s.date === tuesdayKey);
  
  const workloadMap = useMemo(() => {
    return staff.map(member => {
      const memberShifts = shifts.filter(s => s.staffId === member.id && s.date >= weekStart && s.date <= weekEnd);
      const hours = memberShifts.reduce((acc, curr) => acc + curr.hours, 0);
      const nameParts = member.name.split(' ');
      const displayName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
      return { name: displayName, hours, capacity: member.capacity };
    });
  }, [staff, shifts, weekStart, weekEnd]);

  const departmentLoad = useMemo(() => {
    const deptMap = {};
    staff.forEach(member => {
      const memberShifts = shifts.filter(s => s.staffId === member.id && s.date >= weekStart && s.date <= weekEnd);
      const hours = memberShifts.reduce((acc, curr) => acc + curr.hours, 0);
      if (hours > 0) deptMap[member.department] = (deptMap[member.department] || 0) + hours;
    });
    return Object.keys(deptMap).map(dept => ({ name: dept, value: deptMap[dept] })).sort((a, b) => b.value - a.value);
  }, [staff, shifts, weekStart, weekEnd]);

  const overloadedCount = workloadMap.filter(w => w.hours > w.capacity).length;
  const totalHours = workloadMap.reduce((acc, curr) => acc + curr.hours, 0);
  const totalCapacity = workloadMap.reduce((acc, curr) => acc + curr.capacity, 0);
  const avgUtilization = totalCapacity > 0 ? Math.round((totalHours / totalCapacity) * 100) : 0;

  const handleOptimizationClick = () => {
    setIsOptimizing(true);
    setTimeout(() => { setIsOptimizing(false); setShowOptimization(true); }, 1500);
  };

  const handleAcceptOptimization = () => {
    onRunOptimization(weekDates); 
    setShowOptimization(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Overview Dashboard</h2>
          <p className="text-gray-500 text-sm">Real-time metrics for week of {weekDates[0].toLocaleDateString()}</p>
        </div>
        <button onClick={handleOptimizationClick} disabled={isOptimizing} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
          {isOptimizing ? <span className="animate-pulse">Analyzing...</span> : <><Zap size={18} /> Run AI Optimization</>}
        </button>
      </div>

      {showOptimization && (
        <div className={`border p-6 rounded-xl flex items-start gap-4 shadow-sm ${optimizationAvailable ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
          <div className={`p-2 rounded-full ${optimizationAvailable ? 'bg-yellow-100' : 'bg-green-100'}`}>
            {optimizationAvailable ? <AlertTriangle className="text-yellow-600" size={24} /> : <CheckCircle className="text-green-600" size={24} />}
          </div>
          <div className="flex-1">
            {optimizationAvailable ? (
              <>
                <h3 className="font-bold text-yellow-900 text-lg">Optimization Recommendation Found</h3>
                <p className="text-yellow-800 mt-1"><strong>Nurse John Doe</strong> is currently overloaded ({workloadMap.find(w => w.name === 'John')?.hours} hrs).</p>
                <p className="text-yellow-800">Suggestion: Move <strong>Tuesday Shift</strong> to <strong>Tech Mike Ross</strong>.</p>
                <div className="mt-4 flex gap-3">
                  <button onClick={handleAcceptOptimization} className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Accept Recommendation</button>
                  <button onClick={() => setShowOptimization(false)} className="bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">Dismiss</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-bold text-green-900 text-lg">Schedule Optimized</h3>
                <p className="text-green-800 mt-1">No critical overload detected for this week. AI Analysis complete.</p>
                <div className="mt-4">
                  <button onClick={() => setShowOptimization(false)} className="bg-white border border-green-300 text-green-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-50 transition-colors shadow-sm">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div><h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Average Workload</h3><p className="text-4xl font-bold text-gray-800 mt-2">{avgUtilization}%</p></div>
            <div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="text-green-500" size={24} /></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50"><span className="text-green-600 text-sm font-medium flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span> Healthy Range</span></div>
        </div>
        <button onClick={() => setActiveTab('staff')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group hover:border-blue-200 text-left w-full">
          <div className="flex justify-between items-start">
            <div><h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide group-hover:text-blue-600 transition-colors">Overloaded Staff</h3><p className="text-4xl font-bold text-red-600 mt-2">{overloadedCount}</p></div>
            <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors"><AlertTriangle className="text-red-500" size={24} /></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50"><span className="text-red-500 text-sm font-medium flex items-center">Requires Attention</span></div>
        </button>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div><h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Active Shifts</h3><p className="text-4xl font-bold text-blue-600 mt-2">142</p></div>
            <div className="p-2 bg-blue-50 rounded-lg"><Calendar className="text-blue-500" size={24} /></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50"><span className="text-gray-400 text-sm font-medium">Current Week</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-800 mb-6">Workload Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={workloadMap}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
              <YAxis hide />
              <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
              <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-800 mb-6">Department Load</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={departmentLoad} cx="50%" cy="50%" innerRadius={80} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value">
                {departmentLoad.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />))}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// 6. Staff Dashboard
const StaffDashboard = ({ currentUser, shifts, weekDates }) => {
  const todayKey = formatDateKey(new Date());
  const weekStart = formatDateKey(weekDates[0]);
  const weekEnd = formatDateKey(weekDates[6]);

  const nextShift = useMemo(() => 
    shifts.filter(s => s.staffId === currentUser.id && s.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date))[0]
  , [shifts, currentUser.id, todayKey]);

  const myWeeklyShifts = useMemo(() => 
    shifts.filter(s => s.staffId === currentUser.id && s.date >= weekStart && s.date <= weekEnd)
      .sort((a, b) => a.date.localeCompare(b.date))
  , [shifts, currentUser.id, weekStart, weekEnd]);

  const totalHours = myWeeklyShifts.reduce((acc, curr) => acc + curr.hours, 0);
  const { utilization, barColor } = calculateUtilization(totalHours, currentUser.capacity);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {currentUser.name.split(' ')[1]}</h2>
        <p className="text-gray-500 text-sm">Here is your schedule overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Next Shift</p>
              <h3 className="text-3xl font-bold mb-2">
                {nextShift ? new Date(nextShift.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }) : 'No Upcoming Shifts'}
              </h3>
              <p className="text-xl opacity-90">{nextShift ? `${nextShift.start} - ${nextShift.end}` : '-'}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm"><Clock size={32} /></div>
          </div>
          {nextShift && (
            <div className="mt-6 pt-4 border-t border-white/20 flex items-center gap-2">
              <Briefcase size={16} />
              <span className="text-sm font-medium">{nextShift.type} Shift in {currentUser.department}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Weekly Hours</p>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">{totalHours} <span className="text-sm text-gray-400 font-normal">/ {currentUser.capacity}</span></h3>
              <div className="w-48 bg-gray-100 rounded-full h-2 mt-2">
                <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${Math.min(utilization, 100)}%` }}></div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-400"><BarChart2 size={32} /></div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-50">
            <p className="text-sm text-gray-500">{totalHours > currentUser.capacity ? 'You are over capacity this week.' : 'Your workload is balanced.'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800">Your Schedule This Week</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {myWeeklyShifts.length > 0 ? myWeeklyShifts.map(shift => (
            <div key={shift.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex flex-col items-center justify-center text-blue-600 font-bold border border-blue-100">
                  <span className="text-xs uppercase">{new Date(shift.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="text-lg">{new Date(shift.date + 'T00:00:00').getDate()}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{shift.type} Shift</p>
                  <p className="text-sm text-gray-500">{shift.start} - {shift.end} • {shift.hours} hrs</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">Confirmed</span>
            </div>
          )) : (
            <div className="p-8 text-center text-gray-500">No shifts scheduled for this week.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// 7. Reports View
const ReportsView = ({ staff, shifts }) => {
  const [reportType, setReportType] = useState('workload'); 

  const workloadReport = useMemo(() => {
    return staff.map(member => {
      const memberShifts = shifts.filter(s => s.staffId === member.id);
      const totalHours = memberShifts.reduce((acc, curr) => acc + curr.hours, 0);
      const utilization = Math.round((totalHours / (member.capacity * 12)) * 100);
      return { ...member, totalHours, utilization };
    });
  }, [staff, shifts]);

  const shiftTypeData = useMemo(() => {
    const counts = { [SHIFT_TYPES.DAY]: 0, [SHIFT_TYPES.NIGHT]: 0, [SHIFT_TYPES.WEEKEND]: 0, [SHIFT_TYPES.SURGERY]: 0, [SHIFT_TYPES.SUPPORT]: 0 };
    shifts.forEach(s => { counts[s.type] = (counts[s.type] || 0) + 1; });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [shifts]);

  const handleExportCSV = () => {
    const headers = "Staff Name,Role,Department,Total Hours (3 Months),Capacity (Weekly),Utilization %\n";
    const rows = workloadReport.map(r => `${r.name},${r.role},${r.department},${r.totalHours},${r.capacity},${r.utilization}%`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart_shift_workload_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <p className="text-gray-500 text-sm">Exportable data for workforce analysis.</p>
        </div>
        <div className="flex gap-2">
          <select className="border border-gray-300 rounded-lg text-sm p-2 bg-white" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="workload">Workload Summary</option>
            <option value="shifts">Shift Distribution</option>
          </select>
          <button onClick={handleExportCSV} className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"><FileSpreadsheet size={16} /> Export CSV</button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"><Printer size={16} /> Print Report</button>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">{reportType === 'workload' ? 'Staff Workload Analysis (Quarterly)' : 'Shift Type Distribution'}</h3>
          <p className="text-gray-500 text-sm">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        
        {reportType === 'workload' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr><th className="py-3 px-4">Staff Name</th><th className="py-3 px-4">Role</th><th className="py-3 px-4">Department</th><th className="py-3 px-4 text-center">Contract Type</th><th className="py-3 px-4 text-right">Total Hours</th><th className="py-3 px-4 text-right">Avg Utilization</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workloadReport.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
                    <td className="py-3 px-4 text-gray-600">{row.role}</td>
                    <td className="py-3 px-4 text-gray-600">{row.department}</td>
                    <td className="py-3 px-4 text-center"><span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{row.type}</span></td>
                    <td className="py-3 px-4 text-right font-mono">{row.totalHours}</td>
                    <td className="py-3 px-4 text-right"><span className={`font-bold ${row.utilization > 100 ? 'text-red-600' : 'text-green-600'}`}>{row.utilization}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={shiftTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                  {shiftTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// 8. Settings
const SettingsPage = ({ onLogout, currentUser }) => {
  const [notifications, setNotifications] = useState({ email: true, push: false });
  const [toast, setToast] = useState(null);
  const handleToggle = (key) => { setNotifications(prev => ({ ...prev, [key]: !prev[key] })); showToast('Preferences updated successfully'); };
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {toast && <div className="fixed top-20 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50"><CheckCircle size={20} /> <span className="font-medium">{toast}</span></div>}
      <div className="mb-6"><h2 className="text-2xl font-bold text-gray-800">Account Settings</h2><p className="text-gray-500 mt-1">Manage your profile and system preferences</p></div>
      <div className="grid gap-6">
        <section className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="flex gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold ring-4 ring-blue-50">
                {currentUser.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
                <p className="text-sm text-gray-500 mt-1">Update your personal details and photo</p>
                <div className="mt-3 text-gray-800 font-medium text-lg">{currentUser.name}</div>
                <div className="text-sm text-gray-500">{currentUser.email}</div>
              </div>
            </div>
            <button onClick={() => showToast('Edit Profile Modal would open')} className="text-blue-600 font-medium px-6 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors w-full sm:w-auto">Edit Profile</button>
          </div>
        </section>
        <section className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h3>
          <div className="space-y-6">
            {[{ id: 'email', label: 'Email Notifications', desc: 'Receive email updates', icon: Mail }, { id: 'push', label: 'Push Notifications', desc: 'Get notifications on your device', icon: Smartphone }].map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500"><item.icon size={20}/></div>
                  <div><div className="font-medium text-gray-900">{item.label}</div><div className="text-sm text-gray-500 hidden sm:block">{item.desc}</div></div>
                </div>
                <button onClick={() => handleToggle(item.id)} className={`w-14 h-7 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${notifications[item.id] ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${notifications[item.id] ? 'left-8' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </div>
        </section>
        <div className="pt-6 flex justify-end">
          <button onClick={onLogout} className="text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-8 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors w-full sm:w-auto justify-center"><LogOut size={18}/> Sign Out</button>
        </div>
      </div>
    </div>
  );
};

// 9. Main App
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showTriage, setShowTriage] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const [staff, setStaff] = useState(INITIAL_STAFF_DATA);
  const [shifts, setShifts] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());
    return lastSunday;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState(null); 

  useEffect(() => {
    setShifts(generateInitialShifts());
  }, []);

  useEffect(() => {
    if (currentUser) setActiveTab(currentUser.role === 'admin' ? 'dashboard' : 'staff-dashboard');
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentWeekDates = useMemo(() => generateDates(currentWeekStart, 7), [currentWeekStart]);

  const handlePrevWeek = useCallback(() => {
    setCurrentWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d; });
  }, []);
  
  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d; });
  }, []);

  const runOptimization = useCallback((weekDates) => {
    const tuesdayDate = weekDates.find(d => d.getDay() === 2); 
    if (!tuesdayDate) return;
    const tuesdayKey = formatDateKey(tuesdayDate);
    setShifts(prevShifts => prevShifts.map(shift => {
      if (shift.staffId === 2 && shift.date === tuesdayKey) return { ...shift, staffId: 3 }; 
      return shift;
    }));
  }, []);

  const handleAddStaff = () => {
    setStaffForm({ id: null, name: '', role: '', department: 'General', capacity: 40, type: 'Full-Time', email: '' });
    setShowStaffModal(true);
  };

  const handleEditStaff = (member) => { setStaffForm({ ...member }); setShowStaffModal(true); };

  const handleDeleteStaff = (id) => {
    if(window.confirm('Are you sure you want to remove this staff member?')) {
      setStaff(prev => prev.filter(s => s.id !== id));
      setShifts(prev => prev.filter(s => s.staffId !== id)); 
    }
  };

  const handleSaveStaff = () => {
    if (!staffForm.name || !staffForm.role || !staffForm.email) return;
    if (staffForm.id) {
      setStaff(prev => prev.map(s => s.id === staffForm.id ? staffForm : s));
    } else {
      const newId = Math.max(...staff.map(s => s.id), 0) + 1;
      setStaff(prev => [...prev, { ...staffForm, id: newId }]);
    }
    setShowStaffModal(false);
  };

  if (!currentUser) {
    if (showTriage) {
      return <PatientTriage onBack={() => setShowTriage(false)} />;
    }
    return <LoginPage onLogin={setCurrentUser} staffData={staff} onTriageClick={() => setShowTriage(true)} />;
  }

  const isReadOnly = currentUser.role === 'staff';

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} currentUser={currentUser} />
      <main className="flex-1 lg:ml-64 flex flex-col h-full overflow-hidden relative transition-all duration-300">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm shrink-0 z-20 sticky top-0">
          <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setMobileMenuOpen(true)}><Menu size={24} /></button>
          
          <div className="relative w-96 hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all hover:bg-white hover:border-gray-300" />
          </div>

          <div className="flex items-center gap-3 relative">
            <div className="relative" data-dropdown>
              <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Bell size={20} /><span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-100 font-semibold text-sm flex justify-between items-center"><span>Notifications</span><button className="text-xs text-blue-600 hover:underline">Mark all read</button></div>
                  <div className="p-2 space-y-1">
                    <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer text-sm transition-colors">
                      <div className="font-medium text-gray-900">Shift Request</div>
                      <div className="text-gray-500 text-xs mt-1">Dr. Jenkin requested a swap.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="relative" data-dropdown>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 pl-2 lg:pl-4 lg:border-l border-gray-200 group">
                <div className="text-right hidden lg:block">
                  <div className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{currentUser.name}</div>
                  <div className="text-xs text-gray-500">{currentUser.role === 'admin' ? 'Hospital Manager' : currentUser.role}</div>
                </div>
                <div className="w-9 h-9 bg-blue-100 rounded-full overflow-hidden border border-blue-200 flex items-center justify-center group-hover:ring-2 ring-blue-200 transition-all"><User size={18} className="text-blue-600"/></div>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <div className="py-1">
                    <button onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"><Settings size={16} /> Account Settings</button>
                    <button onClick={() => setCurrentUser(null)} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"><LogOut size={16} /> Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
          {activeTab === 'dashboard' && <AdminDashboard staff={staff} shifts={shifts} weekDates={currentWeekDates} setActiveTab={setActiveTab} onRunOptimization={runOptimization} />}
          {activeTab === 'staff-dashboard' && <StaffDashboard currentUser={currentUser} shifts={shifts} weekDates={currentWeekDates} />}
          {activeTab === 'settings' && <SettingsPage onLogout={() => setCurrentUser(null)} currentUser={currentUser} />}
          {activeTab === 'staff' && <StaffList staff={staff} shifts={shifts} weekDates={currentWeekDates} searchQuery={searchQuery} onAddStaff={handleAddStaff} onEditStaff={handleEditStaff} onDeleteStaff={handleDeleteStaff} />}
          {activeTab === 'schedule' && <ScheduleView shifts={shifts} setShifts={setShifts} staff={staff} weekDates={currentWeekDates} onPrevWeek={handlePrevWeek} onNextWeek={handleNextWeek} searchQuery={searchQuery} isReadOnly={isReadOnly} />}
          {activeTab === 'reports' && <ReportsView staff={staff} shifts={shifts} />}
        </div>
      </main>

      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">{staffForm?.id ? 'Edit Staff Member' : 'Add New Staff'}</h3>
              <button onClick={() => setShowStaffModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={staffForm?.name || ''} onChange={e => setStaffForm({...staffForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={staffForm?.role || ''} onChange={e => setStaffForm({...staffForm, role: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={staffForm?.department || 'General'} onChange={e => setStaffForm({...staffForm, department: e.target.value})}>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Capacity (Hrs)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={staffForm?.capacity || 40} onChange={e => setStaffForm({...staffForm, capacity: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={staffForm?.type || 'Full-Time'} onChange={e => setStaffForm({...staffForm, type: e.target.value})}>
                    {CONTRACT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={staffForm?.email || ''} onChange={e => setStaffForm({...staffForm, email: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setShowStaffModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={handleSaveStaff} disabled={!staffForm?.name || !staffForm?.role || !staffForm?.email} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Save size={18}/> Save Staff</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
