/**
 * Email Integration with Amazon SES
 * Phase 5: Polish & Launch
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { logEvent } from "@/lib/events";
import { EventTypes } from "@/lib/events/types";

// ============================================================================
// CONFIGURATION
// ============================================================================

const AWS_REGION = process.env.AWS_SES_REGION || "ap-south-1";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "Algonauts <noreply@algonauts.in>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "support@algonauts.in";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://algonauts.in";

// Create SES client
let sesClient: SESClient | null = null;

function getSESClient(): SESClient | null {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    return null;
  }

  if (!sesClient) {
    sesClient = new SESClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  return sesClient;
}

// ============================================================================
// TYPES
// ============================================================================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export type EmailTemplate =
  | "welcome"
  | "email_verification"
  | "password_reset"
  | "application_status"
  | "invite"
  | "verification_request_30"
  | "verification_request_90"
  | "placement_confirmation"
  | "weekly_digest"
  | "streak_reminder"
  | "opportunity_match"
  | "loss_frame_missed_opportunities"
  | "loss_frame_streak_warning"
  | "loss_frame_classmates_applied";

// ============================================================================
// EMAIL SENDING
// ============================================================================

/**
 * Send email via Amazon SES
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const client = getSESClient();

  if (!client) {
    console.warn("[Email] AWS SES not configured - email not sent:", options.subject);
    console.warn("[Email] Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SES_REGION to enable email sending");
    return { success: false, error: "AWS SES not configured" };
  }

  try {
    const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: options.subject,
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: options.html,
          },
          ...(options.text && {
            Text: {
              Charset: "UTF-8",
              Data: options.text,
            },
          }),
        },
      },
      ReplyToAddresses: [options.replyTo || REPLY_TO],
      Tags: options.tags
        ? Object.entries(options.tags).map(([Name, Value]) => ({ Name, Value }))
        : undefined,
    });

    const response = await client.send(command);

    await logEvent(EventTypes.EMAIL_SENT, {
      entityType: "email",
      entityId: response.MessageId || "unknown",
      metadata: {
        to: options.to,
        subject: options.subject,
        tags: options.tags,
      },
    });

    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error("[Email] Send error:", error);
    return { success: false, error: String(error) };
  }
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #1a1a1a;
`;

const buttonStyle = `
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
`;

const footerStyle = `
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
  font-size: 12px;
  color: #666;
`;

/**
 * Generate email HTML from template
 */
export function generateEmailHtml(
  template: EmailTemplate,
  data: Record<string, unknown>
): { subject: string; html: string; text: string } {
  switch (template) {
    case "welcome":
      return {
        subject: "Welcome to Algonauts! Your career journey starts here",
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #6366f1;">Welcome to Algonauts, ${data.name}!</h1>
            <p>You've taken the first step towards your dream career. Here's what you can do next:</p>
            <ul>
              <li><strong>Complete your profile</strong> - Add skills, experience, and resume</li>
              <li><strong>Take skill assessments</strong> - Boost your LayersRank score</li>
              <li><strong>Explore opportunities</strong> - AI-matched jobs from top companies</li>
            </ul>
            <p style="margin-top: 24px;">
              <a href="${APP_URL}/dashboard" style="${buttonStyle}">Go to Dashboard</a>
            </p>
            <p style="margin-top: 24px;">
              <strong>Pro tip:</strong> Students with complete profiles get 3x more interview invites!
            </p>
            <div style="${footerStyle}">
              <p>Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `Welcome to Algonauts, ${data.name}! Complete your profile, take assessments, and explore opportunities at ${APP_URL}/dashboard`,
      };

    case "email_verification":
      return {
        subject: "Verify your Algonauts email",
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #6366f1;">Verify your email</h1>
            <p>Hi ${data.name},</p>
            <p>Please click the button below to verify your email address:</p>
            <p style="margin: 24px 0;">
              <a href="${data.verificationUrl}" style="${buttonStyle}">Verify Email</a>
            </p>
            <p style="font-size: 12px; color: #666;">
              This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
            <div style="${footerStyle}">
              <p>Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `Verify your email at ${data.verificationUrl}. Link expires in 24 hours.`,
      };

    case "password_reset":
      return {
        subject: "Reset your Algonauts password",
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #6366f1;">Reset your password</h1>
            <p>Hi ${data.name},</p>
            <p>We received a request to reset your password. Click below to set a new password:</p>
            <p style="margin: 24px 0;">
              <a href="${data.resetUrl}" style="${buttonStyle}">Reset Password</a>
            </p>
            <p style="font-size: 12px; color: #666;">
              This link expires in 1 hour. If you didn't request this, your account is still secure.
            </p>
            <div style="${footerStyle}">
              <p>Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `Reset your password at ${data.resetUrl}. Link expires in 1 hour.`,
      };

    case "application_status":
      return {
        subject: `Application Update: ${data.companyName} - ${data.role}`,
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #6366f1;">Application Update</h1>
            <p>Hi ${data.name},</p>
            <p>Your application to <strong>${data.companyName}</strong> for the role of <strong>${data.role}</strong> has been updated:</p>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; font-size: 18px;">
                Status: <strong style="color: ${data.status === "OFFERED" ? "#22c55e" : data.status === "REJECTED" ? "#ef4444" : "#6366f1"};">${data.status}</strong>
              </p>
              ${data.message ? `<p style="margin: 8px 0 0 0; color: #666;">${data.message}</p>` : ""}
            </div>
            ${data.status === "OFFERED" ? `
              <p><strong>Congratulations!</strong> Review the offer and respond within the deadline.</p>
              <p style="margin-top: 24px;">
                <a href="${APP_URL}/applications/${data.applicationId}" style="${buttonStyle}">View Offer Details</a>
              </p>
            ` : `
              <p style="margin-top: 24px;">
                <a href="${APP_URL}/applications/${data.applicationId}" style="${buttonStyle}">View Application</a>
              </p>
            `}
            <div style="${footerStyle}">
              <p>Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `Your application to ${data.companyName} for ${data.role} status: ${data.status}. View at ${APP_URL}/applications/${data.applicationId}`,
      };

    case "invite":
      return {
        subject: `${data.companyName} invites you to apply for ${data.role}`,
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #6366f1;">You've Been Invited!</h1>
            <p>Hi ${data.name},</p>
            <p><strong>${data.companyName}</strong> has personally invited you to apply for:</p>
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #6366f1;">
              <h2 style="margin: 0 0 8px 0; color: #1e40af;">${data.role}</h2>
              <p style="margin: 0; color: #666;">
                ${data.location} | ${data.salary ? `₹${data.salary} LPA` : "Competitive"}
              </p>
            </div>
            <p><strong>Why you?</strong> ${data.reason || "Your profile matches what they're looking for."}</p>
            <p style="margin: 24px 0;">
              <a href="${data.inviteUrl}" style="${buttonStyle}">View & Accept Invite</a>
            </p>
            <p style="font-size: 14px; color: #dc2626;">
              <strong>Act fast!</strong> This invite expires in ${data.expiresInDays || 7} days.
            </p>
            <div style="${footerStyle}">
              <p>Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `${data.companyName} invites you to apply for ${data.role}. Accept at ${data.inviteUrl}. Expires in ${data.expiresInDays || 7} days.`,
      };

    case "verification_request_30":
      return {
        subject: "Quick check-in: How's your new role at " + data.companyName + "?",
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #6366f1;">30-Day Check-In</h1>
            <p>Hi ${data.name},</p>
            <p>It's been 30 days since you started at <strong>${data.companyName}</strong>! How's it going?</p>
            <p>We'd love a quick confirmation that everything is on track:</p>
            <p style="margin: 24px 0;">
              <a href="${data.verifyUrl}" style="${buttonStyle}">Confirm I'm Still Here</a>
            </p>
            <p>This helps us:</p>
            <ul>
              <li>Verify placement success for your college</li>
              <li>Improve our job matching for other students</li>
              <li>Keep our platform accurate and trustworthy</li>
            </ul>
            <div style="${footerStyle}">
              <p>Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `30-day check-in for your role at ${data.companyName}. Confirm at ${data.verifyUrl}`,
      };

    case "verification_request_90":
      return {
        subject: "90-Day Milestone at " + data.companyName + " - Verify & Celebrate!",
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #22c55e;">90-Day Milestone!</h1>
            <p>Hi ${data.name},</p>
            <p>Congratulations on completing 90 days at <strong>${data.companyName}</strong>! This is a huge milestone.</p>
            <p>Please confirm you're still thriving in your role:</p>
            <p style="margin: 24px 0;">
              <a href="${data.verifyUrl}" style="${buttonStyle}">Confirm & Celebrate</a>
            </p>
            <p>After verification, you can:</p>
            <ul>
              <li>Share your success story on Algonauts</li>
              <li>Earn the "90-Day Champion" badge</li>
              <li>Inspire fellow students from ${data.collegeName}</li>
            </ul>
            <div style="${footerStyle}">
              <p>Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `90-day milestone at ${data.companyName}! Verify and celebrate at ${data.verifyUrl}`,
      };

    case "placement_confirmation":
      return {
        subject: `Congratulations! Your placement at ${data.companyName} is confirmed`,
        html: `
          <div style="${baseStyles}">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 48px;">🎉</span>
            </div>
            <h1 style="color: #22c55e; text-align: center;">Placement Confirmed!</h1>
            <p style="text-align: center;">Hi ${data.name},</p>
            <p style="text-align: center;">Your placement at <strong>${data.companyName}</strong> as <strong>${data.role}</strong> has been officially confirmed!</p>
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #166534;">₹${data.package} LPA</p>
              <p style="margin: 8px 0 0 0; color: #166534;">${data.companyName} | ${data.role}</p>
            </div>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${APP_URL}/celebrate/${data.placementId}" style="${buttonStyle}">Share Your Success</a>
            </p>
            <div style="${footerStyle}">
              <p style="text-align: center;">Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `Congratulations! Your placement at ${data.companyName} as ${data.role} (₹${data.package} LPA) is confirmed!`,
      };

    case "weekly_digest":
      return {
        subject: `Your Weekly Algonauts Digest: ${data.newOpportunities} new opportunities`,
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #6366f1;">Weekly Digest</h1>
            <p>Hi ${data.name},</p>
            <p>Here's what you missed this week:</p>
            <div style="display: grid; gap: 12px; margin: 16px 0;">
              <div style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
                <strong>${data.newOpportunities}</strong> new opportunities matching your profile
              </div>
              <div style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
                <strong>${data.collegemates}</strong> classmates got placed this week
              </div>
              <div style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
                Your streak: <strong>${data.streakDays} days</strong>
              </div>
            </div>
            <p style="margin: 24px 0;">
              <a href="${APP_URL}/opportunities" style="${buttonStyle}">Explore Opportunities</a>
            </p>
            <div style="${footerStyle}">
              <p>Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `Weekly Digest: ${data.newOpportunities} new opportunities, ${data.collegemates} classmates placed. Explore at ${APP_URL}/opportunities`,
      };

    // LOSS-FRAMING TEMPLATES (Critical for engagement)

    case "loss_frame_missed_opportunities":
      return {
        subject: `⚠️ ${data.count} opportunities are closing soon`,
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #dc2626;">Don't Miss Out!</h1>
            <p>Hi ${data.name},</p>
            <p style="font-size: 18px;"><strong>${data.count} opportunities</strong> matching your profile are closing soon:</p>
            <div style="margin: 16px 0;">
              ${(data.opportunities as Array<{ company: string; role: string; deadline: string }>)?.slice(0, 3).map((opp: { company: string; role: string; deadline: string }) => `
                <div style="background: #fef2f2; padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #dc2626;">
                  <strong>${opp.company}</strong> - ${opp.role}
                  <br><span style="color: #dc2626; font-size: 12px;">Closes: ${opp.deadline}</span>
                </div>
              `).join("") || ""}
            </div>
            <p style="color: #dc2626;"><strong>These opportunities won't wait for you.</strong></p>
            <p style="margin: 24px 0;">
              <a href="${APP_URL}/opportunities" style="${buttonStyle}">Apply Now Before It's Too Late</a>
            </p>
            <div style="${footerStyle}">
              <p>Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `${data.count} opportunities are closing soon. Apply now at ${APP_URL}/opportunities`,
      };

    case "loss_frame_streak_warning":
      return {
        subject: `⚠️ Your ${data.streakDays}-day streak is about to break!`,
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #f59e0b;">Streak Alert!</h1>
            <p>Hi ${data.name},</p>
            <p style="font-size: 18px;">Your <strong>${data.streakDays}-day streak</strong> will break in <strong>${data.hoursRemaining} hours</strong>!</p>
            <div style="background: #fffbeb; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0;"><strong>What you'll lose:</strong></p>
              <ul style="margin: 8px 0;">
                <li>Your ${data.streakDays}-day streak progress</li>
                <li>Chance for the ${data.nextMilestone}-day badge</li>
                <li>Streak multiplier bonus on XP</li>
              </ul>
            </div>
            <p style="margin: 24px 0;">
              <a href="${APP_URL}/dashboard" style="${buttonStyle}">Keep Your Streak Alive</a>
            </p>
            <p style="font-size: 12px; color: #666;">
              Just 1 action keeps your streak going: view opportunities, complete profile, or take an assessment.
            </p>
            <div style="${footerStyle}">
              <p>Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `Your ${data.streakDays}-day streak breaks in ${data.hoursRemaining} hours! Log in now: ${APP_URL}/dashboard`,
      };

    case "loss_frame_classmates_applied":
      return {
        subject: `${data.classmateCount} classmates just applied to ${data.companyName}`,
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #6366f1;">Your classmates are moving fast</h1>
            <p>Hi ${data.name},</p>
            <p style="font-size: 18px;"><strong>${data.classmateCount} students from ${data.collegeName}</strong> just applied to:</p>
            <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #6366f1;">
              <h2 style="margin: 0 0 8px 0;">${data.role}</h2>
              <p style="margin: 0;"><strong>${data.companyName}</strong></p>
              <p style="margin: 8px 0 0 0; color: #666;">${data.salary ? `₹${data.salary} LPA` : "Competitive"} | ${data.location}</p>
            </div>
            <p><strong>Only ${data.spotsRemaining} spots remaining.</strong></p>
            <p style="margin: 24px 0;">
              <a href="${APP_URL}/opportunities/${data.opportunityId}" style="${buttonStyle}">Apply Before Spots Fill Up</a>
            </p>
            <div style="${footerStyle}">
              <p>Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `${data.classmateCount} classmates applied to ${data.companyName} for ${data.role}. Only ${data.spotsRemaining} spots left. Apply: ${APP_URL}/opportunities/${data.opportunityId}`,
      };

    case "streak_reminder":
    case "opportunity_match":
    default:
      return {
        subject: "Update from Algonauts",
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #6366f1;">Hello from Algonauts</h1>
            <p>Hi ${data.name || "there"},</p>
            <p>${data.message || "Check out the latest opportunities on Algonauts!"}</p>
            <p style="margin: 24px 0;">
              <a href="${APP_URL}" style="${buttonStyle}">Go to Algonauts</a>
            </p>
            <div style="${footerStyle}">
              <p>Algonauts - Where talent meets opportunity</p>
            </div>
          </div>
        `,
        text: `${data.message || "Check out the latest opportunities on Algonauts!"} Visit: ${APP_URL}`,
      };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Send templated email
 */
export async function sendTemplateEmail(
  to: string | string[],
  template: EmailTemplate,
  data: Record<string, unknown>,
  tags?: Record<string, string>
): Promise<EmailResult> {
  const { subject, html, text } = generateEmailHtml(template, data);

  return sendEmail({
    to,
    subject,
    html,
    text,
    tags: {
      template,
      ...tags,
    },
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
  return sendTemplateEmail(email, "welcome", { name });
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
): Promise<EmailResult> {
  return sendTemplateEmail(email, "email_verification", { name, verificationUrl });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<EmailResult> {
  return sendTemplateEmail(email, "password_reset", { name, resetUrl });
}

/**
 * Send application status update
 */
export async function sendApplicationStatusEmail(
  email: string,
  data: {
    name: string;
    companyName: string;
    role: string;
    status: string;
    applicationId: string;
    message?: string;
  }
): Promise<EmailResult> {
  return sendTemplateEmail(email, "application_status", data);
}

/**
 * Send invite email
 */
export async function sendInviteEmail(
  email: string,
  data: {
    name: string;
    companyName: string;
    role: string;
    location: string;
    salary?: number;
    reason?: string;
    inviteUrl: string;
    expiresInDays?: number;
  }
): Promise<EmailResult> {
  return sendTemplateEmail(email, "invite", data);
}

/**
 * Send verification request (30 or 90 day)
 */
export async function sendVerificationRequestEmail(
  email: string,
  data: {
    name: string;
    companyName: string;
    collegeName?: string;
    verifyUrl: string;
  },
  type: "30" | "90"
): Promise<EmailResult> {
  const template = type === "30" ? "verification_request_30" : "verification_request_90";
  return sendTemplateEmail(email, template, data);
}

/**
 * Send placement confirmation
 */
export async function sendPlacementConfirmationEmail(
  email: string,
  data: {
    name: string;
    companyName: string;
    role: string;
    package: number;
    placementId: string;
  }
): Promise<EmailResult> {
  return sendTemplateEmail(email, "placement_confirmation", data);
}

/**
 * Send loss-framing notification (critical for engagement)
 */
export async function sendLossFrameEmail(
  email: string,
  type: "missed_opportunities" | "streak_warning" | "classmates_applied",
  data: Record<string, unknown>
): Promise<EmailResult> {
  const templateMap = {
    missed_opportunities: "loss_frame_missed_opportunities" as EmailTemplate,
    streak_warning: "loss_frame_streak_warning" as EmailTemplate,
    classmates_applied: "loss_frame_classmates_applied" as EmailTemplate,
  };
  return sendTemplateEmail(email, templateMap[type], data);
}
