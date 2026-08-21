import { CampaignStudio } from '@/components/app/campaign-studio';
import { getUserSession } from '@/lib/server/auth';
import { supabaseAdmin } from '@/lib/server/supabase';

export default async function CreateCampaign() {
  const session = await getUserSession();
  const db = supabaseAdmin();
  const { data: client } = session?.userId ? await db.from('clients').select('id').eq('owner_user_id', session.userId).maybeSingle() : { data: null };
  const { data: profile } = client ? await db.from('brand_profiles').select('reviewed').eq('client_id', client.id).maybeSingle() : { data: null };
  return <><p className="app-eyebrow">Campaign Studio</p><h1>Start with a business objective.</h1><CampaignStudio ready={Boolean(profile?.reviewed)} /></>;
}
