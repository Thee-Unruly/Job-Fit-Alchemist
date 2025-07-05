
import { User as SupabaseUser } from '@supabase/supabase-js';

declare global {
  namespace Auth {
    interface User extends SupabaseUser {
      name?: string;
      profileCompleted?: boolean;
    }
  }
}
