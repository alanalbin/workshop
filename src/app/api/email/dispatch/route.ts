import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const PASSES_FILE = path.resolve(process.cwd(), 'public/generated-passes/passes.json');
const PASSES_DIR = path.resolve(process.cwd(), 'public/generated-passes/passes');

function buildHtml(name: string, ticketId: string, course: string, year: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #120307; color: #fdf2f4; border-radius: 16px; overflow: hidden; border: 1px solid #7f1d2d; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="background: linear-gradient(135deg, #2b050d 0%, #4a0917 50%, #1f0208 100%); padding: 26px 20px; text-align: center; border-bottom: 2px solid #991b1b;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #fda4af; font-weight: 700;">KMCT College of Engineering for Emerging Technologies and Management</p>
        <p style="margin: 4px 0 0 0; font-size: 10px; color: #fecdd3; letter-spacing: 1px;">Institution’s Innovation Council (IIC) &bull; Kasaragod</p>
        <h1 style="margin: 14px 0 6px 0; font-size: 24px; color: #ffffff; letter-spacing: 1px; font-weight: 900;">FROM PROBLEM TO POSSIBILITY</h1>
        <p style="margin: 0; font-size: 13px; color: #f43f5e; font-weight: 600;">Turn Real-World Challenges into Pitch-Ready Innovations!</p>
      </div>

      <div style="background: #1c050a; padding: 14px; text-align: center; border-bottom: 1px solid #470814;">
        <span style="display: inline-block; background: #064e3b; color: #6ee7b7; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 9999px; border: 1px solid #059669;">
          &check; PAYMENT CONFIRMED &bull; OFFICIAL ENTRY PASS ISSUED
        </span>
      </div>

      <div style="padding: 24px 20px;">
        <p style="font-size: 16px; margin: 0 0 10px 0; color: #ffffff;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #fecdd3; margin: 0 0 20px 0;">
          Congratulations! Your seat for the hands-on <strong>From Problem to Possibility</strong> workshop is officially confirmed. Your official horizontal boarding pass is attached to this email as a high-definition PNG file.
        </p>

        <div style="background: #20040b; border: 1px solid #881337; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #fda4af; font-weight: 600;">Ticket ID:</td>
              <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 17px; font-weight: bold; color: #ffffff; letter-spacing: 1px;">${ticketId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #fda4af;">Participant:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #ffe4e6;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #fda4af;">Department:</td>
              <td style="padding: 6px 0; text-align: right; color: #ffe4e6;">${course} (${year})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #fda4af;">Event Date:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #ffffff;">Wednesday, 11th November 2026</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #fda4af;">Timing:</td>
              <td style="padding: 6px 0; text-align: right; color: #ffe4e6;">09:30 AM &ndash; 04:00 PM (Report by 09:00 AM)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #fda4af;">Venue:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #ffffff;">Seminar Hall, KMCT CEETM, Kasaragod</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #fda4af;">Resource Person:</td>
              <td style="padding: 6px 0; text-align: right; color: #ffe4e6;">Mr. Muhammed Shayiz K P</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <p style="font-size: 12px; color: #fda4af; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Official Entry Boarding Pass (Attached):</p>
          <img src="cid:passAttachment" alt="Workshop Entry Pass" style="max-width: 100%; width: 580px; height: auto; border-radius: 12px; border: 2px solid #be123c; box-shadow: 0 8px 24px rgba(0,0,0,0.6);" />
        </div>

        <div style="background: #190308; border-left: 4px solid #f43f5e; padding: 14px 16px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #ffffff;">Entry &amp; Check-In Guidelines:</h4>
          <ul style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.6; color: #fecdd3;">
            <li>Please show this digital pass on your phone or quote your Ticket ID (<strong>${ticketId}</strong>) at the venue registration counter.</li>
            <li>Scan the QR code at the desk for instant automated attendance logging.</li>
            <li>Multidisciplinary innovation teams will be formed at 09:30 AM sharp.</li>
          </ul>
        </div>
      </div>

      <div style="background: #090103; padding: 20px; text-align: center; font-size: 11px; color: #9f1239; border-top: 1px solid #4c0519;">
        <p style="margin: 0;">Organized by Institution’s Innovation Council (IIC)</p>
        <p style="margin: 4px 0 0 0;">KMCT College of Engineering for Emerging Technologies and Management, Kasaragod</p>
        <p style="margin: 8px 0 0 0; color: #881337;">Coordinator: Mr. Abdul Mujeeb MS | abdulmujeeb@kmct.edu.in | +91 94474 38228</p>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'trial';
    const toEmail = body.toEmail || body.email;
    const user = body.smtpUser || process.env.GMAIL_USER;
    const pass = body.smtpPass || process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gmail SMTP credentials missing. Please provide smtpUser and smtpPass or configure GMAIL_USER and GMAIL_APP_PASSWORD in .env.local',
        },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    if (action === 'trial') {
      if (!toEmail) {
        return NextResponse.json({ success: false, error: 'Recipient toEmail is required for trial.' }, { status: 400 });
      }

      const passes = JSON.parse(fs.readFileSync(PASSES_FILE, 'utf-8'));
      const sample = passes[0];
      const imagePath = path.join(PASSES_DIR, sample.passFilename);

      const htmlBody = buildHtml('Trial Participant', 'KMCT-WS-TRIAL-0001', 'CSE Innovation Lab', '1st Year');

      const info = await transporter.sendMail({
        from: `"KMCT CEETM - Problem to Possibility" <${user}>`,
        to: toEmail,
        subject: `🎟️ [TRIAL] Entry Pass: From Problem to Possibility Workshop [KMCT-WS-TRIAL-0001]`,
        html: htmlBody,
        attachments: [
          {
            filename: `Workshop_Pass_KMCT-WS-TRIAL-0001.png`,
            path: imagePath,
            cid: 'passAttachment',
          },
        ],
      });

      return NextResponse.json({
        success: true,
        message: `Trial pass successfully sent to ${toEmail}`,
        messageId: info.messageId,
      });
    }

    if (action === 'batch') {
      const passes = JSON.parse(fs.readFileSync(PASSES_FILE, 'utf-8'));
      let sent = 0;
      let failed = 0;

      for (let i = 0; i < passes.length; i++) {
        const p = passes[i];
        const imagePath = path.join(PASSES_DIR, p.passFilename);
        const htmlBody = buildHtml(p.fullName, p.ticketNumber, p.course, p.year);

        try {
          await transporter.sendMail({
            from: `"KMCT CEETM - Problem to Possibility" <${user}>`,
            to: p.email,
            subject: `🎟️ Entry Pass: From Problem to Possibility Workshop [${p.ticketNumber}]`,
            html: htmlBody,
            attachments: [
              {
                filename: `Workshop_Pass_${p.ticketNumber}.png`,
                path: imagePath,
                cid: 'passAttachment',
              },
            ],
          });
          sent++;
          await new Promise((r) => setTimeout(r, 300));
        } catch {
          failed++;
        }
      }

      return NextResponse.json({
        success: true,
        total: passes.length,
        sent,
        failed,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
