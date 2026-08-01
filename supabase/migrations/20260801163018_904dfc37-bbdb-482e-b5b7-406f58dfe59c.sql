CREATE TABLE public.class_timings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day text NOT NULL,
  time text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.class_timings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_timings TO authenticated;
GRANT ALL ON public.class_timings TO service_role;
ALTER TABLE public.class_timings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timings public read" ON public.class_timings FOR SELECT USING (true);
CREATE POLICY "admin manage timings" ON public.class_timings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER class_timings_updated_at BEFORE UPDATE ON public.class_timings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.class_timings (day, time, sort_order) VALUES
  ('Monday – Friday', '4:00 PM – 8:30 PM', 1),
  ('Saturday', '10:00 AM – 6:00 PM', 2),
  ('Sunday', 'Doubt-clearing & tests (by batch)', 3);

GRANT INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT ON public.reviews TO authenticated;
CREATE POLICY "anyone can add a review" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (
  char_length(student_name) BETWEEN 2 AND 60
  AND char_length(quote) BETWEEN 10 AND 800
  AND rating BETWEEN 1 AND 5
);

DELETE FROM public.reviews;
INSERT INTO public.reviews (student_name, detail, rating, quote) VALUES
  ('Abhinav Vishwakarma', 'Quality courses · via JustDial', 5, 'I had a great experience with Brilliant Desk Tuition. They offer quality courses that help students learn well. The teachers are friendly and helpful. They explain things clearly, so it is easy to understand. I feel more confident in my studies now.'),
  ('Sahana', 'Clean facilities · via JustDial', 5, 'Brilliant Desk Tuition is an exceptional coaching centre that truly stands out! The clean and well-maintained facilities create a great learning environment. The staff is highly knowledgeable and supportive, ensuring students grasp the concepts thoroughly.'),
  ('Justdial user', 'Reasonably priced · via JustDial', 5, 'Brilliant Desk Tuition is a great place for learning! The prices are very reasonable, which makes it easy for everyone to join. The teachers are friendly and help us understand better. I love the way they explain things simply.'),
  ('Ragavendra', 'Subject matter expertise · via JustDial', 5, 'Excellent subject matter expertise. Highly recommended coaching centre in Hongasandra.'),
  ('Anil', 'Multiple facilities · No extra fees · via JustDial', 5, 'Multiple facilities under one roof and no extra fees. Very satisfied with the teaching and the support given to students.'),
  ('Nithin', 'Highly experienced · via JustDial', 5, 'Highly experienced teaching. Concepts are made simple and the personal attention given to each student really shows in the results.');