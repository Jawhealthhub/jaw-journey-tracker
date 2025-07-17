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

-- Create default_preferences table to store system defaults
CREATE TABLE public.default_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preference_type preference_type NOT NULL,
  preference_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

-- Allow everyone to read default preferences
CREATE POLICY "Everyone can view default preferences" ON public.default_preferences
FOR SELECT USING (true);

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

-- Insert default preferences into the defaults table
INSERT INTO public.default_preferences (preference_type, preference_value) VALUES
-- Default foods
('foods', 'Rice'),
('foods', 'Chicken'),
('foods', 'Banana'),
('foods', 'Yogurt'),
('foods', 'Bread'),
('foods', 'Eggs'),
('foods', 'Salmon'),
('foods', 'Vegetables'),
('foods', 'Nuts'),
('foods', 'Berries'),
('foods', 'Oatmeal'),
('foods', 'Cheese'),
('foods', 'Pasta'),
('foods', 'Soup'),
('foods', 'Smoothie'),

-- Default medications
('medications', 'TMJ ComfortPlus'),
('medications', 'Ibuprofen'),
('medications', 'Acetaminophen'),
('medications', 'Muscle relaxant'),
('medications', 'Magnesium'),
('medications', 'CBD oil'),
('medications', 'Turmeric'),
('medications', 'Vitamin D'),

-- Default exercises
('exercises', 'Walking'),
('exercises', 'Yoga'),
('exercises', 'Jaw stretches'),
('exercises', 'Neck stretches'),
('exercises', 'Meditation'),
('exercises', 'Swimming'),
('exercises', 'Cycling'),
('exercises', 'Strength training'),

-- Default symptoms
('symptoms', 'Jaw popping'),
('symptoms', 'Headaches'),
('symptoms', 'Jaw clicking'),
('symptoms', 'Facial pain'),
('symptoms', 'Jaw locking'),
('symptoms', 'Tooth pain'),
('symptoms', 'Ear pain'),
('symptoms', 'Neck tension'),
('symptoms', 'Jaw stiffness'),
('symptoms', 'Teeth grinding');

-- Function to initialize user data on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create onboarding record
  INSERT INTO public.user_onboarding (user_id)
  VALUES (NEW.id);
  
  -- Create subscription record
  INSERT INTO public.user_subscription (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();