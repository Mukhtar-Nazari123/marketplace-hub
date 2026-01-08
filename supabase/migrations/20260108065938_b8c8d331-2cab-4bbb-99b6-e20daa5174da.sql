-- Create contact_messages table for storing contact form submissions
CREATE TABLE public.contact_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    user_id UUID,
    user_role TEXT NOT NULL DEFAULT 'guest',
    locale TEXT NOT NULL DEFAULT 'en',
    ip_address TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    admin_reply TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    replied_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_status CHECK (status IN ('new', 'read', 'replied', 'closed')),
    CONSTRAINT valid_user_role CHECK (user_role IN ('guest', 'buyer', 'seller', 'admin')),
    CONSTRAINT valid_locale CHECK (locale IN ('en', 'fa')),
    CONSTRAINT message_length CHECK (char_length(message) >= 10 AND char_length(message) <= 5000)
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (for form submissions via edge function)
CREATE POLICY "Anyone can submit contact messages via edge function"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

-- Policy: Admins can view all messages
CREATE POLICY "Admins can view all contact messages"
ON public.contact_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Admins can update messages (for replies and status changes)
CREATE POLICY "Admins can update contact messages"
ON public.contact_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Admins can delete messages
CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Users can view their own messages
CREATE POLICY "Users can view their own contact messages"
ON public.contact_messages
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_user_id ON public.contact_messages(user_id);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);