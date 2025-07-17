-- Create enum for preference types
CREATE TYPE preference_type AS ENUM ('foods', 'medications', 'exercises', 'symptoms');

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_type preference_type NOT NULL,
  preference_value TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_onboarding table
CREATE TABLE public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  foods_completed BOOLEAN DEFAULT false,
  medications_completed BOOLEAN DEFAULT false,
  exercises_completed BOOLEAN DEFAULT false,
  symptoms_completed BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create daily_logs table
CREATE TABLE public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  foods TEXT[],
  medications TEXT[],
  exercises TEXT[],
  symptoms TEXT[],
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  work_done BOOLEAN,
  work_type TEXT,
  pain_score INTEGER CHECK (pain_score >= 1 AND pain_score <= 10),
  log_created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create user_subscription table for premium features
CREATE TABLE public.user_subscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  logs_count INTEGER DEFAULT 0,
  days_used INTEGER DEFAULT 0,
  first_log_date TIMESTAMPTZ,
  upgrade_prompted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscription ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" ON public.user_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_onboarding
CREATE POLICY "Users can view their own onboarding" ON public.user_onboarding
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding" ON public.user_onboarding
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding" ON public.user_onboarding
FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for daily_logs
CREATE POLICY "Users can view their own logs" ON public.daily_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs" ON public.daily_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs" ON public.daily_logs
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs" ON public.daily_logs
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_subscription
CREATE POLICY "Users can view their own subscription" ON public.user_subscription
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription" ON public.user_subscription
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.user_subscription
FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_onboarding_updated_at
  BEFORE UPDATE ON public.user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscription_updated_at
  BEFORE UPDATE ON public.user_subscription
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default preferences
INSERT INTO public.user_preferences (user_id, preference_type, preference_value, is_default) VALUES
-- Default foods
('00000000-0000-0000-0000-000000000000', 'foods', 'Rice', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Chicken', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Banana', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Yogurt', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Bread', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Eggs', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Salmon', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Vegetables', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Nuts', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Berries', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Oatmeal', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Cheese', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Pasta', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Soup', true),
('00000000-0000-0000-0000-000000000000', 'foods', 'Smoothie', true),

-- Default medications
('00000000-0000-0000-0000-000000000000', 'medications', 'TMJ ComfortPlus', true),
('00000000-0000-0000-0000-000000000000', 'medications', 'Ibuprofen', true),
('00000000-0000-0000-0000-000000000000', 'medications', 'Acetaminophen', true),
('00000000-0000-0000-0000-000000000000', 'medications', 'Muscle relaxant', true),
('00000000-0000-0000-0000-000000000000', 'medications', 'Magnesium', true),
('00000000-0000-0000-0000-000000000000', 'medications', 'CBD oil', true),
('00000000-0000-0000-0000-000000000000', 'medications', 'Turmeric', true),
('00000000-0000-0000-0000-000000000000', 'medications', 'Vitamin D', true),

-- Default exercises
('00000000-0000-0000-0000-000000000000', 'exercises', 'Walking', true),
('00000000-0000-0000-0000-000000000000', 'exercises', 'Yoga', true),
('00000000-0000-0000-0000-000000000000', 'exercises', 'Jaw stretches', true),
('00000000-0000-0000-0000-000000000000', 'exercises', 'Neck stretches', true),
('00000000-0000-0000-0000-000000000000', 'exercises', 'Meditation', true),
('00000000-0000-0000-0000-000000000000', 'exercises', 'Swimming', true),
('00000000-0000-0000-0000-000000000000', 'exercises', 'Cycling', true),
('00000000-0000-0000-0000-000000000000', 'exercises', 'Strength training', true),

-- Default symptoms
('00000000-0000-0000-0000-000000000000', 'symptoms', 'Jaw popping', true),
('00000000-0000-0000-0000-000000000000', 'symptoms', 'Headaches', true),
('00000000-0000-0000-0000-000000000000', 'symptoms', 'Jaw clicking', true),
('00000000-0000-0000-0000-000000000000', 'symptoms', 'Facial pain', true),
('00000000-0000-0000-0000-000000000000', 'symptoms', 'Jaw locking', true),
('00000000-0000-0000-0000-000000000000', 'symptoms', 'Tooth pain', true),
('00000000-0000-0000-0000-000000000000', 'symptoms', 'Ear pain', true),
('00000000-0000-0000-0000-000000000000', 'symptoms', 'Neck tension', true),
('00000000-0000-0000-0000-000000000000', 'symptoms', 'Jaw stiffness', true),
('00000000-0000-0000-0000-000000000000', 'symptoms', 'Teeth grinding', true);