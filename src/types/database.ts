export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          user_id: string
          account_id: string
          email: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          account_id: string
          email?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          account_id?: string
          email?: string | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          account_id: string
          display_name: string | null
          company: string | null
          summary: string | null
          last_interaction_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          display_name?: string | null
          company?: string | null
          summary?: string | null
          last_interaction_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          display_name?: string | null
          company?: string | null
          summary?: string | null
          last_interaction_at?: string | null
          created_at?: string
        }
      }
      customer_phones: {
        Row: {
          id: string
          account_id: string
          customer_id: string
          phone_e164: string
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          customer_id: string
          phone_e164: string
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          customer_id?: string
          phone_e164?: string
          created_at?: string
        }
      }
      customer_emails: {
        Row: {
          id: string
          account_id: string
          customer_id: string
          email_lower: string
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          customer_id: string
          email_lower: string
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          customer_id?: string
          email_lower?: string
          created_at?: string
        }
      }
      calls: {
        Row: {
          id: string
          account_id: string
          customer_id: string
          twilio_call_sid: string
          direction: 'inbound' | 'outbound'
          from_phone: string
          to_phone: string
          started_at: string
          duration_seconds: number | null
          recording_url: string | null
          recording_status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          customer_id: string
          twilio_call_sid: string
          direction: 'inbound' | 'outbound'
          from_phone: string
          to_phone: string
          started_at: string
          duration_seconds?: number | null
          recording_url?: string | null
          recording_status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          customer_id?: string
          twilio_call_sid?: string
          direction?: 'inbound' | 'outbound'
          from_phone?: string
          to_phone?: string
          started_at?: string
          duration_seconds?: number | null
          recording_url?: string | null
          recording_status?: string | null
          created_at?: string
        }
      }
      transcripts: {
        Row: {
          id: string
          account_id: string
          call_id: string
          raw_text: string
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          call_id: string
          raw_text: string
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          call_id?: string
          raw_text?: string
          created_at?: string
        }
      }
      emails: {
        Row: {
          id: string
          account_id: string
          customer_id: string
          gmail_message_id: string
          thread_id: string | null
          direction: 'sent' | 'received'
          from_email: string
          to_emails: string[]
          subject: string | null
          body_snippet: string | null
          body_text: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          customer_id: string
          gmail_message_id: string
          thread_id?: string | null
          direction: 'sent' | 'received'
          from_email: string
          to_emails: string[]
          subject?: string | null
          body_snippet?: string | null
          body_text?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          customer_id?: string
          gmail_message_id?: string
          thread_id?: string | null
          direction?: 'sent' | 'received'
          from_email?: string
          to_emails?: string[]
          subject?: string | null
          body_snippet?: string | null
          body_text?: string | null
          sent_at?: string | null
          created_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          account_id: string
          customer_id: string
          type: 'personal' | 'business' | 'commitment'
          content: string
          confidence: number
          source: 'call' | 'email'
          source_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          customer_id: string
          type: 'personal' | 'business' | 'commitment'
          content: string
          confidence?: number
          source: 'call' | 'email'
          source_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          customer_id?: string
          type?: 'personal' | 'business' | 'commitment'
          content?: string
          confidence?: number
          source?: 'call' | 'email'
          source_id?: string | null
          created_at?: string
        }
      }
      follow_ups: {
        Row: {
          id: string
          account_id: string
          customer_id: string
          suggestion: string
          status: 'pending' | 'done' | 'ignored'
          source: 'call' | 'email' | null
          source_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          customer_id: string
          suggestion: string
          status?: 'pending' | 'done' | 'ignored'
          source?: 'call' | 'email' | null
          source_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          customer_id?: string
          suggestion?: string
          status?: 'pending' | 'done' | 'ignored'
          source?: 'call' | 'email' | null
          source_id?: string | null
          created_at?: string
        }
      }
      integrations_gmail: {
        Row: {
          account_id: string
          google_refresh_token: string | null
          google_email: string | null
          last_sync_at: string | null
          created_at: string
        }
        Insert: {
          account_id: string
          google_refresh_token?: string | null
          google_email?: string | null
          last_sync_at?: string | null
          created_at?: string
        }
        Update: {
          account_id?: string
          google_refresh_token?: string | null
          google_email?: string | null
          last_sync_at?: string | null
          created_at?: string
        }
      }
      integrations_twilio: {
        Row: {
          account_id: string
          twilio_account_sid: string
          twilio_auth_token: string
          twilio_phone_e164: string
          created_at: string
        }
        Insert: {
          account_id: string
          twilio_account_sid: string
          twilio_auth_token: string
          twilio_phone_e164: string
          created_at?: string
        }
        Update: {
          account_id?: string
          twilio_account_sid?: string
          twilio_auth_token?: string
          twilio_phone_e164?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

