
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  to: string;
  name: string;
  role: string;
  temporaryPassword: string;
  userId: string;
}

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'read-only':
      return 'Read Only';
    case 'edit':
      return 'Editor';
    case 'publish':
      return 'Publisher';
    case 'super-admin':
      return 'Super Admin';
    default:
      return role;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, name, role, temporaryPassword }: WelcomeEmailRequest = await req.json();
    
    if (!to || !name || !role || !temporaryPassword) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, name, role, temporaryPassword" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace("/", "") || "your-app.com";
    const roleDisplayName = getRoleDisplayName(role);
    
    const emailResponse = await resend.emails.send({
      from: "Policy Management <notifications@resend.dev>",
      to: [to],
      subject: "Welcome to Policy Management System - Account Created",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Welcome to Policy Management System</h2>
          <p>Hello <strong>${name}</strong>,</p>
          
          <p>Your account has been created successfully! Here are your account details:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${to}</p>
            <p><strong>Role:</strong> ${roleDisplayName}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code></p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p><strong>Important Security Notice:</strong></p>
            <p>This is a temporary password. For your security, you will be required to change this password when you first log in.</p>
          </div>
          
          <p>Your role grants you the following permissions:</p>
          <ul style="margin-left: 20px;">
            ${role === 'read-only' ? `
              <li>View published policies and forms</li>
              <li>Access to public content</li>
            ` : ''}
            ${role === 'edit' ? `
              <li>Create and edit draft policies</li>
              <li>Submit policies for review</li>
              <li>View published policies and forms</li>
            ` : ''}
            ${role === 'publish' ? `
              <li>Review and approve policies</li>
              <li>Publish approved policies</li>
              <li>Create and edit draft policies</li>
              <li>View all content</li>
            ` : ''}
            ${role === 'super-admin' ? `
              <li>Full administrative access</li>
              <li>User management capabilities</li>
              <li>System configuration access</li>
              <li>All policy and content management features</li>
            ` : ''}
          </ul>
          
          <p style="margin-top: 30px;">
            <a href="${baseUrl}/auth" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Log In to Your Account
            </a>
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any questions or need assistance, please contact your system administrator.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from your Policy Management System.
          </p>
        </div>
      `
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-user-welcome-email function:", error);
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
