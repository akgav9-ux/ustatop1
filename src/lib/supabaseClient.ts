import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

// The design-refresh branch can be previewed without database credentials.
// This read-only fallback deliberately returns no records and never writes data.
// Real Supabase is used automatically as soon as both public env vars are configured.
function createPreviewQuery() {
  const result = {
    data: null,
    error: new Error('Supabase is not configured: database actions are disabled in this visual preview.'),
  };
  const query: Record<string, any> = {};
  const chain = () => query;
  for (const method of ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in', 'is', 'order', 'limit', 'range', 'match', 'ilike', 'like', 'gt', 'gte', 'lt', 'lte', 'contains', 'filter']) {
    query[method] = chain;
  }
  query.single = async () => result;
  query.maybeSingle = async () => result;
  query.then = (resolve: (value: typeof result) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return query;
}

const previewSupabase = {
  from: (_table: string) => createPreviewQuery(),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Database is not configured in visual preview.') }),
    signUp: async () => ({ data: { user: null, session: null }, error: new Error('Database is not configured in visual preview.') }),
    signOut: async () => ({ error: null }),
  },
  channel: () => ({ on() { return this; }, subscribe() { return this; }, unsubscribe: async () => 'ok' }),
  removeChannel: async () => 'ok',
};

export const supabase: any = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : previewSupabase;

if (!hasSupabaseConfig) {
  console.warn('UstaTop visual preview: Supabase is not configured; database features are disabled.');
}

// Упрощённая проверка подключения
export const checkConnection = async () => {
  if (!hasSupabaseConfig) return false;
  try {
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection error:', error);
      return false;
    }

    console.log('✅ Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return false;
  }
};
