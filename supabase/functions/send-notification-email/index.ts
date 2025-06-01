
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  to: string;
  type: string;
  data: {
    policyName: string;
    policyId: string;
    oldStatus?: string;
    newStatus?: string;
    reviewerComment?: string;
    assignedBy?: string;
    userName?: string;
  };
}

const getEmailTemplate = (type: string, data: any) => {
  const baseUrl = Deno.env.get("SUPABASE_URL")?.replace("/", "") || "your-app.com";
  
  switch (type) {
    case 'policy_status_change':
      return {
        subject: `Policy Status Updated: ${data.policyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Policy Status Update</h2>
            <p>The policy "<strong>${data.policyName}</strong>" has been updated.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Status changed from:</strong> ${data.oldStatus || 'N/A'}</p>
              <p><strong>Status changed to:</strong> ${data.newStatus}</p>
              ${data.reviewerComment ? `<p><strong>Reviewer comment:</strong> ${data.reviewerComment}</p>` : ''}
            </div>
            <p><a href="${baseUrl}/admin?tab=review-policies" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Policy</a></p>
            <p style="color: #6b7280; font-size: 14px;">This is an automated notification from your Policy Management System.</p>
          </div>
        `
      };
    
    case 'policy_assignment':
      return {
        subject: `New Policy Assignment: ${data.policyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">New Policy Assignment</h2>
            <p>You have been assigned to review the policy "<strong>${data.policyName}</strong>".</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Assigned by:</strong> ${data.assignedBy || 'System'}</p>
              <p><strong>Current status:</strong> ${data.newStatus}</p>
            </div>
            <p><a href="${baseUrl}/admin?tab=review-policies" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Review Policy</a></p>
            <p style="color: #6b7280; font-size: 14px;">This is an automated notification from your Policy Management System.</p>
          </div>
        `
      };
    
    case 'policy_comment':
      return {
        subject: `Comment Added to Policy: ${data.policyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Policy Comment Added</h2>
            <p>A comment has been added to your policy "<strong>${data.policyName}</strong>".</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Comment:</strong> ${data.reviewerComment}</p>
            </div>
            <p><a href="${baseUrl}/admin?tab=draft-policies" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Policy</a></p>
            <p style="color: #6b7280; font-size: 14px;">This is an automated notification from your Policy Management System.</p>
          </div>
        `
      };
    
    case 'policy_published':
      return {
        subject: `Policy Published: ${data.policyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Policy Published</h2>
            <p>The policy "<strong>${data.policyName}</strong>" has been published and is now live.</p>
            <div style="background-color: #ecfdf5; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10b981;">
              <p><strong>Status:</strong> Published</p>
              <p>This policy is now active and accessible to all relevant users.</p>
            </div>
            <p><a href="${baseUrl}/admin?tab=hr-policies" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Published Policy</a></p>
            <p style="color: #6b7280; font-size: 14px;">This is an automated notification from your Policy Management System.</p>
          </div>
        `
      };
    
    case 'policy_returned':
      return {
        subject: `Policy Returned for Changes: ${data.policyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Policy Returned for Changes</h2>
            <p>Your policy "<strong>${data.policyName}</strong>" has been returned and requires changes before it can be published.</p>
            <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
              <p><strong>Status:</strong> Awaiting Changes</p>
              ${data.reviewerComment ? `<p><strong>Reviewer feedback:</strong> ${data.reviewerComment}</p>` : ''}
            </div>
            <p><a href="${baseUrl}/admin?tab=draft-policies" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Edit Policy</a></p>
            <p style="color: #6b7280; font-size: 14px;">This is an automated notification from your Policy Management System.</p>
          </div>
        `
      };
    
    default:
      return {
        subject: `Notification: ${data.policyName}`,
        html: `<p>You have a new notification regarding policy "${data.policyName}".</p>`
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, type, data }: NotificationEmailRequest = await req.json();
    
    if (!to || !type || !data) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, type, data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailTemplate = getEmailTemplate(type, data);
    
    const emailResponse = await resend.emails.send({
      from: "Policy Management <notifications@resend.dev>",
      to: [to],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
