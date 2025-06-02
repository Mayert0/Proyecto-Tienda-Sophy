// src/services/emailService.js
export const emailService = {
  sendEmail: async (emailData) => {
    const response = await api.post('/Proyec/mail/sendMail', emailData);
    return response.data;
  },

  sendEmailWithAttachment: async (emailData) => {
    const response = await api.post('/Proyec/mail/sendMailWithAttachment', emailData);
    return response.data;
  }
};