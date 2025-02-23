
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const NCBI_API_KEY = Deno.env.get('NCBI_API_KEY')
    const { searchTerm } = await req.json()

    // Fetch data from NCBI API
    const response = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=taxonomy&term=${searchTerm}&retmode=json&apikey=${NCBI_API_KEY}`
    )

    const data = await response.json()
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store results in taxonomy_references table if they don't exist
    if (data.esearchresult?.idlist) {
      const ids = data.esearchresult.idlist.join(',')
      const summaryResponse = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=taxonomy&id=${ids}&retmode=json&apikey=${NCBI_API_KEY}`
      )
      const summaryData = await summaryResponse.json()

      // Process and store each taxonomy result
      for (const [id, result] of Object.entries(summaryData.result || {}).filter(([key]) => key !== 'uids')) {
        const { scientificname, rank, parentid } = result
        await supabaseClient
          .from('taxonomy_references')
          .upsert({
            taxon_id: id,
            scientific_name: scientificname,
            rank,
            parent_taxon_id: parentid,
            updated_at: new Date().toISOString()
          })
          .select()
      }
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
