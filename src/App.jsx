import React, { useState } from 'react';

// --- CORE METRICS CALCULATION LOGIC ---

// Word Error Rate (WER) calculation function
const calculateWer = (reference, hypothesis) => {
    const referenceWords = reference.toLowerCase().trim().split(/\s+/).filter(w => w);
    const hypothesisWords = hypothesis.toLowerCase().trim().split(/\s+/).filter(w => w);

    if (referenceWords.length === 0) {
        return hypothesisWords.length > 0 ? 100 : 0;
    }

    const n = referenceWords.length;
    const m = hypothesisWords.length;

    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    for (let i = 0; i <= n; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j <= m; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const cost = referenceWords[i - 1] === hypothesisWords[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,        // Deletion
                dp[i][j - 1] + 1,        // Insertion
                dp[i - 1][j - 1] + cost  // Substitution
            );
        }
    }

    const wer = (dp[n][m] / n) * 100;
    return wer.toFixed(2);
};

// Keyword Error Rate (KER) calculation function
const calculateKer = (reference, hypothesis, keywords) => {
    const keywordSet = new Set(keywords.map(kw => kw.toLowerCase().trim()));
    const referenceWords = reference.toLowerCase().trim().split(/\s+/).filter(w => w);
    const hypothesisWords = hypothesis.toLowerCase().trim().split(/\s+/).filter(w => w);

    let totalKeywords = 0;
    let keywordErrors = 0;
    
    referenceWords.forEach(word => {
        if (keywordSet.has(word)) {
            totalKeywords++;
        }
    });

    if (totalKeywords === 0) {
        return "N/A";
    }

    keywordSet.forEach(keyword => {
        const keywordInRef = referenceWords.includes(keyword);
        const keywordInHyp = hypothesisWords.includes(keyword);

        if (keywordInRef && !keywordInHyp) {
            keywordErrors++;
        }
    });

    const ker = (keywordErrors / totalKeywords) * 100;
    return ker.toFixed(2);
};

// Keyword Recognition Rate (KRR) calculation function
const calculateKrr = (ker) => {
    if (ker === "N/A") {
        return "N/A";
    }
    return (100 - parseFloat(ker)).toFixed(2);
};

// --- TEMPLATES FOR INSTANT DEMO ---
const templates = [
    {
        title: "Medical Transcription Mistake",
        reference: "The patient was prescribed five milligrams of Risperdal and should take it twice daily.",
        hypothesis: "The patient was prescribed five milligrams of Respirator and should take it twice daily.",
        keywords: "Risperdal, milligrams, daily"
    },
    {
        title: "Financial Compliance Error",
        reference: "The company must report all assets valued over one million dollars for compliance purposes.",
        hypothesis: "The company must report all assists valued over one billion dollars for compliance purposes.",
        keywords: "assets, compliance"
    },
    {
        title: "Customer Support Issue",
        reference: "I want to cancel my subscription and get a full refund as per the policy.",
        hypothesis: "I want to cancel my subscriptions and get a full refund as per the policy.",
        keywords: "cancel, refund, subscription"
    }
];

// --- VISUALIZATION COMPONENT ---
const MetricsResult = ({ wer, ker, krr, reference, hypothesis, keywords, showBreakdown }) => {
    const renderErrorBreakdown = () => {
        const referenceWords = reference.toLowerCase().trim().split(/\s+/).filter(w => w);
        const hypothesisWords = hypothesis.toLowerCase().trim().split(/\s+/).filter(w => w);
        const keywordSet = new Set(keywords.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0).map(kw => kw.toLowerCase()));

        const result = [];
        let i = 0, j = 0;
        while (i < referenceWords.length || j < hypothesisWords.length) {
            const isKeyword = i < referenceWords.length && keywordSet.has(referenceWords[i]);

            if (i < referenceWords.length && j < hypothesisWords.length && referenceWords[i] === hypothesisWords[j]) {
                result.push(
                    <span key={`match-${i}`} className={`text-green-600 font-semibold ${isKeyword ? 'bg-yellow-200 rounded px-1' : ''}`}>
                        {referenceWords[i]}{' '}
                    </span>
                );
                i++;
                j++;
            } else {
                if (i < referenceWords.length) {
                    result.push(
                        <span key={`ref-${i}`} className={`text-red-600 font-semibold line-through ${isKeyword ? 'bg-red-200 rounded px-1' : ''}`}>
                            {referenceWords[i]}{' '}
                        </span>
                    );
                    i++;
                }
                if (j < hypothesisWords.length) {
                    result.push(
                        <span key={`hyp-${j}`} className={`text-blue-600 font-semibold`}>
                            {hypothesisWords[j]}{' '}
                        </span>
                    );
                    j++;
                }
            }
        }
        return result;
    };

    return (
        <div className="mt-8 p-6 bg-gray-50 rounded-xl shadow-inner">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Results</h3>
            <div className="flex justify-around mb-6">
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">WER</p>
                    <p className="text-4xl font-extrabold text-indigo-600">{wer}%</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">KER</p>
                    <p className="text-4xl font-extrabold text-purple-600">{ker}%</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">KRR</p>
                    <p className="text-4xl font-extrabold text-teal-600">{krr}%</p>
                </div>
            </div>
            {showBreakdown && (
                <div className="mt-4 p-4 bg-white rounded-md text-sm shadow-sm">
                    <p className="mb-2 text-gray-700">
                        <span className="text-red-600 font-semibold">Strikethrough: Deletion</span> |{' '}
                        <span className="text-blue-600 font-semibold">Blue: Insertion</span> |{' '}
                        <span className="text-green-600 font-semibold">Green: Match</span> |{' '}
                        <span className="bg-yellow-200 px-1 rounded">Yellow: Keyword</span>
                    </p>
                    <div className="font-mono text-gray-900 leading-relaxed mt-2">
                        {renderErrorBreakdown()}
                    </div>
                </div>
            )}
        </div>
    );
};

const LeadCaptureForm = () => {
    const [formData, setFormData] = useState({ firstname: '', lastname: '', company: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch('/api/submit-form', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitStatus('success');
                // The actual download link will be sent via email by HubSpot,
                // but you can show a success message here.
            } else {
                setSubmitStatus('error');
                console.error('Form submission failed:', await response.json());
            }
        } catch (error) {
            setSubmitStatus('error');
            console.error('An error occurred during submission:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Download the Code & Guide</h2>
            <p className="text-gray-600 mb-4">
                Get the complete source code for this calculator and a detailed guide on ASR metrics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} placeholder="First Name" className="p-3 border rounded-md" required />
                <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} placeholder="Last Name" className="p-3 border rounded-md" required />
                <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Company" className="p-3 border rounded-md" required />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="p-3 border rounded-md" required />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Submitting...' : 'Download Code & Guide'}
            </button>

            {submitStatus === 'success' && (
                <p className="mt-4 text-center text-green-600">Success! Check your inbox for the download link.</p>
            )}
            {submitStatus === 'error' && (
                <p className="mt-4 text-center text-red-600">There was an error. Please try again.</p>
            )}
        </form>
    );
};


// --- MAIN APP COMPONENT ---
const App = () => {
    const [reference, setReference] = useState('');
    const [hypothesis, setHypothesis] = useState('');
    const [keywords, setKeywords] = useState('');
    const [results, setResults] = useState(null);
    const [showBreakdown, setShowBreakdown] = useState(false);

    const handleCalculate = () => {
        if (!reference || !hypothesis) {
            alert("Please provide both Reference and Hypothesis texts.");
            return;
        }

        const keywordsArray = keywords.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0);
        const wer = calculateWer(reference, hypothesis);
        const ker = keywordsArray.length > 0 ? calculateKer(reference, hypothesis, keywordsArray) : "N/A";
        const krr = keywordsArray.length > 0 ? calculateKrr(ker) : "N/A";

        setResults({ wer, ker, krr });
        setShowBreakdown(true);
    };

    const handleLoadTemplate = (template) => {
        setReference(template.reference);
        setHypothesis(template.hypothesis);
        setKeywords(template.keywords);
        
        // Auto-calculate results for the template
        const keywordsArray = template.keywords.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0);
        const wer = calculateWer(template.reference, template.hypothesis);
        const ker = keywordsArray.length > 0 ? calculateKer(template.reference, template.hypothesis, keywordsArray) : "N/A";
        const krr = keywordsArray.length > 0 ? calculateKrr(ker) : "N/A";
        setResults({ wer, ker, krr });
        setShowBreakdown(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-8 flex items-center justify-center font-sans">
            <div className="max-w-3xl mx-auto w-full bg-white p-6 sm:p-10 rounded-xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">ASR Metrics Calculator</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">Input your reference and ASR texts to instantly calculate WER, KER, and KRR.</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="block text-sm font-medium text-gray-700 mb-2">Or, try an example to see how it works:</p>
                        <div className="flex flex-wrap gap-2">
                            {templates.map((template, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleLoadTemplate(template)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-indigo-200 hover:text-indigo-800 transition-colors duration-200"
                                >
                                    {template.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reference" className="block text-sm font-medium text-gray-700">Reference Text (Ground Truth)</label>
                        <textarea
                            id="reference"
                            value={reference}
                            onChange={(e) => {setReference(e.target.value); setResults(null);}}
                            rows="4"
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="e.g., 'The patient was prescribed five milligrams of Risperdal.'"
                        />
                    </div>
                    <div>
                        <label htmlFor="hypothesis" className="block text-sm font-medium text-gray-700">Hypothesis Text (ASR Output)</label>
                        <textarea
                            id="hypothesis"
                            value={hypothesis}
                            onChange={(e) => {setHypothesis(e.target.value); setResults(null);}}
                            rows="4"
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="e.g., 'The patient was prescribed five milligrams of Respirator.'"
                        />
                    </div>
                    <div>
                        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">Critical Keywords (comma separated)</label>
                        <input
                            id="keywords"
                            type="text"
                            value={keywords}
                            onChange={(e) => {setKeywords(e.target.value); setResults(null);}}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="e.g., 'Risperdal, milligrams'"
                        />
                    </div>
                    
                    <button
                        onClick={handleCalculate}
                        className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
                    >
                        Calculate Metrics
                    </button>
                </div>
                
                {results && (
                    <>
                        <MetricsResult
                            wer={results.wer}
                            ker={results.ker}
                            krr={results.krr}
                            reference={reference}
                            hypothesis={hypothesis}
                            keywords={keywords}
                            showBreakdown={showBreakdown}
                        />
                        <button
                            onClick={() => setShowBreakdown(!showBreakdown)}
                            className="mt-4 w-full text-center text-indigo-600 hover:text-indigo-800 font-medium py-2 rounded-md transition-colors duration-200"
                        >
                            {showBreakdown ? 'Hide Error Breakdown' : 'Show Error Breakdown'}
                        </button>
                    </>
                )}

                {/* Lead Capture Form */}
                <LeadCaptureForm />
            </div>
        </div>
    );
};

export default App; 