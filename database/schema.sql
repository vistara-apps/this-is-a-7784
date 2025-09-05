-- KnowYourRights Card Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'cancelled')),
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'es')),
  alert_contacts JSONB DEFAULT '[]'::jsonb,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guides table
CREATE TABLE guides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  state TEXT NOT NULL,
  title TEXT NOT NULL,
  rights JSONB NOT NULL DEFAULT '[]'::jsonb,
  do_not_say JSONB NOT NULL DEFAULT '[]'::jsonb,
  scripts JSONB NOT NULL DEFAULT '{}'::jsonb,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(state, language)
);

-- Recordings table
CREATE TABLE recordings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, -- IPFS hash or storage path
  duration INTEGER DEFAULT 0, -- in seconds
  shared_link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved guides table (many-to-many relationship)
CREATE TABLE saved_guides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, guide_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_status);
CREATE INDEX idx_guides_state_lang ON guides(state, language);
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at);
CREATE INDEX idx_saved_guides_user_id ON saved_guides(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_guides ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can only see and update their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Recordings policies
CREATE POLICY "Users can view own recordings" ON recordings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings" ON recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings" ON recordings
  FOR DELETE USING (auth.uid() = user_id);

-- Saved guides policies
CREATE POLICY "Users can view own saved guides" ON saved_guides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved guides" ON saved_guides
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved guides" ON saved_guides
  FOR DELETE USING (auth.uid() = user_id);

-- Guides are public (read-only for all users)
CREATE POLICY "Guides are publicly readable" ON guides
  FOR SELECT USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON guides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial guide data
INSERT INTO guides (state, title, rights, do_not_say, scripts, language) VALUES
('California', 'Your Rights in California', 
 '["You have the right to remain silent", "You have the right to refuse consent to searches", "You have the right to an attorney", "You have the right to know why you are being stopped", "You have the right to record police interactions", "You cannot be detained without reasonable suspicion"]'::jsonb,
 '["\"I have nothing to hide\"", "\"You can search my car/house\"", "\"I waive my rights\"", "Anything about drugs, weapons, or illegal activities", "False information about your identity", "\"I understand\" (to unclear questions)"]'::jsonb,
 '{"policeStop": "Officer, I am exercising my right to remain silent. I do not consent to any searches. I would like to speak with an attorney. Am I free to go?\n\nIf detained: I am invoking my Fifth Amendment right to remain silent and my Sixth Amendment right to an attorney. I do not consent to any searches.", "searchRefusal": "I do not consent to any search of my person, belongings, or vehicle. I am exercising my Fourth Amendment rights. If you have a warrant, I will comply, but I do not consent to any search.", "silentInvocation": "I am invoking my Fifth Amendment right to remain silent. I will not answer questions without an attorney present. I request an attorney now."}'::jsonb,
 'en'),
('California', 'Tus Derechos en California',
 '["Tienes derecho a permanecer en silencio", "Tienes derecho a negarte a consentir búsquedas", "Tienes derecho a un abogado", "Tienes derecho a saber por qué te detienen", "Tienes derecho a grabar interacciones policiales", "No pueden detenerte sin sospecha razonable"]'::jsonb,
 '["\"No tengo nada que esconder\"", "\"Pueden buscar en mi carro/casa\"", "\"Renuncio a mis derechos\"", "Cualquier cosa sobre drogas, armas o actividades ilegales", "Información falsa sobre tu identidad", "\"Entiendo\" (a preguntas poco claras)"]'::jsonb,
 '{"policeStop": "Oficial, estoy ejerciendo mi derecho a permanecer en silencio. No consiento a ninguna búsqueda. Me gustaría hablar con un abogado. ¿Soy libre de irme?\n\nSi eres detenido: Estoy invocando mi derecho de la Quinta Enmienda a permanecer en silencio y mi derecho de la Sexta Enmienda a un abogado. No consiento a ninguna búsqueda.", "searchRefusal": "No consiento a ninguna búsqueda de mi persona, pertenencias o vehículo. Estoy ejerciendo mis derechos de la Cuarta Enmienda. Si tiene una orden judicial, cumpliré, pero no consiento a ninguna búsqueda.", "silentInvocation": "Estoy invocando mi derecho de la Quinta Enmienda a permanecer en silencio. No responderé preguntas sin un abogado presente. Solicito un abogado ahora."}'::jsonb,
 'es'),
('Texas', 'Your Rights in Texas',
 '["You have the right to remain silent", "You have the right to refuse consent to searches", "You have the right to an attorney", "You must provide ID if lawfully arrested", "You have the right to record police (in public)", "Police need probable cause to search without consent"]'::jsonb,
 '["\"I have nothing to hide\"", "\"Go ahead and search\"", "\"I waive my rights\"", "Anything about weapons or illegal items", "False personal information", "Admissions of guilt"]'::jsonb,
 '{"policeStop": "Officer, I am exercising my right to remain silent. I do not consent to searches. I want an attorney. Am I under arrest or am I free to go?", "searchRefusal": "I do not consent to any search. I am exercising my constitutional rights. If you have a warrant, please show it to me.", "silentInvocation": "I invoke my right to remain silent under the Fifth Amendment. I want to speak with an attorney before answering any questions."}'::jsonb,
 'en'),
('Texas', 'Tus Derechos en Texas',
 '["Tienes derecho a permanecer en silencio", "Tienes derecho a negarte a búsquedas", "Tienes derecho a un abogado", "Debes proporcionar ID si eres arrestado legalmente", "Tienes derecho a grabar policía (en público)", "Policía necesita causa probable para buscar sin consentimiento"]'::jsonb,
 '["\"No tengo nada que esconder\"", "\"Adelante, busquen\"", "\"Renuncio a mis derechos\"", "Cualquier cosa sobre armas o artículos ilegales", "Información personal falsa", "Admisiones de culpabilidad"]'::jsonb,
 '{"policeStop": "Oficial, estoy ejerciendo mi derecho a permanecer en silencio. No consiento búsquedas. Quiero un abogado. ¿Estoy arrestado o soy libre de irme?", "searchRefusal": "No consiento a ninguna búsqueda. Estoy ejerciendo mis derechos constitucionales. Si tiene una orden, por favor muéstremela.", "silentInvocation": "Invoco mi derecho a permanecer en silencio bajo la Quinta Enmienda. Quiero hablar con un abogado antes de responder preguntas."}'::jsonb,
 'es');
