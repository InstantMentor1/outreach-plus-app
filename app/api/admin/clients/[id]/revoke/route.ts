import { NextRequest, NextResponse } from 'next/server';
import { adminRequest } from '@/lib/server/security';
import { supabaseAdmin } from '@/lib/server/supabase';
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) { if (!await adminRequest(request)) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 }); const { id } = await context.params; try { const { error } = await supabaseAdmin().from('clients').update({ invitation_token_hash: null, invitation_expires_at: null, status: 'ready' }).eq('id', id); if (error) throw error; return NextResponse.json({ message: 'Invitation revoked. Generate a replacement when ready.' }); } catch { return NextResponse.json({ error: 'The invitation could not be revoked.' }, { status: 500 }); } }
