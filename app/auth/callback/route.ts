import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const now = new Date().toISOString()
        const userMetadata = user.user_metadata || {}
        const companyName = userMetadata.company_name
        const companySlug = userMetadata.company_slug

        // Check if user already has a company (existing user)
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, company_id')
          .eq('id', user.id)
          .single()

        let companyId = existingUser?.company_id

        // If user doesn't have a company and we have company info from signup, create it
        if (!companyId && companyName && companySlug) {
          // Check if company slug already exists
          const { data: existingCompany } = await supabase
            .from('companies')
            .select('id')
            .eq('slug', companySlug)
            .single()

          if (existingCompany) {
            // Company already exists, use it
            companyId = existingCompany.id
          } else {
            // Create new company
            const { data: newCompany, error: companyError } = await supabase
              .from('companies')
              .insert({
                name: companyName,
                slug: companySlug,
                created_at: now,
                updated_at: now,
              })
              .select('id')
              .single()

            if (companyError) {
              console.error('[Auth Callback] Error creating company:', companyError)
            } else if (newCompany) {
              companyId = newCompany.id
              console.log('[Auth Callback] Company created:', newCompany.id)
            }
          }
        }

        // Upsert user with company_id
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email || '',
            company_id: companyId || null,
            role: 'admin',
            created_at: now,
            updated_at: now,
          }, {
            onConflict: 'id',
          })

        if (userError) {
          console.error('[Auth Callback] Error upserting user:', userError)
        } else {
          console.log('[Auth Callback] User upserted:', user.id, 'company:', companyId)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_error`)
}
