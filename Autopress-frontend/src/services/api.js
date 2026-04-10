// src/services/api.js
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get Firebase token
const getToken = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }
  return null;
};

// Helper function to handle responses
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
    if (contentType && contentType.includes("text/html")) {
      throw new Error(`Server error (${response.status}). Backend may not be running.`);
    }
    try {
      const error = await response.json();
      throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
    } catch (e) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
  }
  
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  
  if (contentType && contentType.includes("application/pdf")) {
    return response.blob();
  }
  
  return response;
};

const api = {
  // Export BASE_URL for use in other files
  BASE_URL: API_URL,

  // ============================================================
  // AUTH & HEALTH
  // ============================================================
  
  async healthCheck() {
    const response = await fetch(`${API_URL}/health`);
    return handleResponse(response);
  },

  // ============================================================
  // FAYDA ENDPOINTS
  // ============================================================

  async extractImageData(frontImage, backImage, profileImage, options = {}) {
    const formData = new FormData();
    formData.append('front_image', frontImage);
    formData.append('back_image', backImage);
    formData.append('photo_qr_image', profileImage);

    const response = await fetch(`${API_URL}/extract-image-data`, {
      method: 'POST',
      body: formData,
    });
    
    const result = await handleResponse(response);
    
    if (result.status === 'extracted' && result.data) {
      return {
        ...result.data.extracted_texts,
        profile_image: result.data.profile_image,
        qr_image: result.data.qr_image
      };
    }
    return result;
  },

  async addToQueue(jobData) {
    const token = await getToken();
    const response = await fetch(`${API_URL}/add-to-queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  },

  async getJobStatus(jobId) {
    const token = await getToken();
    const response = await fetch(`${API_URL}/queue-status/${jobId}`, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    const result = await handleResponse(response);
    
    if (result.status === 'success') {
      return {
        status: result.job_status,
        job_id: result.job_id,
        error: result.error
      };
    }
    return result;
  },

  async getGeneratedPDF(jobId) {
    const token = await getToken();
    const response = await fetch(`${API_URL}/process-queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ job_id: jobId }),
    });
    return response.blob();
  },

  async generatePDF(cardsData) {
    const token = await getToken();
    const response = await fetch(`${API_URL}/generate-final-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ cards: cardsData }),
    });
    return response.blob();
  },

  // Process photo (background removal + grayscale)
  async processPhoto(profileImage, removeBg, grayscale) {
    const token = await getToken();
    
    // Remove the base64 prefix if present
    let imageData = profileImage;
    if (profileImage && profileImage.includes(',')) {
      imageData = profileImage.split(',')[1];
    }
    
    const response = await fetch(`${API_URL}/process-photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        profile_image: imageData,
        remove_bg: removeBg,
        grayscale: grayscale
      }),
    });
    
    return handleResponse(response);
  },

  // Extract data from PDFs (for PDF Mode)
  async extractPdfsData(pdfFiles) {
    const token = await getToken();
    const formData = new FormData();
    
    pdfFiles.forEach((file, index) => {
      formData.append(`pdf_${index + 1}`, file);
    });
    
    const response = await fetch(`${API_URL}/extract-pdfs-data`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    
    const result = await handleResponse(response);
    
    // Transform response to expected format
    if (result.status === 'success' && result.results) {
      return {
        cards: result.results.map(r => ({
          extracted_texts: r.extracted_texts,
          profile_image: r.profile_image,
          qr_image: r.qr_image
        }))
      };
    }
    return result;
  },

  // Process PDF template (direct PDF generation with options)
  async processPdfTemplate(pdfFiles, colorProfile, removeBg) {
    const token = await getToken();
    const formData = new FormData();
    
    pdfFiles.forEach((file, index) => {
      formData.append(`pdf_${index + 1}`, file);
    });
    formData.append('color_profile', colorProfile);
    formData.append('remove_bg', removeBg);
    
    const response = await fetch(`${API_URL}/process-pdf-template`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    
    if (response.headers.get('content-type')?.includes('application/pdf')) {
      return response.blob();
    }
    return handleResponse(response);
  },

  // ============================================================
  // WEDDING ENDPOINTS
  // ============================================================

  async getWeddingTemplates() {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/wedding/wedding/templates`, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return handleResponse(response);
  },

  async generateWeddingCard(templateId, quantity, language, formData) {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/wedding/wedding/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        template_id: templateId,
        quantity: quantity,
        language: language,
        form_data: formData,
      }),
    });
    
    if (response.headers.get('content-type')?.includes('application/pdf')) {
      return response.blob();
    }
    return handleResponse(response);
  },

  async getWeddingJobs() {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/wedding/wedding/my-jobs`, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return handleResponse(response);
  },
};

export default api;