// Mock client untuk menggantikan Supabase agar aplikasi bisa berjalan lokal dengan API sendiri

class MockSupabaseQueryBuilder {
  table: string;
  constructor(table: string) {
    this.table = table;
  }
  select(_query?: string) { return this; }
  insert(_data: any) { return Promise.resolve({ error: null }); }
  update(_data: any) { return this; }
  delete() { return this; }
  eq(_col: string, _val: any) { return this; }
  order(_col: string, _opts?: any) { return this; }
  limit(_val: number) { return this; }
  single() { return Promise.resolve({ data: null, error: null }); }
  then(resolve: any) {
    return Promise.resolve({ data: [], error: null }).then(resolve);
  }
}

export const supabase = {
  from: (table: string) => new MockSupabaseQueryBuilder(table),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async ({ email, password }: any) => {
      // Hubungkan ke API backend lokal kita
      try {
        const res = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password })
        });
        const data = await res.json();
        if (data.success) {
          return {
            data: {
              session: {
                access_token: 'mock-token',
                user: { id: data.user.id, email: data.user.username }
              }
            },
            error: null
          };
        } else {
          return { data: { session: null }, error: { message: data.message } };
        }
      } catch (err: any) {
        return { data: { session: null }, error: { message: err.message || 'Gagal terhubung ke server backend' } };
      }
    },
    signUp: () => Promise.resolve({ error: { message: 'Registrasi dinonaktifkan' } }),
    signOut: () => Promise.resolve({ error: null })
  },
  storage: {
    from: (_bucket: string) => ({
      upload: () => Promise.resolve({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  }
};
