// Pre-set challenge test cases organized by category
const CHALLENGES = {
    'Ambiguous / Mixed Identifiers': [
        { text: 'Your Case ID is F0L1X0E.', description: 'Mixed alphanumeric identifier with zeros and letters', pronunciation: 'F, zero, L, one, X, zero, E.' },
        { text: 'The system shows your authentication token as B0D5V2N.', description: 'Alphanumeric token with zeros', pronunciation: 'B, zero, D, five, V, two, N.' },
        { text: 'The reference number associated with your request is O30DV87.', description: 'Mixed identifier starting with letter', pronunciation: 'O, three, zero, D, V, eight, seven.' },
        { text: 'Your temporary login password is P@ssw0rd123.', description: 'Password with special characters and alphanumerics', pronunciation: 'P, at, S, S, W, zero, R, D, one, two, three.' }
    ],
    'Contiguous SKUs / Product Codes': [
        { text: 'The part number you requested is 326DART4.', description: 'Product code with mixed alphanumerics', pronunciation: 'Three, two, six, D, A, R, T, four.' },
        { text: 'I found the product with SKU K700L2V.', description: 'SKU code with letters and numbers', pronunciation: 'K, seven, zero, zero, L, two, V.' },
        { text: 'Your replacement component is listed as 443B90A.', description: 'Component code identifier', pronunciation: 'Four, four, three, B, nine, zero, A.' }
    ],
    'Tracking & Logistics': [
        { text: 'Your tracking number is 1Z9999E90000000057.', description: 'Long tracking number with letters and digits', pronunciation: 'One, Z, nine, nine, nine, nine, E, nine, zero, zero, zero, zero, zero, zero, zero, zero, five, seven.' },
        { text: 'The FedEx door tag on your shipment is DT120034567890.', description: 'Door tag with prefix and numbers', pronunciation: 'D, T, one, two, zero, zero, three, four, five, six, seven, eight, nine, zero.' },
        { text: 'Your shipment reference code is TX-790-B4.', description: 'Reference code with hyphens', pronunciation: 'T, X, seven, nine, zero, B, four.' }
    ],
    'Financial / Account Retrieval': [
        { text: 'Your account number is 021000021.', description: 'Account number with leading zero', pronunciation: 'Zero, two, one, zero, zero, zero, zero, two, one.' },
        { text: 'The routing number on file is 11000015.', description: 'Bank routing number', pronunciation: 'One, one, zero, zero, zero, zero, one, five.' },
        { text: 'Your total today is $12.99 USD.', description: 'Currency amount with USD', pronunciation: 'Twelve dollars and ninety-nine cents.' },
        { text: 'The applicable tax rate is 9.75%.', description: 'Percentage with decimal', pronunciation: 'Nine point seven five percent.' },
        { text: 'According to the report, the athlete signed a contract for $5.7M.', description: 'Currency amount with millions', pronunciation: 'Five point seven million dollars.' },
        { text: 'The menu shows that the drink costs $2.09.', description: 'Currency amount with cents', pronunciation: 'Two dollars and nine cents.' },
        { text: 'A movie ticket now costs $7.49.', description: 'Currency amount with cents', pronunciation: 'Seven dollars and forty-nine cents.' }
    ],
    'Address Retrieval': [
        { text: 'Your mailing address is 123 N. 15th St. Unit B6.', description: 'Address with ordinal and unit', pronunciation: 'One twenty-three North fifteenth Street, Unit B six.' },
        { text: 'The location we have on file is 4500 N. Lake Shore Dr.', description: 'Address with direction abbreviation', pronunciation: 'Forty-five hundred North Lake Shore Drive.' },
        { text: 'Your shipping address is 101 E. 1st St. Apt. 2B.', description: 'Address with ordinal and apartment', pronunciation: 'One oh one East First Street, Apartment two B.' },
        { text: 'Your delivery address on file is 608 Birch Ter, Fairview, FL 32067.', description: 'Address with terrace abbreviation and state', pronunciation: 'Six oh eight Birch terrace, Fairview, Florida three two zero six seven.' },
        { text: 'The service technician is scheduled to visit 269 Elm Pkwy., Lansing, TX 16261.', description: 'Address with parkway abbreviation and state', pronunciation: 'Two six nine Elm parkway, Lansing, Texas one six two six one.' },
        { text: 'Your billing address is listed as 119 Pine St, Greenville, MI 31407.', description: 'Address with street and state', pronunciation: 'One nineteen Pine street, Greenville, Michigan three one four zero seven.' }
    ],
    'General Verification Codes': [
        { text: 'Just to confirm, the code you provided is 65DH9.', description: 'Verification code with digits and letters', pronunciation: 'Six, five, D, H, nine.' },
        { text: 'I heard your verification code as 6-5-D-H-9. Is that correct?', description: 'Spelled out verification code with hyphens', pronunciation: 'Six, five, D, H, nine.' },
        { text: 'Let me repeat that back: your reference ID is T2025A04X.', description: 'Reference ID with mixed format', pronunciation: 'T, two, zero, two, five, A, zero, four, X.' }
    ],
    'Phone Numbers & Extensions': [
        { text: 'I have your number as 800-555-1212 ext. 450.', description: 'Phone number with extension', pronunciation: 'Eight hundred, five five five, twelve twelve, extension four five zero.' },
        { text: 'You said your contact number is 8005551212. Is that right?', description: 'Phone number without formatting', pronunciation: 'Eight hundred, five five five, twelve twelve.' }
    ],
    'Addresses for Confirmation': [
        { text: 'And the unit you mentioned is listed as Unit B6.', description: 'Unit identifier confirmation', pronunciation: 'Unit B six.' },
        { text: 'Just confirming your address: 101 E. 1st St. Apt. 2B.', description: 'Full address confirmation', pronunciation: 'One oh one East First Street, Apartment two B.' }
    ],
    'Alpha-Heavy Confirmations': [
        { text: 'Your case number is T-X-790.', description: 'Case number with hyphens', pronunciation: 'T, X, seven, nine, zero.' },
        { text: 'The component code you referenced is A2-B7.', description: 'Component code with hyphens', pronunciation: 'A, two, B, seven.' }
    ],
    'URLs / API Paths': [
        { text: 'You can access the API documentation at dg.com/API_v2.', description: 'URL with underscore and version', pronunciation: 'D G dot com slash A P I underscore V two.' },
        { text: 'Please sign in at support.dg.com/v3/login.', description: 'Subdomain URL with path', pronunciation: 'Support dot D G dot com slash V three slash login.' },
        { text: 'For support, you can reach us at support@help.br, visit airtel.in, or email help@barclays.co.uk.', description: 'Email addresses and URLs with country codes', pronunciation: 'Support at help dot B R, visit airtel dot I N, or email help at barclays dot C O dot U K.' }
    ],
    'Files / Documents': [
        { text: 'The file you need is named Report_Q3_24.pdf.', description: 'Filename with underscore and date', pronunciation: 'Report underscore Q three twenty-four dot P D F.' },
        { text: 'Your exported report is stored as Invoice_2024-07-15.csv.', description: 'Filename with date format', pronunciation: 'Invoice underscore twenty-twenty-four dash zero seven dash fifteen dot C S V.' }
    ],
    'Software / Version Numbers': [
        { text: 'You\'re currently running version v3.5 SP1.', description: 'Version with service pack', pronunciation: 'Version three point five S P one.' },
        { text: 'The system build you\'re on is Build 14.2.7.', description: 'Build number with dots', pronunciation: 'Build fourteen point two point seven.' }
    ],
    'Chemicals / Technical Codes': [
        { text: 'The chemical identifier listed here is H2O2.', description: 'Chemical formula with subscript numbers', pronunciation: 'H, two, O, two.' },
        { text: 'Your material classification code is A2-B7.', description: 'Material code with hyphens', pronunciation: 'A, two, B, seven.' }
    ],
    'Forced-Challenge / High-Stakes Character Mode': [
        { text: 'Your secure key is 5XQ27P.', description: 'Short alphanumeric secure key', pronunciation: 'Five, X, Q, two, seven, P.' }
    ],
    'Time / Duration': [
        { text: 'Please make sure the task is finished by 03:00pm.', description: 'Time format with PM', pronunciation: 'Three P M.' },
        { text: 'According to the maintenance notice, the work will take 10 hrs and 15 mins to complete.', description: 'Time duration with hours and minutes', pronunciation: 'Ten hours and fifteen minutes' }
    ]
};

// Global state
let ws = null;
let audioContext = null;
let startTime = null;
let currentText = '';

// Provider state tracking
const providerState = {
    elevenlabs: {
        ttfa: null,
        audioBuffer: null,
        sourceNode: null,
        isStreaming: false,
        isBuffering: false,
        isBuffered: false,
        firstChunkReceived: false,
        audioChunks: [] // Accumulate raw audio chunks
    },
    cartesia: {
        ttfa: null,
        audioBuffer: null,
        sourceNode: null,
        isStreaming: false,
        isBuffering: false,
        isBuffered: false,
        firstChunkReceived: false,
        audioChunks: [] // Accumulate raw audio chunks (PCM format)
    },
    deepgram: {
        ttfa: null,
        audioBuffer: null,
        sourceNode: null,
        isStreaming: false,
        isBuffering: false,
        isBuffered: false,
        firstChunkReceived: false,
        audioChunks: [] // Accumulate raw audio chunks (linear16 PCM)
    },
    rime: {
        ttfa: null,
        audioBuffer: null,
        sourceNode: null,
        isStreaming: false,
        isBuffering: false,
        isBuffered: false,
        firstChunkReceived: false,
        audioChunks: [] // Accumulate raw audio chunks (PCM format)
    }
};

// Initialize Web Audio API
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

/**
 * Wrap raw PCM bytes into a WAV Blob for browser playback
 * @param {Uint8Array | ArrayBuffer} pcmBytes - raw PCM byte data
 * @param {object} opts
 * @param {number} opts.sampleRate - e.g. 24000
 * @param {number} opts.numChannels - 1 for mono, 2 for stereo
 * @param {number} opts.bytesPerSample - 2 for 16-bit, 4 for 32-bit float
 * @returns {Blob} - a Blob representing a valid WAV file
 */
function pcmToWavBlob(pcmBytes, { sampleRate = 24000, numChannels = 1, bytesPerSample = 2 } = {}) {
    const dataLength = pcmBytes.byteLength || pcmBytes.length;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // Helper to write strings
    function writeString(view, offset, str) {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    }
    
    // RIFF identifier 'RIFF'
    writeString(view, 0, 'RIFF');
    // file length minus 8 bytes
    view.setUint32(4, 36 + dataLength, true);
    // RIFF type 'WAVE'
    writeString(view, 8, 'WAVE');
    // Format chunk 'fmt '
    writeString(view, 12, 'fmt ');
    // Format chunk length = 16
    view.setUint32(16, 16, true);
    // Audio format 1 = PCM, 3 = IEEE float
    const audioFormat = (bytesPerSample === 4 ? 3 : 1);
    view.setUint16(20, audioFormat, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true); // bits per sample
    // Data chunk header 'data'
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Combine header + PCM data
    const pcmArray = pcmBytes instanceof Uint8Array ? pcmBytes : new Uint8Array(pcmBytes);
    const wavBuffer = new Uint8Array(44 + dataLength);
    wavBuffer.set(new Uint8Array(wavHeader), 0);
    wavBuffer.set(pcmArray, 44);
    
    return new Blob([wavBuffer], { type: 'audio/wav' });
}

// Initialize WebSocket connection
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        updateStatus('all', 'Connected');
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'connected') {
                console.log('Connection established:', data.connectionId);
                return;
            }
            
            // Handle provider-specific messages
            if (data.provider === 'cartesia') {
                if (data.type === 'audio') {
                    handleAudioChunk(data.provider, data.data);
                } else if (data.type === 'done') {
                    console.log('Cartesia stream complete. Triggering final buffer assembly.');
                    console.log(`Provider state before completion:`, {
                        chunks: providerState[data.provider]?.audioChunks?.length || 0,
                        isBuffered: providerState[data.provider]?.isBuffered || false,
                        isStreaming: providerState[data.provider]?.isStreaming || false
                    });
                    handleStreamComplete(data.provider);
                } else if (data.type === 'error') {
                    console.error(`Stream error for ${data.provider}:`, data.message);
                    handleStreamError(data.provider, data.message);
                }
            } else if (data.provider === 'deepgram') {
                if (data.type === 'audio') {
                    handleAudioChunk(data.provider, data.data);
                } else if (data.type === 'done') {
                    console.log('Deepgram stream complete. Triggering final buffer assembly.');
                    console.log(`Provider state before completion:`, {
                        chunks: providerState[data.provider]?.audioChunks?.length || 0,
                        isBuffered: providerState[data.provider]?.isBuffered || false,
                        isStreaming: providerState[data.provider]?.isStreaming || false
                    });
                    handleStreamComplete(data.provider);
                } else if (data.type === 'error') {
                    console.error(`Stream error for ${data.provider}:`, data.message);
                    handleStreamError(data.provider, data.message);
                }
            } else if (data.provider === 'rime') {
                if (data.type === 'audio') {
                    handleAudioChunk(data.provider, data.data);
                } else if (data.type === 'done') {
                    console.log('Rime stream complete. Triggering final buffer assembly.');
                    console.log(`Provider state before completion:`, {
                        chunks: providerState[data.provider]?.audioChunks?.length || 0,
                        isBuffered: providerState[data.provider]?.isBuffered || false,
                        isStreaming: providerState[data.provider]?.isStreaming || false
                    });
                    handleStreamComplete(data.provider);
                } else if (data.type === 'error') {
                    console.error(`Stream error for ${data.provider}:`, data.message);
                    handleStreamError(data.provider, data.message);
                }
            } else if (data.type === 'audio') {
                // ElevenLabs or other providers
                handleAudioChunk(data.provider, data.data);
            } else if (data.type === 'done') {
                console.log(`Stream complete for ${data.provider}`);
                console.log(`Provider state before completion:`, {
                    chunks: providerState[data.provider]?.audioChunks?.length || 0,
                    isBuffered: providerState[data.provider]?.isBuffered || false,
                    isStreaming: providerState[data.provider]?.isStreaming || false
                });
                handleStreamComplete(data.provider);
            } else if (data.type === 'error') {
                console.error(`Stream error for ${data.provider}:`, data.message);
                handleStreamError(data.provider, data.message);
            } else {
                console.log('Unknown message type from server:', data);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateStatus('all', 'Connection Error');
    };
    
    ws.onclose = () => {
        console.log('WebSocket closed');
        updateStatus('all', 'Disconnected');
        // Attempt to reconnect after 2 seconds
        setTimeout(initWebSocket, 2000);
    };
}

// Handle incoming audio chunk
function handleAudioChunk(provider, base64Data) {
    const state = providerState[provider];
    
    if (!state) {
        console.error('Unknown provider:', provider);
        return;
    }
    
    // Record TTFA on first chunk
    if (!state.firstChunkReceived && startTime) {
        const ttfa = Date.now() - startTime;
        state.ttfa = ttfa;
        state.firstChunkReceived = true;
        state.isBuffering = true;
        state.isStreaming = true;
        updateTTFADisplay(provider, ttfa);
        updateStatus(provider, 'Buffering...');
    }
    
    // Accumulate audio chunk (don't play it)
    try {
        const audioData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        state.audioChunks.push(audioData);
    } catch (error) {
        console.error(`Error processing audio chunk for ${provider}:`, error);
    }
}

// Build complete AudioBuffer from accumulated chunks
async function buildAudioBuffer(provider) {
    const state = providerState[provider];
    const ctx = initAudioContext();
    
    if (!state.audioChunks || state.audioChunks.length === 0) {
        console.error(`No audio chunks to build buffer for ${provider}`);
        return null;
    }
    
    // Concatenate all audio chunks
    let totalLength = 0;
    state.audioChunks.forEach(chunk => {
        totalLength += chunk.length;
    });
    
    const combinedAudio = new Uint8Array(totalLength);
    let offset = 0;
    state.audioChunks.forEach(chunk => {
        combinedAudio.set(chunk, offset);
        offset += chunk.length;
    });
    
    try {
        let audioBuffer;
        
        if (provider === 'elevenlabs') {
            // ElevenLabs sends MP3 - decode with decodeAudioData
            console.log(`Decoding ${provider} audio as MP3, total size: ${combinedAudio.length} bytes`);
            try {
                audioBuffer = await ctx.decodeAudioData(combinedAudio.buffer);
                console.log(`${provider} audio decoded successfully, duration: ${audioBuffer.duration}s`);
            } catch (decodeError) {
                console.error(`Error decoding ${provider} audio:`, decodeError);
                throw decodeError; // Will be caught by outer catch
            }
        } else if (provider === 'rime') {
            // Rime sends raw PCM (16-bit signed integer) - convert to AudioBuffer
            const sampleRate = 24000;
            const numChannels = 1; // Mono
            const bytesPerSample = 2; // 16-bit = 2 bytes per sample
            const frameCount = Math.floor(combinedAudio.length / bytesPerSample);
            
            console.log(`[rime] Processing PCM: ${combinedAudio.length} bytes, ${frameCount} frames at ${sampleRate}Hz`);
            
            audioBuffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            // Convert 16-bit signed integer PCM to float32
            const dv = new DataView(combinedAudio.buffer, combinedAudio.byteOffset, combinedAudio.byteLength);
            for (let i = 0; i < frameCount; i++) {
                const int16Sample = dv.getInt16(i * bytesPerSample, true); // little-endian
                channelData[i] = int16Sample / 32768.0; // Normalize to [-1, 1]
            }
            
            console.log(`[rime] Built AudioBuffer with ${frameCount} frames, duration: ${audioBuffer.duration}s`);
        } else if (provider === 'deepgram') {
            // Deepgram sends linear16 (16-bit signed integer PCM)
            // Wrap with WAV header to avoid clicks/pops at boundaries
            const sampleRate = 24000;
            const numChannels = 1; // Mono
            const bytesPerSample = 2; // 16-bit = 2 bytes per sample
            const frameCount = Math.floor(combinedAudio.length / bytesPerSample);
            
            console.log(`[deepgram] Processing linear16 PCM: ${combinedAudio.length} bytes, ${frameCount} frames at ${sampleRate}Hz`);
            
            // First, convert to AudioBuffer to apply DC offset correction and smooth boundaries
            const tempBuffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
            const channelData = tempBuffer.getChannelData(0);
            
            // Convert 16-bit signed integer PCM to float32
            const dv = new DataView(combinedAudio.buffer, combinedAudio.byteOffset, combinedAudio.byteLength);
            for (let i = 0; i < frameCount; i++) {
                const int16Sample = dv.getInt16(i * bytesPerSample, true);
                channelData[i] = int16Sample / 32768.0;
            }
            
            // Calculate and remove DC offset (mean value)
            let sum = 0;
            for (let i = 0; i < frameCount; i++) {
                sum += channelData[i];
            }
            const dcOffset = sum / frameCount;
            console.log(`[deepgram] DC offset detected: ${dcOffset.toFixed(6)}`);
            
            // Remove DC offset
            if (Math.abs(dcOffset) > 0.0001) {
                for (let i = 0; i < frameCount; i++) {
                    channelData[i] -= dcOffset;
                }
                console.log(`[deepgram] DC offset removed`);
            }
            
            // Apply longer, smoother fade-in/fade-out to prevent clicks at boundaries
            // Use a longer fade (up to 480 samples = 20ms at 24kHz) for very smooth transitions
            const fadeSamples = Math.min(480, Math.floor(frameCount * 0.03)); // 3% of audio or 480 samples (20ms), whichever is smaller
            if (fadeSamples > 0 && frameCount > fadeSamples * 2) {
                // Fade in using smoother curve (raised cosine / Hann window)
                for (let i = 0; i < fadeSamples; i++) {
                    // Hann window: smoother than cosine, eliminates clicks better
                    const fade = 0.5 * (1 - Math.cos(2 * Math.PI * i / (fadeSamples - 1)));
                    channelData[i] *= fade;
                }
                // Fade out using Hann window
                for (let i = frameCount - fadeSamples; i < frameCount; i++) {
                    const fade = 0.5 * (1 - Math.cos(2 * Math.PI * (frameCount - 1 - i) / (fadeSamples - 1)));
                    channelData[i] *= fade;
                }
                console.log(`[deepgram] Applied ${fadeSamples}-sample Hann window fade in/out`);
            }
            
            // Find zero crossings near boundaries and trim to them for smooth start/end
            if (frameCount > 20) {
                // Find first zero crossing near start (look further ahead)
                let startIdx = 0;
                const searchRange = Math.min(500, Math.floor(frameCount * 0.1)); // Search up to 10% of audio
                for (let i = 1; i < searchRange; i++) {
                    // Check for zero crossing (sign change)
                    if ((channelData[i - 1] <= 0 && channelData[i] >= 0) || 
                        (channelData[i - 1] >= 0 && channelData[i] <= 0)) {
                        // Found zero crossing - use this as start point
                        startIdx = i;
                        break;
                    }
                }
                // Apply smooth fade to samples before the first zero crossing
                if (startIdx > 0) {
                    const preFadeSamples = Math.min(startIdx, 50);
                    for (let i = 0; i < startIdx; i++) {
                        if (i < preFadeSamples) {
                            // Smooth fade to zero
                            const fade = i / preFadeSamples;
                            channelData[i] *= fade;
                        } else {
                            channelData[i] = 0;
                        }
                    }
                }
                
                // Find last zero crossing near end (look further back)
                let endIdx = frameCount - 1;
                for (let i = frameCount - 2; i >= Math.max(0, frameCount - searchRange); i--) {
                    // Check for zero crossing (sign change)
                    if ((channelData[i] <= 0 && channelData[i + 1] >= 0) || 
                        (channelData[i] >= 0 && channelData[i + 1] <= 0)) {
                        // Found zero crossing - use this as end point
                        endIdx = i + 1;
                        break;
                    }
                }
                // Apply smooth fade to samples after the last zero crossing
                if (endIdx < frameCount - 1) {
                    const postFadeSamples = Math.min(frameCount - endIdx, 50);
                    for (let i = endIdx; i < frameCount; i++) {
                        const offset = i - endIdx;
                        if (offset < postFadeSamples) {
                            // Smooth fade to zero
                            const fade = 1 - (offset / postFadeSamples);
                            channelData[i] *= fade;
                        } else {
                            channelData[i] = 0;
                        }
                    }
                }
                
                if (startIdx > 0 || endIdx < frameCount - 1) {
                    console.log(`[deepgram] Trimmed to zero crossings: start=${startIdx}, end=${endIdx}`);
                }
            }
            
            // Ensure first and last few samples are exactly zero for clean boundaries
            const boundarySamples = 5;
            for (let i = 0; i < boundarySamples && i < frameCount; i++) {
                channelData[i] = 0;
            }
            for (let i = frameCount - boundarySamples; i < frameCount; i++) {
                if (i >= 0) channelData[i] = 0;
            }
            
            audioBuffer = tempBuffer;
            console.log(`[deepgram] Built AudioBuffer with ${frameCount} frames, duration: ${audioBuffer.duration.toFixed(3)}s`);
        } else {
            // Fallback: Assume PCM format
            const sampleRate = 16000;
            const numChannels = 1;
            const length = combinedAudio.length / 2; // 16-bit = 2 bytes per sample
            
            audioBuffer = ctx.createBuffer(numChannels, length, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            // Convert 16-bit PCM to float32
            for (let i = 0; i < length; i++) {
                const sample = (combinedAudio[i * 2] | (combinedAudio[i * 2 + 1] << 8));
                // Handle signed 16-bit PCM
                const signedSample = sample > 32767 ? sample - 65536 : sample;
                channelData[i] = signedSample / 32768.0;
            }
        }
        
        return audioBuffer;
        
    } catch (error) {
        console.error(`Error building audio buffer for ${provider}:`, error);
        console.error(`Provider: ${provider}, Audio chunks: ${state.audioChunks.length}, Total size: ${combinedAudio.length} bytes`);
        
        // If decode fails, try alternative approaches
        if (provider === 'elevenlabs') {
            // Try creating a Blob and using it for decoding
            try {
                const blob = new Blob([combinedAudio], { type: 'audio/mpeg' });
                const arrayBuffer = await blob.arrayBuffer();
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                console.log(`${provider} audio decoded via Blob method`);
                return audioBuffer;
            } catch (blobError) {
                console.error(`Blob decode also failed for ${provider}:`, blobError);
            }
        } else if (provider === 'rime') {
            // Rime fallback: try PCM processing again with error handling
            try {
                const sampleRate = 24000;
                const numChannels = 1;
                const bytesPerSample = 2;
                const frameCount = Math.floor(combinedAudio.length / bytesPerSample);
                const audioBuffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
                const channelData = audioBuffer.getChannelData(0);
                const dv = new DataView(combinedAudio.buffer, combinedAudio.byteOffset, combinedAudio.byteLength);
                for (let i = 0; i < frameCount; i++) {
                    const int16Sample = dv.getInt16(i * bytesPerSample, true);
                    channelData[i] = int16Sample / 32768.0;
                }
                console.log(`${provider} audio processed via fallback PCM method`);
                return audioBuffer;
            } catch (pcmError) {
                console.error(`PCM processing also failed for ${provider}:`, pcmError);
            }
        }
        
        updateStatus(provider, 'Decode Error');
        return null;
    }
}

// Play buffered audio on demand
function playBufferedAudio(provider) {
    const state = providerState[provider];
    
    console.log(`Attempting to play ${provider} audio`);
    
    const ctx = initAudioContext();
    
    console.log(`Audio buffer exists:`, !!state.audioBuffer);
    console.log(`Audio buffer duration:`, state.audioBuffer ? `${state.audioBuffer.duration}s` : 'N/A');
    console.log(`Audio buffer sample rate:`, state.audioBuffer ? `${state.audioBuffer.sampleRate}Hz` : 'N/A');
    
    if (!state.audioBuffer) {
        console.error(`No audio buffer available for ${provider}`);
        updateStatus(provider, 'No Audio Available');
        return;
    }
    
    // Stop any currently playing audio for this provider
    if (state.sourceNode) {
        try {
            state.sourceNode.stop();
        } catch (e) {
            // ignore
        }
        state.sourceNode = null;
    }
    
    try {
        const source = ctx.createBufferSource();
        source.buffer = state.audioBuffer;
        source.connect(ctx.destination);
        source.start(0);
        
        console.log(`${provider} audio playback started`);
        state.sourceNode = source;
        
        updateStatus(provider, 'Playing...');
        
        source.onended = () => {
            console.log(`${provider} audio playback ended`);
            state.sourceNode = null;
            updateStatus(provider, 'Ready to Play');
        };
        
        source.onerror = (error) => {
            console.error(`${provider} audio playback error:`, error);
            updateStatus(provider, 'Playback Error');
        };
    } catch (playError) {
        console.error(`Error playing ${provider} audio:`, playError);
        updateStatus(provider, `Play Error: ${playError.message}`);
    }
}


// Handle stream completion
async function handleStreamComplete(provider) {
    const state = providerState[provider];
    state.isStreaming = false;
    state.isBuffering = false;
    
    console.log(`${provider} stream complete. Total chunks: ${state.audioChunks.length}`);
    if (state.audioChunks.length > 0) {
        const totalSize = state.audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        console.log(`${provider} total audio size: ${totalSize} bytes`);
    }
    
    // Special handling for Cartesia and Rime raw PCM streams
    // Cartesia uses PCM float32, Rime uses PCM int16 (handled in buildAudioBuffer)
    if (provider === 'cartesia') {
        try {
            console.log(`Processing ${provider} raw PCM stream completion...`);
            console.log(`${provider} audio chunks: ${state.audioChunks.length}`);
            
            if (!state.audioChunks.length) {
                console.error(`${provider}: No audio chunks to process`);
                updateStatus(provider, 'No Audio Data');
                checkAllBufferingComplete();
                return;
            }
            
            // Concatenate all raw PCM bytes, ensuring 4-byte alignment
            // Since chunks may not be aligned, we need to track byte position carefully
            let totalLength = 0;
            state.audioChunks.forEach(chunk => totalLength += chunk.length);
            
            console.log(`[${provider}] Total PCM byte length before alignment: ${totalLength}`);
            console.log(`[${provider}] Number of chunks: ${state.audioChunks.length}`);
            
            // Check if length is a multiple of 4 (required for float32)
            const remainder = totalLength % 4;
            const alignedLength = totalLength - remainder;
            
            if (remainder !== 0) {
                console.warn(`[${provider}] WARNING: PCM data length ${totalLength} is not a multiple of 4. Truncating ${remainder} bytes to ${alignedLength}.`);
            }
            
            // Create a new ArrayBuffer with exact aligned size
            const pcmBuffer = new ArrayBuffer(alignedLength);
            const pcmBytes = new Uint8Array(pcmBuffer);
            let offset = 0;
            let bytesCopied = 0;
            
            // Copy chunks, ensuring we don't exceed aligned length
            for (const chunk of state.audioChunks) {
                const remainingBytes = alignedLength - bytesCopied;
                if (remainingBytes <= 0) break;
                
                const bytesToCopy = Math.min(chunk.length, remainingBytes);
                pcmBytes.set(chunk.slice(0, bytesToCopy), offset);
                offset += bytesToCopy;
                bytesCopied += bytesToCopy;
            }
            
            console.log(`[${provider}] Copied ${bytesCopied} bytes (aligned to ${alignedLength})`);
            
            // Interpret as float32 samples (little-endian)
            const sampleRate = 24000;
            const bytesPerSample = 4;
            const frameCount = alignedLength / bytesPerSample;
            
            console.log(`[${provider}] Creating AudioBuffer: ${frameCount} frames at ${sampleRate}Hz`);
            
            const audioContext = initAudioContext();
            const audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            // Use Float32Array view of the buffer
            const float32View = new Float32Array(pcmBuffer);
            
            // Copy samples from Float32Array to AudioBuffer
            const samplesToCopy = Math.min(float32View.length, frameCount);
            for (let i = 0; i < samplesToCopy; i++) {
                channelData[i] = float32View[i];
            }
            
            // If there are remaining frames, fill with silence
            if (samplesToCopy < frameCount) {
                for (let i = samplesToCopy; i < frameCount; i++) {
                    channelData[i] = 0;
                }
            }
            
            console.log(`[${provider}] Built AudioBuffer with ${frameCount} frames, duration: ${audioBuffer.duration.toFixed(3)}s`);
            
            state.audioBuffer = audioBuffer;
            state.isBuffered = true;
            
            updateStatus(provider, 'Ready to Play');
            checkAllBufferingComplete();
            return;
        } catch (err) {
            console.error(`Error building ${provider} AudioBuffer from PCM:`, err);
            updateStatus(provider, 'Buffer Error');
            checkAllBufferingComplete();
            return;
        }
        } else {
        // For other providers (ElevenLabs, Deepgram, Rime), use the existing AudioBuffer approach
        const audioBuffer = await buildAudioBuffer(provider);
        
        if (audioBuffer) {
            state.audioBuffer = audioBuffer;
            state.isBuffered = true;
            updateStatus(provider, 'Ready to Play');
            console.log(`${provider} audio buffer created successfully`);
            
            // Check if all providers are done buffering
            checkAllBufferingComplete();
        } else {
            console.error(`${provider} failed to build audio buffer`);
            updateStatus(provider, 'Buffer Error');
            // Still check completion so play buttons can show for the other provider
            checkAllBufferingComplete();
        }
    }
}

// Check if all providers have finished buffering
function checkAllBufferingComplete() {
    const allProviders = ['elevenlabs', 'cartesia', 'deepgram', 'rime'];
    
    // Check if all providers are done (either buffered successfully or errored out)
    const allComplete = allProviders.every(provider => {
        const state = providerState[provider];
        // Provider is complete if: buffered successfully OR (not streaming AND not buffering)
        return state.isBuffered || (!state.isStreaming && !state.isBuffering);
    });
    
    console.log('Checking if all buffering complete:', {
        allComplete,
        elevenlabs: {
            isBuffered: providerState.elevenlabs.isBuffered,
            hasAudioBuffer: !!providerState.elevenlabs.audioBuffer
        },
        cartesia: {
            isBuffered: providerState.cartesia.isBuffered,
            hasAudioBuffer: !!providerState.cartesia.audioBuffer
        },
        deepgram: {
            isBuffered: providerState.deepgram.isBuffered,
            hasAudioBuffer: !!providerState.deepgram.audioBuffer
        }
    });
    
    if (allComplete) {
        // Show play buttons only for providers that successfully buffered
        allProviders.forEach(provider => {
            const state = providerState[provider];
            const playBtn = document.getElementById(`${provider}-play-btn`);
            
            // All providers now use audioBuffer
            const hasAudio = state.isBuffered && state.audioBuffer;
            
            if (playBtn && hasAudio) {
                console.log(`Showing play button for ${provider}`);
                playBtn.style.display = 'block';
            } else if (playBtn) {
                console.log(`Not showing play button for ${provider}:`, {
                    isBuffered: state.isBuffered,
                    hasAudio: hasAudio
                });
            }
            
            // Show/hide download button
            const downloadBtn = document.getElementById(`${provider}-download-btn`);
            if (downloadBtn && hasAudio) {
                console.log(`Showing download button for ${provider}`);
                downloadBtn.style.display = 'block';
            } else if (downloadBtn) {
                downloadBtn.style.display = 'none';
            }
        });
    }
}

// Handle stream error
function handleStreamError(provider, message) {
    const state = providerState[provider];
    state.isStreaming = false;
    state.isBuffering = false;
    updateStatus(provider, `Error: ${message}`);
    console.error(`${provider} error:`, message);
    
    // Still check if all are complete (even with errors)
    checkAllBufferingComplete();
}

// Update TTFA display
function updateTTFADisplay(provider, ttfa) {
    const element = document.getElementById(`${provider}-ttfa`);
    if (element) {
        element.textContent = ttfa;
        element.style.color = '#4caf50';
    }
}

// Update status display
function updateStatus(provider, status) {
    if (provider === 'all') {
        ['elevenlabs', 'cartesia', 'deepgram'].forEach(p => {
            const element = document.getElementById(`${p}-status`);
            if (element) {
                element.textContent = status;
                element.className = 'audio-status';
            }
        });
    } else {
        const element = document.getElementById(`${provider}-status`);
        if (element) {
            element.textContent = status;
            element.className = 'audio-status';
            if (status === 'Streaming...') {
                element.classList.add('streaming');
            } else if (status.startsWith('Error')) {
                element.classList.add('error');
            }
        }
    }
}

// Reset provider state
function resetProviderState() {
    Object.keys(providerState).forEach(provider => {
        const state = providerState[provider];
        state.ttfa = null;
        state.firstChunkReceived = false;
        state.isStreaming = false;
        state.isBuffering = false;
        state.isBuffered = false;
        state.audioChunks = [];
        state.audioBuffer = null;
        
        if (state.sourceNode) {
            try {
                state.sourceNode.stop();
            } catch (e) {
                // Ignore errors when stopping
            }
            state.sourceNode = null;
        }
        
        // Hide play button
        const playBtn = document.getElementById(`${provider}-play-btn`);
        if (playBtn) {
            playBtn.style.display = 'none';
        }
        
        // Hide download button
        const downloadBtn = document.getElementById(`${provider}-download-btn`);
        if (downloadBtn) {
            downloadBtn.style.display = 'none';
        }
        
        // Reset displays
        const ttfaElement = document.getElementById(`${provider}-ttfa`);
        if (ttfaElement) {
            ttfaElement.textContent = '--';
            ttfaElement.style.color = '#667eea';
        }
        
        updateStatus(provider, 'Ready');
    });
}

// Reset a single provider's state (used when voice changes)
function resetSingleProviderState(provider) {
    const state = providerState[provider];
    if (!state) return;
    
    state.ttfa = null;
    state.firstChunkReceived = false;
    state.isStreaming = false;
    state.isBuffering = false;
    state.isBuffered = false;
    state.audioChunks = [];
    state.audioBuffer = null;
    
    if (state.sourceNode) {
        try {
            state.sourceNode.stop();
        } catch (e) {
            // Ignore errors when stopping
        }
        state.sourceNode = null;
    }
    
    // Hide play button
    const playBtn = document.getElementById(`${provider}-play-btn`);
    if (playBtn) {
        playBtn.style.display = 'none';
    }
    
    // Hide download button
    const downloadBtn = document.getElementById(`${provider}-download-btn`);
    if (downloadBtn) {
        downloadBtn.style.display = 'none';
    }
    
    // Reset displays
    const ttfaElement = document.getElementById(`${provider}-ttfa`);
    if (ttfaElement) {
        ttfaElement.textContent = '--';
        ttfaElement.style.color = '#667eea';
    }
    
    updateStatus(provider, 'Voice changed - Click "Start TTS Test" to hear new voice');
}

// Start TTS test
function startTTSTest(text) {
    if (!text || text.trim() === '') {
        alert('Please enter or select text to test');
        return;
    }
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert('WebSocket not connected. Please wait...');
        return;
    }
    
    currentText = text.trim();
    
    // Collect voice IDs from selectors
    const elevenlabsVoice = document.getElementById('elevenlabs-voice')?.value || 'Smxkoz0xiOoHo5WcSskf';
    const cartesiaVoice = document.getElementById('cartesia-voice')?.value || 'f786b574-daa5-4673-aa0c-cbe3e8534c02';
    const deepgramVoice = document.getElementById('deepgram-voice')?.value || 'aura-2-thalia-en';
    const rimeVoice = document.getElementById('rime-voice')?.value || 'astra';
    
    // Reset state
    resetProviderState();
    
    // Record start time for TTFA measurement
    startTime = Date.now();
    
    // Send start message to server with voice IDs
    ws.send(JSON.stringify({
        type: 'start',
        text: currentText,
        voices: {
            elevenlabs: elevenlabsVoice,
            cartesia: cartesiaVoice,
            deepgram: deepgramVoice,
            rime: rimeVoice
        }
    }));
    
    updateStatus('all', 'Starting...');
    
    // Disable start button
    const startBtn = document.getElementById('start-test-btn');
    if (startBtn) {
        startBtn.disabled = true;
        setTimeout(() => {
            startBtn.disabled = false;
        }, 5000); // Re-enable after 5 seconds
    }
}

// Populate challenge dropdown with categorized options
function populateChallengeDropdown() {
    const challengeSelect = document.getElementById('challenge-select');
    if (!challengeSelect) return;
    
    // Clear existing options except the first one
    challengeSelect.innerHTML = '<option value="">Select a challenge...</option>';
    
    // Track challenge number across all categories
    let challengeNumber = 1;
    
    // Add categorized options
    Object.keys(CHALLENGES).forEach(category => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;
        
        CHALLENGES[category].forEach(challenge => {
            const option = document.createElement('option');
            // Value is the original text (without number) - this is what gets sent to TTS
            option.value = challenge.text;
            // Display text includes the number prefix for UI reference only
            option.textContent = `${challengeNumber}. ${challenge.text}`;
            option.title = challenge.description; // Tooltip with description
            optgroup.appendChild(option);
            challengeNumber++;
        });
        
        challengeSelect.appendChild(optgroup);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize WebSocket
    initWebSocket();
    
    // Populate challenge dropdown
    populateChallengeDropdown();
    
    // Challenge select change
    const challengeSelect = document.getElementById('challenge-select');
    const customText = document.getElementById('custom-text');
    const pronunciationGuide = document.getElementById('pronunciation-guide');
    const pronunciationText = document.getElementById('pronunciation-text');
    
    if (challengeSelect) {
        challengeSelect.addEventListener('change', (e) => {
            const selectedText = e.target.value;
            if (selectedText) {
                // Clear and disable custom text when pre-set challenge is selected
                if (customText) {
                    customText.value = '';
                    customText.disabled = true;
                    customText.placeholder = 'Select "Select a challenge..." to use custom text';
                }
                
                // Find the selected challenge and show pronunciation
                let foundChallenge = null;
                for (const category of Object.keys(CHALLENGES)) {
                    foundChallenge = CHALLENGES[category].find(ch => ch.text === selectedText);
                    if (foundChallenge) break;
                }
                
                if (foundChallenge && foundChallenge.pronunciation) {
                    if (pronunciationGuide) {
                        pronunciationGuide.style.display = 'block';
                    }
                    if (pronunciationText) {
                        pronunciationText.textContent = foundChallenge.pronunciation;
                    }
                } else {
                    if (pronunciationGuide) {
                        pronunciationGuide.style.display = 'none';
                    }
                }
            } else {
                // No challenge selected, enable custom text
                if (customText) {
                    customText.disabled = false;
                    customText.placeholder = 'Enter custom alphanumeric text to test...';
                }
                // Hide pronunciation guide
                if (pronunciationGuide) {
                    pronunciationGuide.style.display = 'none';
                }
            }
        });
    }
    
    // Custom text input - clear pre-set challenge when user types
    if (customText) {
        customText.addEventListener('input', (e) => {
            const textValue = e.target.value.trim();
            if (textValue && challengeSelect) {
                // Clear pre-set challenge when custom text is entered
                challengeSelect.value = '';
                // Hide pronunciation guide
                if (pronunciationGuide) {
                    pronunciationGuide.style.display = 'none';
                }
            }
        });
        
        // Also handle focus to provide feedback
        customText.addEventListener('focus', () => {
            if (challengeSelect && challengeSelect.value) {
                // Clear pre-set challenge when user focuses on custom text
                challengeSelect.value = '';
                if (pronunciationGuide) {
                    pronunciationGuide.style.display = 'none';
                }
            }
        });
    }
    
    // Start test button
    const startBtn = document.getElementById('start-test-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const challengeSelect = document.getElementById('challenge-select');
            const customText = document.getElementById('custom-text');
            
            let text = '';
            if (challengeSelect && challengeSelect.value) {
                text = challengeSelect.value;
            } else if (customText && customText.value.trim()) {
                text = customText.value.trim();
            }
            
            startTTSTest(text);
        });
    }
    
    // Play buttons
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const provider = e.target.getAttribute('data-provider');
            playBufferedAudio(provider);
        });
    });
    
    // Download buttons
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const provider = e.target.getAttribute('data-provider');
            downloadAudio(provider);
        });
    });
    
    // Voice selector change handlers - reset provider state when voice changes
    const elevenlabsVoiceSelect = document.getElementById('elevenlabs-voice');
    if (elevenlabsVoiceSelect) {
        elevenlabsVoiceSelect.addEventListener('change', () => {
            resetSingleProviderState('elevenlabs');
        });
    }
    
    const cartesiaVoiceSelect = document.getElementById('cartesia-voice');
    if (cartesiaVoiceSelect) {
        cartesiaVoiceSelect.addEventListener('change', () => {
            resetSingleProviderState('cartesia');
        });
    }
    
    const deepgramVoiceSelect = document.getElementById('deepgram-voice');
    if (deepgramVoiceSelect) {
        deepgramVoiceSelect.addEventListener('change', () => {
            resetSingleProviderState('deepgram');
        });
    }
    
    const rimeVoiceSelect = document.getElementById('rime-voice');
    if (rimeVoiceSelect) {
        rimeVoiceSelect.addEventListener('change', () => {
            resetSingleProviderState('rime');
        });
    }
});

// Download audio as WAV file
function downloadAudio(provider) {
    const state = providerState[provider];
    
    if (!state.audioBuffer) {
        console.error(`No audio buffer available for ${provider}`);
        updateStatus(provider, 'No Audio Available');
        return;
    }
    
    try {
        // Convert AudioBuffer to WAV
        const wav = audioBufferToWav(state.audioBuffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${provider}-audio-${Date.now()}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`Downloaded audio for ${provider}`);
    } catch (error) {
        console.error(`Error downloading audio for ${provider}:`, error);
        updateStatus(provider, 'Download Error');
    }
}

// Convert AudioBuffer to WAV format
function audioBufferToWav(buffer) {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataLength = length * blockAlign;
    const bufferSize = 44 + dataLength;
    
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    // RIFF chunk descriptor
    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true); // Chunk size
    writeString(8, 'WAVE');
    
    // fmt sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Sub-chunk size
    view.setUint16(20, 1, true); // Audio format (1 = PCM)
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true); // Bits per sample
    
    // data sub-chunk
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Convert float32 samples to int16 PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }
    
    return arrayBuffer;
}

