-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table (using Supabase auth)
-- This is handled automatically by Supabase Auth

-- Create posts table
create table posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  excerpt text,
  author_id uuid references auth.users not null,
  image text,
  category text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  published boolean default false
);

-- Create comments table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts on delete cascade not null,
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  parent_id uuid references comments on delete cascade
);

-- Create reactions table
create table reactions (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts on delete cascade not null,
  user_id uuid references auth.users not null,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id, emoji)
);

-- Create user profiles table
create table profiles (
  id uuid references auth.users primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  website text
);

-- Create indexes for better performance
create index posts_author_id_idx on posts(author_id);
create index posts_created_at_idx on posts(created_at);
create index posts_category_idx on posts(category);
create index posts_published_idx on posts(published);
create index comments_post_id_idx on comments(post_id);
create index comments_user_id_idx on comments(user_id);

-- Create RLS policies
alter table posts enable row level security;
alter table comments enable row level security;
alter table reactions enable row level security;
alter table profiles enable row level security;

-- Create policies
create policy "Public posts are viewable by everyone" on posts
  for select using (published = true);

create policy "Users can view their own posts" on posts
  for select using (auth.uid() = author_id);

create policy "Users can create posts" on posts
  for insert with check (auth.uid() = author_id);

create policy "Users can update their own posts" on posts
  for update using (auth.uid() = author_id);

create policy "Users can delete their own posts" on posts
  for delete using (auth.uid() = author_id);

create policy "Users can view comments" on comments
  for select using (true);

create policy "Users can create comments" on comments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own comments" on comments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own comments" on comments
  for delete using (auth.uid() = user_id);

create policy "Users can view reactions" on reactions
  for select using (true);

create policy "Users can create reactions" on reactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own reactions" on reactions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own reactions" on reactions
  for delete using (auth.uid() = user_id);

create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- Create function to handle new user creation
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers to update updated_at
create trigger handle_posts_updated_at before update on posts
  for each row execute procedure public.handle_updated_at();

create trigger handle_profiles_updated_at before update on profiles
  for each row execute procedure public.handle_updated_at();