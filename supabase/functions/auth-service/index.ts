
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthRequest {
  action: 'getSession' | 'getUserRole' | 'signOut' | 'refreshSession';
  token?: string;
  userId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key for server-side operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, token, userId }: AuthRequest = await req.json();
    console.log('=== AUTH SERVICE REQUEST ===', action);

    switch (action) {
      case 'getSession': {
        if (!token) {
          return new Response(JSON.stringify({ session: null, user: null, userRole: null }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Verify the token and get user
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        
        if (error || !user) {
          console.log('=== INVALID TOKEN ===', error?.message);
          return new Response(JSON.stringify({ session: null, user: null, userRole: null }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get user role from profiles table
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('=== PROFILE FETCH ERROR ===', profileError);
        }

        const userRole = profile?.role || 'read-only';
        
        console.log('=== SESSION VALIDATED ===', { userId: user.id, userRole });
        
        return new Response(JSON.stringify({
          session: { user, access_token: token },
          user,
          userRole
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'getUserRole': {
        if (!userId) {
          return new Response(JSON.stringify({ userRole: 'read-only' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: profile, error } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('=== ROLE FETCH ERROR ===', error);
          return new Response(JSON.stringify({ userRole: 'read-only' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const userRole = profile?.role || 'read-only';
        console.log('=== ROLE FETCHED ===', { userId, userRole });

        return new Response(JSON.stringify({ userRole }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'signOut': {
        // Server-side sign out
        if (token) {
          const { error } = await supabaseAdmin.auth.admin.signOut(token);
          if (error) {
            console.error('=== SIGN OUT ERROR ===', error);
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('=== AUTH SERVICE ERROR ===', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
