
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviterName }: InvitationRequest = await req.json();
    
    if (!email || !inviterName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, inviterName" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the invitation token from the database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('token')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (inviteError || !invitation) {
      return new Response(
        JSON.stringify({ error: "Invitation not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const acceptUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/auth/v1', '')}/auth?mode=accept-invitation&token=${invitation.token}`;

    const emailResponse = await resend.emails.send({
      from: "Policy Management <notifications@resend.dev>",
      to: [email],
      subject: "You're invited to join the Policy Management System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">You're Invited!</h2>
          <p>Hello!</p>
          <p><strong>${inviterName}</strong> has invited you to join the Policy Management System.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p>Click the button below to accept your invitation and set up your account:</p>
          </div>
          <p style="text-align: center;">
            <a href="${acceptUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.</p>
          <p style="color: #6b7280; font-size: 12px;">If the button doesn't work, copy and paste this link: ${acceptUrl}</p>
        </div>
      `
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
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
