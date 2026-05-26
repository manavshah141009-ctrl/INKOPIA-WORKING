import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Configure transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  tls: { rejectUnauthorized: false },
});

export async function GET(request: Request) {
  // 1. Secure Route - Verify Vercel Cron Secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized trigger attempt.', { status: 401 });
  }

  try {
    const today = new Date();
    
    // Define helper to get start and end range of exact day offset
    const getExactDayRange = (daysAgo: number) => {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - daysAgo);
      
      const start = new Date(targetDate.setHours(0, 0, 0, 0));
      const end = new Date(targetDate.setHours(23, 59, 59, 999));
      return { start, end };
    };

    // Calculate dates for 7, 14, and 30 days ago
    const d7 = getExactDayRange(7);
    const d14 = getExactDayRange(14);
    const d30 = getExactDayRange(30);

    // 2. Query matching Pens from PenRegistration
    const pens = await prisma.penRegistration.findMany({
      where: {
        OR: [
          // 7-day checks
          { lastServiceDate: { gte: d7.start, lte: d7.end } },
          { lastRefilledDate: { gte: d7.start, lte: d7.end } },
          
          // 14-day checks
          { lastServiceDate: { gte: d14.start, lte: d14.end } },
          { lastRefilledDate: { gte: d14.start, lte: d14.end } },

          // 30-day checks
          { lastServiceDate: { gte: d30.start, lte: d30.end } },
          { lastRefilledDate: { gte: d30.start, lte: d30.end } },
        ]
      }
    });

    let sentEmailsCount = 0;

    // 3. Process reminders for each pen registration
    for (const pen of pens) {
      // Determine what matching date interval we hit
      const checkInterval = (date: Date | null) => {
        if (!date) return null;
        if (date >= d7.start && date <= d7.end) return 7;
        if (date >= d14.start && date <= d14.end) return 14;
        if (date >= d30.start && date <= d30.end) return 30;
        return null;
      };

      const daysElapsed = checkInterval(pen.lastServiceDate) || checkInterval(pen.lastRefilledDate);
      if (!daysElapsed) continue;

      let emailSubject = '';
      let emailHtmlBody = '';
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inkopia.in';

      // 4. Ink Sommelier Copy Selection
      if (pen.isNewPen && daysElapsed === 7) {
        // Special 1-week break-in notification
        emailSubject = `Bespoke Calibration: Your New ${pen.brand} ${pen.model}`;
        emailHtmlBody = `
          <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.8;">
            Sir/Madam,
          </p>
          <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.8; text-align: justify;">
            It has been precisely a week since you registered your brand new <strong>${pen.brand} ${pen.model}</strong>. 
            A fine nib is akin to a living instrument, slowly adapting to the angle, weight, and cadence of your signature hand.
          </p>
          <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.8; text-align: justify;">
            During this crucial break-in period, is the ink flow gliding seamlessly across the parchment, or shall we coordinate a custom feed tune-up to ensure immaculate precision?
          </p>
        `;
      } else {
        // Standard Ink Sommelier Notification
        emailSubject = `Bespoke Care Curation: Your ${pen.brand} ${pen.model}`;
        emailHtmlBody = `
          <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.8;">
            Sir/Madam,
          </p>
          <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.8; text-align: justify;">
            It has been ${daysElapsed} days since your bespoke concierge ritual. Fountain pens are sensitive to atmospheric parameters and time; static reservoirs are susceptible to micro-condensation and evaporation.
          </p>
          <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.8; text-align: justify;">
            Is your <strong>${pen.brand} ${pen.model}</strong> gliding perfectly, or shall we arrange a fresh reservoir of custom archival ink for your desk in Mumbai?
          </p>
        `;
      }

      // 5. Luxury HTML Email Layout
      const fullEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${emailSubject}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: 'Times New Roman', Georgia, serif; color: #001220;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFAFA; padding: 40px 20px;">
            <tr>
              <td align="center">
                <!-- Luxury Gold Border Frame -->
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border: 1px solid #D4AF37; box-shadow: 0 10px 30px rgba(0, 18, 32, 0.03);">
                  <!-- Gold Top Ribbon -->
                  <tr>
                    <td height="5" style="background-color: #D4AF37; line-height: 5px; font-size: 5px;">&nbsp;</td>
                  </tr>
                  
                  <!-- Logo & Editorial Header -->
                  <tr>
                    <td align="center" style="padding: 40px 40px 30px 40px; border-bottom: 1px solid rgba(0, 18, 32, 0.06);">
                      <span style="font-family: Arial, sans-serif; font-size: 9px; font-weight: bold; letter-spacing: 0.4em; text-transform: uppercase; color: #D4AF37; display: block; margin-bottom: 6px;">
                        Inkopia Experience
                      </span>
                      <span style="font-size: 16px; font-weight: bold; letter-spacing: 0.25em; text-transform: uppercase; color: #001220; display: block;">
                        The Desk Sommelier
                      </span>
                    </td>
                  </tr>
                  
                  <!-- Content Body -->
                  <tr>
                    <td style="padding: 50px 50px 40px 50px; font-size: 15px; line-height: 1.8; color: #001220;">
                      ${emailHtmlBody}
                      
                      <!-- Solid Navy CTA Button with Zero Border-Radius -->
                      <table border="0" cellspacing="0" cellpadding="0" style="margin-top: 35px; width: 100%;">
                        <tr>
                          <td align="center">
                            <a href="${appUrl}/request?brand=${encodeURIComponent(pen.brand)}&model=${encodeURIComponent(pen.model)}" 
                               target="_blank" 
                               style="background-color: #001220; border: 1px solid #001220; color: #FFFFFF; font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; letter-spacing: 0.25em; text-decoration: none; text-transform: uppercase; padding: 16px 36px; display: inline-block; transition: all 0.3s; border-radius: 0px;">
                              Request a Refill
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Editorial Footer -->
                  <tr>
                    <td align="center" style="padding: 40px 40px; border-top: 1px solid rgba(0, 18, 32, 0.06); font-family: Arial, sans-serif; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(0, 18, 32, 0.4);">
                      <p style="margin: 0 0 8px 0; font-weight: bold; color: #001220;">Private & Confidential Correspondence</p>
                      <p style="margin: 0 0 25px 0;">This communication is curated exclusively for patrons of the Inkopia Experience.</p>
                      <p style="margin: 0; font-weight: bold; color: #D4AF37;">© 2026 Inkopia • The Art of Writing</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      // 6. Transmit Notification Email
      const fromEmail = process.env.SMTP_USER || 'concierge@inkopia.in';
      await transporter.sendMail({
        from: `"Inkopia Desk Sommelier" <${fromEmail}>`,
        to: pen.ownerEmail,
        subject: emailSubject,
        html: fullEmailHtml,
      });

      sentEmailsCount++;
    }

    return NextResponse.json({
      success: true,
      processedCount: pens.length,
      notificationsSent: sentEmailsCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Failed to run automated reminder cron:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
