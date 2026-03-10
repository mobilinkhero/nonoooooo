/**
 * ============================================================
 * © 2025 Diploy — a brand of Bisht Technologies Private Limited
 * Original Author: BTPL Engineering Team
 * Website: https://diploy.in
 * Contact: cs@diploy.in
 *
 * Distributed under the Envato / CodeCanyon License Agreement.
 * Licensed to the purchaser for use as defined by the
 * Envato Market (CodeCanyon) Regular or Extended License.
 *
 * You are NOT permitted to redistribute, resell, sublicense,
 * or share this source code, in whole or in part.
 * Respect the author's rights and Envato licensing terms.
 * ============================================================
 */

import { Request, Response } from 'express';
import { DiployError, asyncHandler as _dHandler, diployLogger, HTTP_STATUS } from "@diploy/core";
import { db } from '../db';
import { smtpConfig } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { sendContactEmail, resetEmailCache, sendOTPEmail } from 'server/services/email.service';
import nodemailer from 'nodemailer';
import { cacheGet, cacheInvalidate, CACHE_KEYS, CACHE_TTL } from '../services/cache';

export const upsertSMTPConfig = async (req: Request, res: Response) => {
  try {
    const {
      host,
      port,
      secure,
      user,
      password,
      fromName,
      fromEmail,
      logo,
    } = req.body;

    // Check if a config already exists
    const existingConfig = await db.select().from(smtpConfig).limit(1);

    let result;
    if (existingConfig.length > 0) {
      // Update existing
      result = await db
        .update(smtpConfig)
        .set({
          host,
          port,
          secure,
          user,
          password,
          fromName,
          fromEmail,
          logo,
          updatedAt: new Date(),
        })
        .where(eq(smtpConfig.id, existingConfig[0].id))
        .returning();
    } else {
      // Insert new
      result = await db
        .insert(smtpConfig)
        .values({
          host,
          port,
          secure,
          user,
          password,
          fromName,
          fromEmail,
          logo,
        })
        .returning();
    }

    await cacheInvalidate(CACHE_KEYS.smtpConfig());
    resetEmailCache();

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('SMTP upsert error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to save SMTP config', error });
  }
};

// GET SMTP configuration
export const getSMTPConfigHandler = async (req: Request, res: Response) => {
  try {
    // Assuming there's only one SMTP config row
    const config = await db.select().from(smtpConfig).limit(1);

    if (!config || config.length === 0) {
      return res.status(404).json({
        success: false,
        message: "SMTP configuration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: config[0],
    });
  } catch (error) {
    console.error("SMTP fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch SMTP configuration",
      error,
    });
  }
};


export const getSMTPConfig = async () => {
  return cacheGet(CACHE_KEYS.smtpConfig(), CACHE_TTL.smtpConfig, async () => {
    const configs = await db.select().from(smtpConfig).limit(1);
    if (!configs || configs.length === 0) {
      console.warn('⚠️ No SMTP configuration found');
      return null;
    }
    return configs[0];
  });
};



export const sendMailRoute = async (req: Request, res: Response) => {
  try {
    const { name, email, company, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const result = await sendContactEmail({
      name,
      email,
      company,
      subject,
      message,
    });

    console.log("Contact form email sent:", result);

    return res.json({
      success: true,
      message: "Message sent successfully",
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};

export const sendTestEmailHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }

    const config = await getSMTPConfig();
    if (!config) {
      return res.status(400).json({ success: false, message: 'SMTP configuration not found. Please save your SMTP settings first.' });
    }

    const port = parseInt(config.port, 10);
    const secure = port === 465;

    const testTransporter = nodemailer.createTransport({
      host: config.host,
      port,
      secure,
      ...(!secure && (port === 587 || !!config.secure) ? { requireTLS: true } : {}),
      auth: {
        user: config.user,
        pass: config.password,
      },
    });

    await testTransporter.verify();

    await testTransporter.sendMail({
      from: `"${config.fromName || 'Chatvoo'}" <${config.fromEmail || config.user}>`,
      to: email,
      subject: '✅ SMTP Test Email - Configuration Successful',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background:#f4f5f7; padding:40px;">
          <div style="max-width:560px; margin:auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#22c55e,#10b981); padding:30px; text-align:center;">
              <h1 style="color:#fff; margin:0; font-size:24px;">✅ SMTP Test Successful</h1>
            </div>
            <div style="padding:32px;">
              <p style="font-size:16px; color:#374151;">Congratulations! Your SMTP configuration is working correctly.</p>
              <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:20px; margin:20px 0;">
                <p style="margin:0; font-size:14px; color:#166534;"><strong>Configuration Details:</strong></p>
                <p style="margin:8px 0 0; font-size:14px; color:#166534;">Host: ${config.host}:${config.port}</p>
                <p style="margin:4px 0 0; font-size:14px; color:#166534;">From: ${config.fromName || 'Chatvoo'} &lt;${config.fromEmail || config.user}&gt;</p>
              </div>
              <p style="font-size:14px; color:#6b7280;">This test email was sent from your Chatvoo dashboard to verify your email settings are correctly configured.</p>
            </div>
            <div style="background:#f9fafb; padding:16px; text-align:center; font-size:12px; color:#9ca3af;">
              Sent from Chatvoo Admin Panel
            </div>
          </div>
        </body>
        </html>
      `,
      text: `SMTP Test Successful! Your SMTP configuration (${config.host}:${config.port}) is working correctly.`,
    });

    return res.json({ success: true, message: `Test email sent successfully to ${email}` });
  } catch (error: any) {
    console.error('[SMTP Test] Failed:', error);
    const message = error?.responseCode
      ? `SMTP Error ${error.responseCode}: ${error.response || error.message}`
      : error.message || 'Failed to send test email';
    return res.status(500).json({ success: false, message });
  }
};
