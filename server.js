require('dotenv').config();


const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Store active WebSocket connections for streaming
const activeConnections = new Map();

// Helper function to generate unique connection IDs
function generateConnectionId() {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * ElevenLabs Flash Streaming TTS via HTTP
 * @param {string} text - Plain text to synthesize
 * @param {string} connectionId - Unique connection identifier
 * @returns {Promise<void>}
 */
async function streamElevenLabsTTS(text, connectionId, voiceId = null) {
  const ws = activeConnections.get(connectionId);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  try {
    // Use provided voice ID or fallback to default (Dexter)
    const selectedVoiceId = voiceId || 'Smxkoz0xiOoHo5WcSskf';
    
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    console.log('\n========== ELEVENLABS API REQUEST ==========');
    console.log('URL:', `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/stream`);
    console.log('Voice ID:', selectedVoiceId);
    console.log('Model:', 'eleven_flash_v2_5');
    console.log('Text Length:', text.length, 'characters');
    console.log('API Key (FULL):', apiKey || 'NOT SET');
    console.log('API Key Length:', apiKey ? apiKey.length : 0);
    console.log('Headers:');
    console.log('  - Accept: audio/mpeg');
    console.log('  - Content-Type: application/json');
    console.log('  - xi-api-key:', apiKey || 'NOT SET');
    console.log('==========================================\n');
    
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/stream`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      data: {
        text: text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: {
          speed: 0.8,
          stability: 0.75,
          similarity_boost: 0.75
        }
      },
      responseType: 'stream',
      validateStatus: () => true // Don't throw on any status, handle manually
    });
    
    // Check if response is an error
    if (response.status < 200 || response.status >= 300) {
      // Collect error response body
      const chunks = [];
      response.data.on('data', (chunk) => chunks.push(chunk));
      response.data.on('end', () => {
        const errorBody = Buffer.concat(chunks).toString();
        console.error('ElevenLabs error response:', errorBody);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            provider: 'elevenlabs',
            type: 'error',
            message: `HTTP ${response.status}: ${errorBody || response.statusText}`
          }));
        }
      });
      return;
    }

    // Stream audio chunks immediately to client
    response.data.on('data', (chunk) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          provider: 'elevenlabs',
          type: 'audio',
          data: chunk.toString('base64')
        }));
      }
    });

    response.data.on('end', () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          provider: 'elevenlabs',
          type: 'done'
        }));
      }
    });

    response.data.on('error', (error) => {
      console.error('ElevenLabs stream error:', error);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          provider: 'elevenlabs',
          type: 'error',
          message: error.message
        }));
      }
    });
  } catch (error) {
    console.error('ElevenLabs streaming error:', error);
    
    // Log detailed error response for debugging
    if (error.response) {
      console.error('ElevenLabs error response status:', error.response.status);
      console.error('ElevenLabs error response headers:', error.response.headers);
      if (error.response.data) {
        // Try to read the error response body
        const chunks = [];
        error.response.data.on('data', (chunk) => chunks.push(chunk));
        error.response.data.on('end', () => {
          const errorBody = Buffer.concat(chunks).toString();
          console.error('ElevenLabs error response body:', errorBody);
        });
      }
    }
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      let errorMessage = 'Unknown error';
      if (error.response) {
        // HTTP error response (401, 404, etc.)
        errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        if (error.response.data) {
          try {
            // For stream responses, we need to collect chunks
            const chunks = [];
            error.response.data.on('data', (chunk) => chunks.push(chunk));
            error.response.data.on('end', () => {
              try {
                const errorBody = Buffer.concat(chunks).toString();
                const errorData = JSON.parse(errorBody);
                errorMessage += ` - ${errorData.message || errorData.detail || errorBody}`;
              } catch (e) {
                errorMessage += ` - ${Buffer.concat(chunks).toString()}`;
              }
            });
          } catch (e) {
            errorMessage += ` - ${error.response.data}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      ws.send(JSON.stringify({
        provider: 'elevenlabs',
        type: 'error',
        message: errorMessage
      }));
    }
  }
}

/**
 * Create a WAV file header for raw PCM audio
 * @param {number} dataLength - Total size of raw PCM audio data in bytes
 * @returns {Buffer} 44-byte WAV header
 */
/**
 * Create a WAV file header for raw PCM audio (32-bit float)
 * @param {number} dataLength - Total size of raw PCM audio data in bytes
 * @returns {Buffer} 44-byte WAV header
 */
function createWavHeader(dataLength) {
  const sampleRate = 24000;
  const numChannels = 1; // Mono
  const bitsPerSample = 32; // 32-bit float PCM
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8); // 24000 * 1 * 4 = 96000
  const blockAlign = numChannels * (bitsPerSample / 8); // 1 * 4 = 4
  
  // WAV file structure:
  // - RIFF header (12 bytes)
  // - fmt chunk (24 bytes)
  // - data chunk (8 bytes + data)
  
  const header = Buffer.alloc(44);
  let offset = 0;
  
  // RIFF chunk descriptor
  header.write('RIFF', offset); offset += 4;
  header.writeUInt32LE(36 + dataLength, offset); offset += 4; // Chunk size
  header.write('WAVE', offset); offset += 4;
  
  // fmt sub-chunk
  header.write('fmt ', offset); offset += 4;
  header.writeUInt32LE(16, offset); offset += 4; // Sub-chunk size (16 for PCM)
  header.writeUInt16LE(3, offset); offset += 2; // Audio format (3 = IEEE float)
  header.writeUInt16LE(numChannels, offset); offset += 2;
  header.writeUInt32LE(sampleRate, offset); offset += 4;
  header.writeUInt32LE(byteRate, offset); offset += 4;
  header.writeUInt16LE(blockAlign, offset); offset += 2;
  header.writeUInt16LE(bitsPerSample, offset); offset += 2;
  
  // data sub-chunk
  header.write('data', offset); offset += 4;
  header.writeUInt32LE(dataLength, offset); offset += 4; // Sub-chunk 2 size
  
  return header;
}

/**
 * Cartesia Sonic Streaming TTS via WebSocket with WAV header wrapping
 * @param {string} text - Plain text to synthesize
 * @param {string} connectionId - Unique connection identifier
 * @returns {Promise<void>}
 */
async function streamCartesiaTTS(text, connectionId, voiceId = null) {
  const ws = activeConnections.get(connectionId);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  try {
    const apiKey = process.env.CARTESIA_API_KEY;
    if (!apiKey) {
      throw new Error('CARTESIA_API_KEY is not set');
    }
    
    // Sanitize connectionId to only contain alphanumeric, underscores, and hyphens
    const sanitizedContextId = connectionId.replace(/[^a-zA-Z0-9_-]/g, '');
    
    // Track total audio bytes
    let totalAudioBytes = 0;
    let cartesiaAudioReceived = false;
    let cartesiaTimeout = null;
    
    // Helper function to send completion messages
    let sentCompletion = false;
    const sendCartesiaCompletion = () => {
      if (cartesiaTimeout) {
        clearTimeout(cartesiaTimeout);
        cartesiaTimeout = null;
      }
      
      if (sentCompletion) return;
      sentCompletion = true;
      
      if (ws.readyState === WebSocket.OPEN && totalAudioBytes > 0) {
        console.log('Cartesia stream complete, total bytes:', totalAudioBytes);
        ws.send(JSON.stringify({
          provider: 'cartesia',
          type: 'done'
        }));
      }
    };
    
    // Cartesia TTS WebSocket endpoint
    const wsUrl = 'wss://api.cartesia.ai/tts/websocket';
    
    console.log('Cartesia WebSocket connection:', {
      url: wsUrl,
      model: 'sonic-3',
      textLength: text.length,
      contextId: sanitizedContextId
    });
    
    const cartesiaWs = new WebSocket(wsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Cartesia-Version': '2024-06-10'
      }
    });

    cartesiaWs.on('open', () => {
      // Send TTS request with raw PCM format
      try {
        const requestPayload = {
          model_id: 'sonic-3',
          transcript: text,
          voice: {
            mode: 'id',
            id: voiceId || 'f786b574-daa5-4673-aa0c-cbe3e8534c02'
          },
          language: 'en',
          output_format: {
            container: 'raw',
            encoding: 'pcm_f32le',
            sample_rate: 24000,
            num_channels: 1
          },
          generation_config: {
            speed: 0.85,
            volume: 1.0,
            emotion: 'neutral'
          },
          context_id: sanitizedContextId
        };
        
        const jsonString = JSON.stringify(requestPayload);
        console.log('Sending Cartesia request:', jsonString);
        
        // Send request to Cartesia
        cartesiaWs.send(jsonString);
      } catch (sendError) {
        console.error('Error sending text to Cartesia:', sendError);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            provider: 'cartesia',
            type: 'error',
            message: `Failed to send text: ${sendError.message}`
          }));
        }
      }
    });

    cartesiaWs.on('message', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        // Per Cartesia API spec: all messages are JSON text (not binary)
        // Convert to string if needed (WebSocket library may give us Buffer)
        let messageStr = null;
        if (Buffer.isBuffer(data)) {
          messageStr = data.toString('utf8');
        } else if (typeof data === 'string') {
          messageStr = data;
        } else if (data instanceof ArrayBuffer) {
          messageStr = Buffer.from(data).toString('utf8');
        } else {
          console.warn('Cartesia: Unexpected message type:', typeof data);
          return;
        }
        
        // Parse JSON message per API spec
        try {
          const message = JSON.parse(messageStr);
          
          // Handle different message types per API spec
          if (message.type === 'done' && message.done === true) {
            // Done Response: {"type": "done", "done": true, ...}
            console.log('Cartesia stream complete via done message');
            sendCartesiaCompletion();
            return;
          }
          
          if (message.type === 'flush_done') {
            // Flush Done Response: {"type": "flush_done", "flush_done": true, ...}
            console.log('Cartesia flush done received');
            // Continue waiting for more chunks or done message
            return;
          }
          
          if (message.type === 'timestamps') {
            // Word Timestamps Response: {"type": "timestamps", "word_timestamps": {...}, ...}
            console.log('Cartesia timestamps received (ignoring for now)');
            return;
          }
          
          if (message.error || (message.type && message.type.includes('error'))) {
            // Error Response: {"type": "<string>", "error": "<string>", ...}
            console.error('Cartesia error message:', message);
            if (cartesiaTimeout) {
              clearTimeout(cartesiaTimeout);
            }
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                provider: 'cartesia',
                type: 'error',
                message: message.error || message.message || JSON.stringify(message)
              }));
            }
            return;
          }
          
          // Audio Chunk Response: {"type": "chunk", "data": "<base64>", "done": false, ...}
          if (message.type === 'chunk' && message.data) {
            try {
              // Extract base64-encoded audio data from "data" field
              const audioDataBase64 = message.data;
              
              // Decode base64 to get raw PCM bytes
              const audioBuffer = Buffer.from(audioDataBase64, 'base64');
              
              if (audioBuffer.length > 0) {
                cartesiaAudioReceived = true;
                totalAudioBytes += audioBuffer.length;
                console.log('Cartesia chunk: decoded audio size:', audioBuffer.length, 'bytes, total:', totalAudioBytes, 'bytes');
                
                // Validate first chunk - inspect decoded bytes
                if (totalAudioBytes === audioBuffer.length) {
                  // First chunk - validate format
                  const firstBytes = audioBuffer.slice(0, Math.min(64, audioBuffer.length));
                  const hexPreview = Array.from(firstBytes.slice(0, 32)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ');
                  const asciiPreview = firstBytes.slice(0, 32).toString('ascii').replace(/[^\x20-\x7E]/g, '.');
                  
                  console.log('Cartesia first chunk validation:');
                  console.log('  Hex (first 32 bytes):', hexPreview);
                  console.log('  ASCII (first 32 bytes):', asciiPreview);
                  
                  // Check for container formats
                  const first4Bytes = firstBytes.toString('ascii', 0, 4);
                  if (first4Bytes === 'RIFF') {
                    console.warn('  ⚠️  Detected WAV container (RIFF header) - not raw PCM!');
                  } else if (firstBytes.toString('ascii', 0, 3) === 'ID3') {
                    console.warn('  ⚠️  Detected MP3 container (ID3 header) - not raw PCM!');
                  } else {
                    console.log('  ✓ Appears to be raw PCM (no container header)');
                    // For float32 PCM, check if first sample is reasonable
                    if (audioBuffer.length >= 4) {
                      const dv = new DataView(audioBuffer.buffer, audioBuffer.byteOffset, 4);
                      const firstSample = dv.getFloat32(0, true);
                      console.log('  First float32 sample:', firstSample, '(should be between -1.0 and 1.0)');
                      if (Math.abs(firstSample) > 10) {
                        console.warn('  ⚠️  First sample is out of normal range - may indicate format mismatch');
                      }
                    }
                  }
                }
                
                // Clear timeout
                if (cartesiaTimeout) {
                  clearTimeout(cartesiaTimeout);
                }
                
                // Send decoded PCM bytes to client
                ws.send(JSON.stringify({
                  provider: 'cartesia',
                  type: 'audio',
                  data: audioBuffer.toString('base64')
                }));
                
                // Set timeout to detect end of stream
                cartesiaTimeout = setTimeout(() => {
                  console.log('Cartesia stream timeout - no more data for 1s, assuming complete');
                  sendCartesiaCompletion();
                }, 1000);
              } else {
                console.warn('Cartesia chunk: decoded audio buffer is empty');
              }
            } catch (audioError) {
              console.error('Cartesia: Error decoding audio from chunk:', audioError);
              console.error('Data field preview:', message.data ? message.data.substring(0, 100) : 'null');
            }
            return;
          }
          
          // Unknown message type - log for debugging
          console.log('Cartesia unknown message type:', message.type || 'none');
          console.log('Message keys:', Object.keys(message));
          console.log('Full message:', JSON.stringify(message, null, 2).substring(0, 300));
          
        } catch (e) {
          // Not valid JSON - this shouldn't happen per API spec
          console.error('Cartesia: Message is not valid JSON:', e.message);
          console.error('Message preview:', messageStr.substring(0, 200));
        }
      } else {
        console.warn('Cartesia message received but client WebSocket not open, readyState:', ws.readyState);
      }
    });

    cartesiaWs.on('error', (error) => {
      console.error('Cartesia WebSocket error:', error);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          provider: 'cartesia',
          type: 'error',
          message: error.message || 'WebSocket connection failed'
        }));
      }
    });

    cartesiaWs.on('close', (code, reason) => {
      console.log('Cartesia WebSocket closed, code:', code, 'reason:', reason?.toString());
      console.log('Total audio bytes received:', totalAudioBytes);
      
      // Clear timeout if still active
      if (cartesiaTimeout) {
        clearTimeout(cartesiaTimeout);
        cartesiaTimeout = null;
      }
      
      // Only send completion if we haven't already sent it and we have audio
      if (ws.readyState === WebSocket.OPEN && cartesiaAudioReceived && totalAudioBytes > 0) {
        sendCartesiaCompletion();
      } else {
        console.warn('Client WebSocket not open or no audio received, cannot send final header and done message');
      }
    });
  } catch (error) {
    console.error('Cartesia streaming error:', error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        provider: 'cartesia',
        type: 'error',
        message: error.message || 'Unknown error'
      }));
    }
  }
}

/**
 * Deepgram Aura-2 Streaming TTS via WebSocket
 * @param {string} text - Plain text to synthesize
 * @param {string} connectionId - Unique connection identifier
 * @returns {Promise<void>}
 */
async function streamDeepgramTTS(text, connectionId, model = null) {
  const ws = activeConnections.get(connectionId);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY is not set');
    }
    
    // Track audio bytes
    let totalAudioBytes = 0;
    let deepgramAudioReceived = false;
    let deepgramTimeout = null;
    let deepgramRequestId = null;
    
    // Helper function to send completion
    let sentCompletion = false;
    const sendDeepgramCompletion = () => {
      if (deepgramTimeout) {
        clearTimeout(deepgramTimeout);
        deepgramTimeout = null;
      }
      
      if (sentCompletion) return;
      sentCompletion = true;
      
      if (ws.readyState === WebSocket.OPEN && totalAudioBytes > 0) {
        console.log('Deepgram stream complete, total bytes:', totalAudioBytes);
        ws.send(JSON.stringify({
          provider: 'deepgram',
          type: 'done'
        }));
      }
    };
    
    // Deepgram WebSocket endpoint with query parameters
    const selectedModel = model || 'aura-2-thalia-en';
    const encoding = 'linear16'; // 16-bit PCM
    const sampleRate = '24000';
    const wsUrl = `wss://api.deepgram.com/v1/speak?model=${selectedModel}&encoding=${encoding}&sample_rate=${sampleRate}`;
    
    // Comprehensive API request logging
    console.log('\n========== DEEPGRAM API REQUEST ==========');
    console.log('WebSocket URL:', wsUrl);
    console.log('Full URL Breakdown:');
    console.log('  - Protocol: wss://');
    console.log('  - Host: api.deepgram.com');
    console.log('  - Path: /v1/speak');
    console.log('  - Query Parameters:');
    console.log('    * model:', selectedModel);
    console.log('    * encoding:', encoding);
    console.log('    * sample_rate:', sampleRate);
    console.log('Authentication Method: Sec-WebSocket-Protocol subprotocol');
    console.log('  - Subprotocol: ["token", API_KEY]');
    console.log('  - API Key (masked):', apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT SET');
    console.log('Request Payload:');
    console.log('  - Text to synthesize:', text);
    console.log('  - Text length:', text.length, 'characters');
    console.log('Messages to send:');
    console.log('  1. {"type": "Speak", "text": "' + text.substring(0, 50) + (text.length > 50 ? '...' : '') + '"}');
    console.log('  2. {"type": "Flush"}');
    console.log('Note: Request ID will be received in Metadata response');
    console.log('==========================================\n');
    
    // Deepgram requires API key via Sec-WebSocket-Protocol subprotocol, not Authorization header
    // Format: ['token', API_KEY]
    const deepgramWs = new WebSocket(wsUrl, ['token', apiKey]);
    
    deepgramWs.on('open', () => {
      console.log('Deepgram WebSocket opened');
      
      // Send text message: {"type": "Speak", "text": "..."}
      const textMessage = {
        type: 'Speak',
        text: text
      };
      
      console.log('Sending Deepgram text message:', JSON.stringify(textMessage, null, 2));
      deepgramWs.send(JSON.stringify(textMessage));
      
      // Send flush message to get final audio: {"type": "Flush"}
      const flushMessage = {
        type: 'Flush'
      };
      console.log('Sending Deepgram flush message:', JSON.stringify(flushMessage, null, 2));
      deepgramWs.send(JSON.stringify(flushMessage));
    });
    
    deepgramWs.on('message', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        // Deepgram sends both binary audio and JSON metadata
        if (Buffer.isBuffer(data) || data instanceof ArrayBuffer) {
          // Binary audio chunk (linear16 PCM)
          const audioBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
          const dataLength = audioBuffer.length;
          
          deepgramAudioReceived = true;
          totalAudioBytes += dataLength;
          console.log('Deepgram PCM chunk received (binary), size:', dataLength, 'bytes, total:', totalAudioBytes, 'bytes');
          
          // Clear timeout
          if (deepgramTimeout) {
            clearTimeout(deepgramTimeout);
          }
          
          // Send binary PCM chunk to client
          ws.send(JSON.stringify({
            provider: 'deepgram',
            type: 'audio',
            data: audioBuffer.toString('base64')
          }));
          
          // Set timeout to detect end of stream
          deepgramTimeout = setTimeout(() => {
            console.log('Deepgram stream timeout - no more data for 1s, assuming complete');
            sendDeepgramCompletion();
          }, 1000);
          
        } else if (typeof data === 'string') {
          // JSON metadata message
          console.log('\n========== DEEPGRAM JSON MESSAGE RECEIVED ==========');
          console.log('Raw message (first 500 chars):', data.substring(0, 500));
          console.log('Message length:', data.length);
          
          try {
            const message = JSON.parse(data);
            console.log('Parsed message type:', message.type);
            console.log('Full parsed message:', JSON.stringify(message, null, 2));
            
            // Handle different message types per spec
            if (message.type === 'Metadata') {
              deepgramRequestId = message.request_id;
              console.log('\n========== DEEPGRAM METADATA RECEIVED ==========');
              console.log('Request ID:', message.request_id);
              console.log('Model Name:', message.model_name);
              console.log('Model Version:', message.model_version);
              console.log('Full metadata:', JSON.stringify(message, null, 2));
              console.log('==========================================\n');
              // Metadata - just log it, continue
              
            } else if (message.type === 'Flushed') {
              console.log('\n========== DEEPGRAM FLUSHED ==========');
              console.log('Sequence ID:', message.sequence_id);
              console.log('Full message:', JSON.stringify(message, null, 2));
              console.log('==========================================\n');
              // Flushed - stream is complete
              sendDeepgramCompletion();
              
            } else if (message.type === 'Cleared') {
              console.log('\n========== DEEPGRAM CLEARED ==========');
              console.log('Sequence ID:', message.sequence_id);
              console.log('Full message:', JSON.stringify(message, null, 2));
              console.log('==========================================\n');
              // Cleared - buffer cleared, continue
              
            } else if (message.type === 'Warning') {
              console.warn('\n========== DEEPGRAM WARNING ==========');
              console.warn('Description:', message.description);
              console.warn('Code:', message.code);
              console.warn('Full message:', JSON.stringify(message, null, 2));
              console.warn('==========================================\n');
              // Warning - log but continue
              
            } else {
              console.log('\n========== DEEPGRAM UNKNOWN MESSAGE TYPE ==========');
              console.log('Type:', message.type);
              console.log('Full message:', JSON.stringify(message, null, 2));
              console.log('==========================================\n');
            }
          } catch (e) {
            console.error('\n========== DEEPGRAM JSON PARSE ERROR ==========');
            console.error('Error:', e.message);
            console.error('Raw message (first 500 chars):', data.substring(0, 500));
            console.error('Message length:', data.length);
            console.error('==========================================\n');
          }
          console.log('==========================================\n');
        }
      } else {
        console.warn('Deepgram message received but client WebSocket not open, readyState:', ws.readyState);
      }
    });
    
    deepgramWs.on('error', (error) => {
      console.error('Deepgram WebSocket error:', error);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          provider: 'deepgram',
          type: 'error',
          message: error.message || 'WebSocket connection failed'
        }));
      }
    });
    
    deepgramWs.on('close', (code, reason) => {
      console.log('Deepgram WebSocket closed, code:', code, 'reason:', reason?.toString());
      console.log('Total audio bytes received:', totalAudioBytes);
      
      // Clear timeout if still active
      if (deepgramTimeout) {
        clearTimeout(deepgramTimeout);
        deepgramTimeout = null;
      }
      
      // Send completion if we have audio
      if (ws.readyState === WebSocket.OPEN && deepgramAudioReceived && totalAudioBytes > 0) {
        sendDeepgramCompletion();
      }
    });
  } catch (error) {
    console.error('Deepgram streaming error:', error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        provider: 'deepgram',
        type: 'error',
        message: error.message || 'Unknown error'
      }));
    }
  }
}

/**
 * Rime Mist v2 Streaming TTS via WebSocket
 * @param {string} text - Plain text to synthesize
 * @param {string} connectionId - Unique connection identifier
 * @param {string} speaker - Speaker/voice ID (default: 'astra')
 * @returns {Promise<void>}
 */
async function streamRimeTTS(text, connectionId, speaker = null) {
  const ws = activeConnections.get(connectionId);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  try {
    const apiKey = process.env.RIME_API_KEY;
    if (!apiKey) {
      throw new Error('RIME_API_KEY is not set');
    }
    
    // Debug: Log API key status (masked)
    console.log('Rime API Key loaded:', apiKey ? `✓ (${apiKey.substring(0, 8)}...)` : '✗');
    
    const selectedSpeaker = speaker || 'astra';
    
    // Track audio bytes
    let totalAudioBytes = 0;
    let rimeAudioReceived = false;
    
    // Helper function to send completion
    let sentCompletion = false;
    const sendRimeCompletion = () => {
      if (sentCompletion) return;
      sentCompletion = true;
      
      if (ws.readyState === WebSocket.OPEN && totalAudioBytes > 0) {
        console.log('Rime stream complete, total bytes:', totalAudioBytes);
        ws.send(JSON.stringify({
          provider: 'rime',
          type: 'done'
        }));
      }
    };
    
    // Rime WebSocket endpoint with query parameters (Mist v2 plaintext API)
    // segment=immediate: start generating audio immediately instead of waiting for full sentences
    // audioFormat=pcm: request raw PCM audio bytes instead of MP3
    const wsUrl = `wss://users.rime.ai/ws` +
      `?speaker=${selectedSpeaker}` +
      `&modelId=mistv2` +
      `&audioFormat=pcm` +
      `&samplingRate=24000` +
      `&segment=immediate`;
    
    console.log('Rime WebSocket connection:', {
      url: wsUrl,
      speaker: selectedSpeaker,
      modelId: 'mistv2',
      audioFormat: 'pcm',
      samplingRate: 24000,
      segment: 'immediate',
      textLength: text.length
    });
    
    // Rime uses Bearer token in Authorization header (same as Python example)
    const rimeWs = new WebSocket(wsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    rimeWs.on('open', () => {
      console.log('Rime WebSocket connected');
      
      // Send text as bare text (not JSON)
      // Send text in chunks and then <EOS> to end
      rimeWs.send(text);
      rimeWs.send('<EOS>');
      
      console.log('Rime text sent, waiting for audio...');
    });
    
    rimeWs.on('message', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        if (Buffer.isBuffer(data) || data instanceof ArrayBuffer) {
          // Binary audio data (MP3 format)
          rimeAudioReceived = true;
          totalAudioBytes += data.length;
          
          console.log('Rime PCM chunk received, size:', data.length, 'bytes, total:', totalAudioBytes, 'bytes');
          
          // Send binary audio chunk to client (base64 encoded)
          ws.send(JSON.stringify({
            provider: 'rime',
            type: 'audio',
            data: Buffer.from(data).toString('base64')
          }));
        } else {
          console.log('Rime received non-binary message:', data);
        }
      }
    });
    
    rimeWs.on('error', (error) => {
      console.error('=== Rime WebSocket Error ===');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      console.error('Target URL:', wsUrl);
      console.error('API Key prefix:', apiKey ? apiKey.substring(0, 8) + '...' : 'NOT SET');
      console.error('HTTP 401 Unauthorized - Possible issues:');
      console.error('  1. Invalid API key format');
      console.error('  2. API key not authorized for this endpoint');
      console.error('  3. Incorrect Authorization header format');
      console.error('===============================');
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          provider: 'rime',
          type: 'error',
          message: error.message || 'WebSocket connection failed'
        }));
      }
    });
    
    rimeWs.on('close', (code, reason) => {
      console.log('Rime WebSocket closed, code:', code, 'reason:', reason?.toString());
      console.log('Total audio bytes received:', totalAudioBytes);
      
      // Send completion if we have audio
      if (ws.readyState === WebSocket.OPEN && rimeAudioReceived && totalAudioBytes > 0) {
        sendRimeCompletion();
      } else if (ws.readyState === WebSocket.OPEN && !rimeAudioReceived) {
        // No audio received, send error
        ws.send(JSON.stringify({
          provider: 'rime',
          type: 'error',
          message: 'No audio received from Rime'
        }));
      }
    });
  } catch (error) {
    console.error('Rime streaming error:', error);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        provider: 'rime',
        type: 'error',
        message: error.message || 'Unknown error'
      }));
    }
  }
}

// WebSocket connection handler for streaming TTS
wss.on('connection', (ws) => {
  const connectionId = generateConnectionId();
  activeConnections.set(connectionId, ws);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'start' && data.text) {
        const text = data.text;
        const voices = data.voices || {};
        const enabledProviders = data.enabledProviders || {
          elevenlabs: true,
          deepgram: true,
          cartesia: true,
          rime: true
        };
        
        // Build array of streaming promises for enabled providers only
        const streamingPromises = [];
        
        // Always stream ElevenLabs and Deepgram
        streamingPromises.push(streamElevenLabsTTS(text, connectionId, voices.elevenlabs));
        streamingPromises.push(streamDeepgramTTS(text, connectionId, voices.deepgram));
        
        // Conditionally stream optional providers
        if (enabledProviders.cartesia && voices.cartesia) {
          streamingPromises.push(streamCartesiaTTS(text, connectionId, voices.cartesia));
        }
        
        if (enabledProviders.rime && voices.rime) {
          streamingPromises.push(streamRimeTTS(text, connectionId, voices.rime));
        }
        
        // Start streaming from enabled providers concurrently
        Promise.all(streamingPromises).catch(err => {
          console.error('Error starting TTS streams:', err);
        });
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    activeConnections.delete(connectionId);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    activeConnections.delete(connectionId);
  });

  // Send connection ID to client
  ws.send(JSON.stringify({
    type: 'connected',
    connectionId: connectionId
  }));
});

// Analytics endpoint for logging verdicts
app.post('/api/log-verdict', (req, res) => {
  const { provider, text, verdict, ttfa } = req.body;
  
  console.log('=== TTS Comparison Verdict ===');
  console.log(`Provider: ${provider}`);
  console.log(`Text: ${text}`);
  console.log(`Verdict: ${verdict}`);
  console.log(`TTFA: ${ttfa}ms`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('==============================\n');
  
  res.json({ success: true });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    providers: {
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      cartesia: !!process.env.CARTESIA_API_KEY,
      deepgram: !!process.env.DEEPGRAM_API_KEY,
      rime: !!process.env.RIME_API_KEY,
      openai: !!process.env.OPENAI_API_KEY
    }
  });
});

// Generate random challenge using OpenAI
app.post('/api/generate-random-challenge', async (req, res) => {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    return res.status(500).json({ 
      error: 'OpenAI API key not configured' 
    });
  }

  try {
    // Sample challenges from each category to guide the AI
    const sampleChallenges = [
      { category: 'ADDRESSES', example: 'Your delivery address is 123 Pine St., Springfield, IL 62704.' },
      { category: 'MIXED ALPHANUMERIC IDENTIFIERS', example: 'Your case ID is F0L1X0E.' },
      { category: 'SKUs / PRODUCT CODES', example: 'The part number you requested is 326DART4.' },
      { category: 'TRACKING & LOGISTICS CODES', example: 'Your UPS tracking number is 1Z9999E90000000057.' },
      { category: 'NUMERIC FORMATS', example: 'Your total today is $12.99.' },
      { category: 'URLs / EMAILS / FILES', example: 'You can access the documentation at dg.com/API_v2.' },
      { category: 'TECHNICAL CODES', example: 'You\'re currently running version v3.5 SP1.' }
    ];

    // Randomly select a category
    const selectedCategory = sampleChallenges[Math.floor(Math.random() * sampleChallenges.length)];

    const prompt = `Generate a text-to-speech challenge sentence similar to this example from the "${selectedCategory.category}" category:

Example: "${selectedCategory.example}"

Requirements:
1. Create a sentence that contains alphanumeric characters, numbers, codes, or identifiers that are challenging for TTS systems
2. The sentence should be natural and conversational (like customer service or system messages)
3. Include the expected pronunciation guide showing how numbers, letters, and special characters should be spoken
4. Format your response as JSON with two fields: "text" (the challenge sentence) and "pronunciation" (comma-separated pronunciation guide)

Example format:
{
  "text": "Your tracking number is 1Z9999E90000000057.",
  "pronunciation": "one, Z, nine, nine, nine, nine, E, nine, zero, zero, zero, zero, zero, zero, zero, zero, five, seven"
}

Generate a NEW challenge (different from the example) in the same style:`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates text-to-speech evaluation challenges. Always respond with VALID JSON ONLY, with no additional commentary or text outside the JSON.\n\nYour job is to generate realistic, conversational challenge sentences that include complex alphanumeric elements commonly encountered in customer-service or enterprise scenarios.\n\nThe generated challenge must be compatible with ANY of the following categories:\n\n1. Mixed Alphanumeric Identifiers (e.g., F0L1X0E, O30DV87, A1B2C3D4)\n2. SKUs / Product Codes (e.g., 326DART4, AB-4500, V3.2L)\n3. Tracking & Logistics Numbers (e.g., 1Z9999E90000000057, DT120034567890, TX-790-B4)\n4. Financial & Numeric Formats (currency amounts, routing numbers, account numbers, percentages)\n5. Addresses (full addresses with street names, ordinals, directionals, units, cities, states, ZIP/postal codes)\n6. URLs, Emails, API Paths, and Filenames (e.g., support.dg.com/v3/login, help@barclays.co.uk, Invoice_2024-07-15.csv)\n7. Technical Codes (software versions, build numbers, chemical formulas, classification codes)\n8. Phone Numbers & Extensions\n\nEach response must:\n- Contain a single JSON object with two fields:\n    • "text": a natural-sounding sentence that includes one or more alphanumeric expressions.\n    • "pronunciation": a comma-separated pronunciation guide showing EXACTLY how a human would speak the alphanumeric expression(s).\n\nPRONUNCIATION RULES:\n• Letters are spoken individually (e.g., "A", "B", "C")\n• Digits are spoken individually ("one", "zero", "five")\n• Hyphens in identifiers (codes, SKUs, tracking numbers, filenames, version strings, URLs) are spoken as "dash"\n• Hyphens in natural-language numbers (dates, phone numbers, addresses) are NOT spoken\n• Underscores → "underscore"\n• Periods → "dot"\n• Slashes → "slash"\n• @ → "at"\n• + in emails or identifiers → "plus"\n• Postal codes spoken digit-by-digit\n• Addresses must be spoken naturally ("one twenty-three Pine Street, Springfield, Illinois")\n• Currency amounts must use units ("twelve dollars and ninety-nine cents", "eighteen euros and fifty cents", "one pound and twenty-five pence", "five point seven million dollars")\n• Percentages must end with "percent"\n\nRESPONSE FORMAT:\n{\n  "text": "<sentence>",\n  "pronunciation": "<spoken form>"\n}\n\nGenerate one NEW challenge per request.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content.trim();
    
    // Parse the JSON response
    let challengeData;
    try {
      // Sometimes the response might be wrapped in markdown code blocks
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      challengeData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw response:', aiResponse);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        details: aiResponse
      });
    }

    // Validate the response has required fields
    if (!challengeData.text || !challengeData.pronunciation) {
      return res.status(500).json({ 
        error: 'Invalid response format from AI',
        details: challengeData
      });
    }

    res.json({
      text: challengeData.text,
      pronunciation: challengeData.pronunciation,
      category: selectedCategory.category
    });

  } catch (error) {
    console.error('Error generating random challenge:', error);
    res.status(500).json({ 
      error: 'Failed to generate random challenge',
      details: error.response?.data || error.message
    });
  }
});

// Generate pronunciation for custom text using OpenAI
app.post('/api/generate-pronunciation', async (req, res) => {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const { text } = req.body;
  
  if (!openaiApiKey) {
    return res.status(500).json({ 
      error: 'OpenAI API key not configured' 
    });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ 
      error: 'Text is required' 
    });
  }

  try {
    const prompt = `Given the following text, provide the expected pronunciation guide showing EXACTLY how a human would speak the alphanumeric expression(s) in the text.

Text: "${text.trim()}"

Respond with a JSON object containing only the "pronunciation" field (you can omit the "text" field since we already have it).`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates text-to-speech evaluation challenges and pronunciation guides. Always respond with VALID JSON ONLY, with no additional commentary or text outside the JSON.\n\nYour job is to generate realistic, conversational challenge sentences that include complex alphanumeric elements commonly encountered in customer-service or enterprise scenarios.\n\nThe generated challenge must be compatible with ANY of the following categories:\n\n1. Mixed Alphanumeric Identifiers (e.g., F0L1X0E, O30DV87, A1B2C3D4)\n2. SKUs / Product Codes (e.g., 326DART4, AB-4500, V3.2L)\n3. Tracking & Logistics Numbers (e.g., 1Z9999E90000000057, DT120034567890, TX-790-B4)\n4. Financial & Numeric Formats (currency amounts, routing numbers, account numbers, percentages)\n5. Addresses (full addresses with street names, ordinals, directionals, units, cities, states, ZIP/postal codes)\n6. URLs, Emails, API Paths, and Filenames (e.g., support.dg.com/v3/login, help@barclays.co.uk, Invoice_2024-07-15.csv)\n7. Technical Codes (software versions, build numbers, chemical formulas, classification codes)\n8. Phone Numbers & Extensions\n\nEach response must:\n- Contain a single JSON object with two fields:\n    • "text": a natural-sounding sentence that includes one or more alphanumeric expressions.\n    • "pronunciation": a comma-separated pronunciation guide showing EXACTLY how a human would speak the alphanumeric expression(s).\n\nPRONUNCIATION RULES:\n• Letters are spoken individually (e.g., "A", "B", "C")\n• Digits are spoken individually ("one", "zero", "five")\n• Hyphens in identifiers (codes, SKUs, tracking numbers, filenames, version strings, URLs) are spoken as "dash"\n• Hyphens in natural-language numbers (dates, phone numbers, addresses) are NOT spoken\n• Underscores → "underscore"\n• Periods → "dot"\n• Slashes → "slash"\n• @ → "at"\n• + in emails or identifiers → "plus"\n• Postal codes spoken digit-by-digit\n• Addresses must be spoken naturally ("one twenty-three Pine Street, Springfield, Illinois")\n• Currency amounts must use units ("twelve dollars and ninety-nine cents", "eighteen euros and fifty cents", "one pound and twenty-five pence", "five point seven million dollars")\n• Percentages must end with "percent"\n\nRESPONSE FORMAT:\n{\n  "text": "<sentence>",\n  "pronunciation": "<spoken form>"\n}\n\nWhen generating pronunciation for existing text, you may omit the "text" field and only return "pronunciation".'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content.trim();
    let result;
    
    // Try to parse JSON (handle cases where it's wrapped in markdown code blocks)
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      // Try extracting JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Invalid JSON response from OpenAI');
      }
    }

    if (!result.pronunciation) {
      throw new Error('Missing pronunciation field in response');
    }

    console.log('Pronunciation generated for custom text:', result);
    res.json(result);
  } catch (error) {
    console.error('Error generating pronunciation:', error);
    if (error.response) {
      res.status(error.response.status || 500).json({ 
        error: error.response.data?.error?.message || 'Failed to generate pronunciation' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate pronunciation' 
      });
    }
  }
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('API Keys Status:');
  console.log(`  ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? '✓' : '✗'}`);
  console.log(`  Cartesia: ${process.env.CARTESIA_API_KEY ? '✓' : '✗'}`);
  console.log(`  Deepgram: ${process.env.DEEPGRAM_API_KEY ? '✓' : '✗'}`);
  console.log(`  Rime: ${process.env.RIME_API_KEY ? '✓' : '✗'}`);
  console.log(`  OpenAI: ${process.env.OPENAI_API_KEY ? '✓' : '✗'}`);
});

