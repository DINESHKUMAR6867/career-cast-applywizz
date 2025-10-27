// class EmailService {
//   async sendOTP(email: string, otp: string): Promise<boolean> {
//     try {
//       const response = await fetch('/api/send-otp', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, otp }),
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         return true;
//       } else {
//         // If email fails, log OTP for development
//         console.log(`📧 OTP for ${email}: ${otp}`);
//         throw new Error(data.message);
//       }
//     } catch (error) {
//       // Fallback - log OTP for development
//       console.log(`📧 OTP for ${email}: ${otp}`);
//       throw new Error('Failed to send OTP. Check console for OTP code.');
//     }
//   }
// }

// export const emailService = new EmailService();
// src/services/emailService.ts

class EmailService {
  /**
   * Sends an OTP to the given email address.
   * Works automatically in both local and Vercel environments.
   */
  async sendOTP(email: string, otp: string): Promise<boolean> {
    try {
      // ✅ Automatically detect base URL
      // In production (Vercel), VITE_API_BASE will be empty → uses same domain
      // In local dev, set VITE_API_BASE=http://localhost:3000 (if running backend separately)
      const API_BASE = import.meta.env.VITE_API_BASE ?? '';

      const response = await fetch(`${API_BASE}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      // Try to parse the JSON response safely
      let data: any;
      try {
        data = await response.json();
      } catch {
        throw new Error('Invalid response from OTP server.');
      }

      // ✅ If backend confirmed success
      if (data?.success) {
        console.log(`✅ OTP sent successfully to ${email}`);
        return true;
      }

      // ❌ If backend returned an error
      console.warn(`⚠️ OTP send failed for ${email}: ${data?.message || 'Unknown error'}`);
      console.log(`📧 OTP for ${email}: ${otp} (logged for testing/dev mode)`);
      throw new Error(data?.message || 'Failed to send OTP.');
    } catch (error: any) {
      // 🔄 Fallback — helpful during local dev without backend
      console.error('❌ Error sending OTP:', error?.message || error);
      console.log(`📧 OTP for ${email}: ${otp} (fallback logged locally)`);
      throw new Error('Failed to send OTP. Check console for OTP code.');
    }
  }
}

export const emailService = new EmailService();
