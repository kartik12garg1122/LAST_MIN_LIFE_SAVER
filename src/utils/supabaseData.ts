import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, Task, TaskPriority } from '../types';
import { getAvatarForUser } from '../data/initialData';

export function mapSupabaseTaskToFrontend(row: any): Task {
  return {
    id: String(row.id),
    title: row.title || 'Untitled Assignment',
    completed: Boolean(row.completed),
    subject: row.subject || 'General',
    dueDate: row.deadline || row.due_date || 'Tomorrow 10 PM',
    priority: (row.priority as TaskPriority) || 'medium',
    durationMinutes: Number(row.estimated_minutes || row.duration_minutes || 45),
    progress: row.completed ? 100 : (row.progress || 0),
    notes: row.notes || '',
    isToday: row.is_today ?? true,
  };
}

export function mapFrontendTaskToSupabase(task: Partial<Task>, userId: string): any {
  return {
    user_id: userId,
    title: task.title,
    completed: Boolean(task.completed),
    subject: task.subject || 'General',
    deadline: task.dueDate || 'Tomorrow 10 PM',
    priority: task.priority || 'medium',
    estimated_minutes: Number(task.durationMinutes || 45),
  };
}

/**
 * Supabase Auth Services
 */
export async function supabaseSignUp(email: string, password?: string, name?: string) {
  if (!isSupabaseConfigured()) return null;
  const pass = password || 'Student123!';
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { data: { name: name || email.split('@')[0] } },
  });
  if (error) throw error;

  if (data.user) {
    // Initialize profile in public.profiles
    const initialProfile = {
      id: data.user.id,
      email: data.user.email,
      name: name || email.split('@')[0],
      cgpa: 9.0,
      daily_target: 5,
      avatar_url: getAvatarForUser(name || email.split('@')[0], email),
      program: 'Computer Science',
    };
    await supabase.from('profiles').upsert(initialProfile);
  }
  return data;
}

export async function supabaseSignIn(email: string, password?: string) {
  if (!isSupabaseConfigured()) return null;
  const pass = password || 'Student123!';
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) throw error;
  return data;
}

export async function supabaseSignOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

/**
 * Supabase Profile Services
 */
export async function fetchSupabaseProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email || '',
    name: data.name || 'Student',
    role: 'Undergraduate',
    program: data.program || 'Computer Science',
    cgpa: String(data.cgpa || '9.00'),
    gpa: String(data.cgpa || '9.00'),
    avatarUrl: data.avatar_url || getAvatarForUser(data.name || 'Student', data.email || ''),
    dailyStudyTargetHours: Number(data.daily_target || 5),
    dailyTarget: Number(data.daily_target || 5),
  };
}

export async function updateSupabaseProfile(userId: string, profile: Partial<UserProfile>) {
  if (!isSupabaseConfigured()) return;
  const payload: any = {
    id: userId,
    updated_at: new Date().toISOString(),
  };
  if (profile.name !== undefined) payload.name = profile.name;
  if (profile.email !== undefined) payload.email = profile.email;
  if (profile.cgpa !== undefined || profile.gpa !== undefined) {
    payload.cgpa = parseFloat(profile.cgpa || profile.gpa || '9.0');
  }
  if (profile.dailyStudyTargetHours !== undefined || profile.dailyTarget !== undefined) {
    payload.daily_target = Number(profile.dailyStudyTargetHours || profile.dailyTarget || 5);
  }
  if (profile.avatarUrl !== undefined) payload.avatar_url = profile.avatarUrl;
  if (profile.program !== undefined) payload.program = profile.program;

  const { error } = await supabase.from('profiles').upsert(payload);
  if (error) console.error('Error updating Supabase profile:', error);
}

/**
 * Supabase Tasks Services
 */
export async function fetchSupabaseTasks(userId: string): Promise<Task[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks from Supabase:', error);
    return [];
  }

  return (data || []).map(mapSupabaseTaskToFrontend);
}

export async function createSupabaseTask(userId: string, task: Partial<Task>): Promise<Task | null> {
  if (!isSupabaseConfigured()) return null;
  const payload = mapFrontendTaskToSupabase(task, userId);
  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating task in Supabase:', error);
    return null;
  }
  return mapSupabaseTaskToFrontend(data);
}

export async function updateSupabaseTask(taskId: string | number, task: Partial<Task>, userId: string) {
  if (!isSupabaseConfigured()) return;
  const payload = mapFrontendTaskToSupabase(task, userId);
  const { error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) console.error('Error updating task in Supabase:', error);
}

export async function deleteSupabaseTask(taskId: string | number, userId: string) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) console.error('Error deleting task in Supabase:', error);
}
