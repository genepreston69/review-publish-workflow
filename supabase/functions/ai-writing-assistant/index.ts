
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, operation, context } = await req.json();

    if (!text || !operation) {
      return new Response(
        JSON.stringify({ error: 'Text and operation are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (operation) {
      case 'improve-writing':
        systemPrompt = 'You are a professional writing assistant. Improve the clarity, flow, and readability of the text while maintaining its original meaning and tone. Return only the improved text.';
        userPrompt = `Please improve this text: ${text}`;
        break;
      
      case 'grammar-check':
        systemPrompt = 'You are a grammar and spelling checker. Fix any grammatical errors, spelling mistakes, and punctuation issues. Return only the corrected text.';
        userPrompt = `Please check and fix grammar in this text: ${text}`;
        break;
      
      case 'summarize':
        systemPrompt = 'You are a text summarization expert. Create a concise summary that captures the key points. Return only the summary.';
        userPrompt = `Please summarize this text: ${text}`;
        break;
      
      case 'expand-content':
        systemPrompt = 'You are a content expansion expert. Add relevant details, examples, and explanations to make the text more comprehensive while maintaining accuracy. Return only the expanded text.';
        userPrompt = `Please expand this text with more details: ${text}`;
        break;
      
      case 'tone-formal':
        systemPrompt = 'You are a professional writing assistant. Convert the text to a formal, professional tone suitable for business or academic contexts. Return only the reformatted text.';
        userPrompt = `Please make this text more formal: ${text}`;
        break;
      
      case 'tone-casual':
        systemPrompt = 'You are a writing assistant. Convert the text to a more casual, conversational tone while keeping it appropriate. Return only the reformatted text.';
        userPrompt = `Please make this text more casual: ${text}`;
        break;
      
      case 'policy-language':
        systemPrompt = 'You are a policy writing expert. Convert the text into proper policy language that is clear, professional, and follows standard policy document conventions. Use appropriate legal and administrative terminology. Return only the policy-formatted text.';
        userPrompt = `Please convert this into proper policy language: ${text}`;
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Add context if provided
    if (context) {
      systemPrompt += ` Context: This text is for a ${context} section of a policy document.`;
    }

    console.log('AI Writing Assistant - Operation:', operation);
    console.log('AI Writing Assistant - Input text length:', text.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const improvedText = data.choices[0].message.content;

    console.log('AI Writing Assistant - Output text length:', improvedText.length);

    return new Response(
      JSON.stringify({ improvedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI writing assistant:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
