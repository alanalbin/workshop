import { Registration, EventConfig } from '@/types';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

export const EmailService = {
  async sendRegistrationReceivedEmail(registration: Registration, event: EventConfig): Promise<boolean> {
    const subject = `Registration Received: From Problem to Possibility Workshop`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0614; color: #f8fafc; padding: 32px; border-radius: 12px; border: 1px solid #f59e0b40;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #fbbf24; margin: 0; font-size: 26px; letter-spacing: 1px;">FROM PROBLEM TO POSSIBILITY</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">Institution’s Innovation Council (IIC) • KMCT Kasaragod</p>
        </div>
        
        <p style="font-size: 16px;">Hello <strong>${registration.fullName}</strong>,</p>
        <p style="color: #cbd5e1; line-height: 1.6;">
          Your registration for the offline <strong>Workshop on Problem Solving &amp; Ideation (From Problem to Possibility)</strong> at <strong>${event.hostInstitution}</strong> has been received.
        </p>

        <div style="background: #180d26; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 24px 0;">
          <p style="margin: 4px 0; color: #cbd5e1;"><strong>Pass &amp; Ticket Status:</strong> <span style="color: #fbbf24;">Issued Automatically Upon Payment Completion</span></p>
          <p style="margin: 4px 0; color: #cbd5e1;"><strong>Institution:</strong> ${registration.institution}</p>
          <p style="margin: 4px 0; color: #cbd5e1;"><strong>Course &amp; Year:</strong> ${registration.course} (${registration.yearOfStudy})</p>
          <p style="margin: 4px 0; color: #cbd5e1;"><strong>Status:</strong> Awaiting Payment Confirmation</p>
          <p style="margin: 4px 0; color: #cbd5e1;"><strong>Registration Fee:</strong> ₹${event.registrationFee || 100}</p>
        </div>

        <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">
          Please complete your registration payment (₹${event.registrationFee || 100}) to lock in your seat (70 seats limit) and unlock your official ticket and digital event pass.
        </p>

        <div style="border-top: 1px solid #f59e0b20; margin-top: 28px; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p>Proposed by Mr. Abdul Mujeeb MS (IIC Coordinator) • Approved by Principal</p>
          <p>KMCT College of Engineering for Emerging Technologies and Management, Kasaragod</p>
        </div>
      </div>
    `;

    return this.dispatchEmail(registration.email, subject, html);
  },

  async sendPaymentConfirmationEmail(registration: Registration, event: EventConfig): Promise<boolean> {
    const subject = `Confirmed Seat Pass: Problem to Possibility Workshop [${registration.registrationNumber}]`;
    const venueText = event.venue + (event.roomNumber ? ` (${event.roomNumber})` : ' (College Seminar Hall)');
    const dateText = event.date || 'Wednesday, 11th November 2026';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0614; color: #f8fafc; padding: 32px; border-radius: 12px; border: 1px solid #f59e0b40;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #fbbf24; margin: 0; font-size: 28px; letter-spacing: 1px;">FROM PROBLEM TO POSSIBILITY</h1>
          <p style="color: #f97316; margin: 4px 0 0 0; font-size: 14px; font-weight: 600;">Institution’s Innovation Council (IIC) &amp; KMCT Kasaragod</p>
        </div>
        
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
          <h2 style="color: #34d399; margin: 0; font-size: 18px;">Payment Verified &amp; Workshop Seat Confirmed!</h2>
        </div>

        <p style="font-size: 16px;">Dear <strong>${registration.fullName}</strong>,</p>
        <p style="color: #cbd5e1; line-height: 1.6;">
          Your participation in the <strong>Workshop on Problem Solving and Ideation (From Problem to Possibility)</strong> is officially confirmed!
        </p>

        <div style="background: #180d26; padding: 20px; border-radius: 8px; border: 1px solid #f59e0b40; margin: 24px 0;">
          <h3 style="color: #fde68a; margin-top: 0; font-size: 16px; border-bottom: 1px solid #f59e0b30; padding-bottom: 8px;">Workshop Pass Details</h3>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Pass ID:</strong> <span style="color: #fbbf24; font-family: monospace; font-size: 15px;">${registration.registrationNumber}</span></p>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Participant:</strong> ${registration.fullName}</p>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Institution:</strong> ${registration.institution}</p>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Amount Paid:</strong> ₹${registration.amountPaid || event.registrationFee || 100}</p>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Date &amp; Time:</strong> ${dateText} (09:30 AM – 04:00 PM)</p>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Venue:</strong> ${venueText}</p>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Resource Person:</strong> Mr. Muhammed Shayiz K P</p>
        </div>

        <h4 style="color: #fbbf24; margin-bottom: 8px;">What to expect on event day:</h4>
        <ul style="color: #cbd5e1; line-height: 1.7; padding-left: 20px;">
          <li>Report to the College Seminar Hall before 09:30 AM for multidisciplinary team formation.</li>
          <li>Receive your chart paper, sketch pens, and empathy/problem-framing worksheets.</li>
          <li>Collaborate in hands-on team brainstorming and prototype building.</li>
          <li>Present your team pitch and receive your official <strong>IIC Activity Certificate</strong>.</li>
        </ul>

        <div style="border-top: 1px solid #f59e0b20; margin-top: 28px; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p>Please present this digital pass or your Ticket ID at the venue desk.</p>
          <p>Proposed by Mr. Abdul Mujeeb MS (IIC Coordinator) • Approved by Principal</p>
        </div>
      </div>
    `;

    return this.dispatchEmail(registration.email, subject, html);
  },

  async dispatchEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'From Problem to Possibility <onboarding@resend.dev>',
            to,
            subject,
            html,
          }),
        });
        return res.ok;
      } catch (err) {
        console.warn('Resend email dispatch error:', err);
        return false;
      }
    }
    console.info(`[EmailService Dev] Simulated email dispatch to ${to}: ${subject}`);
    return true;
  },
};
