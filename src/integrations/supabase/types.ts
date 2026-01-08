export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          position: string
          sort_order: number
          start_date: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          position?: string
          sort_order?: number
          start_date?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          position?: string
          sort_order?: number
          start_date?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          name_fa: string | null
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          name_fa?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          name_fa?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_published: boolean
          page: string
          published_at: string | null
          section: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          page: string
          published_at?: string | null
          section: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          page?: string
          published_at?: string | null
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_reply: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          ip_address: string | null
          locale: string
          message: string
          phone: string | null
          replied_at: string | null
          replied_by: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
          user_role: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          ip_address?: string | null
          locale?: string
          message: string
          phone?: string | null
          replied_at?: string | null
          replied_by?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
          user_role?: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          ip_address?: string | null
          locale?: string
          message?: string
          phone?: string | null
          replied_at?: string | null
          replied_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
          user_role?: string
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          background_image: string | null
          badge_text: string | null
          badge_text_fa: string | null
          created_at: string
          cta_link: string | null
          cta_text: string | null
          cta_text_fa: string | null
          description: string | null
          description_fa: string | null
          display_order: number
          highlight_words: string[] | null
          icon_image: string | null
          id: string
          is_active: boolean
          title: string
          title_fa: string | null
          updated_at: string
        }
        Insert: {
          background_image?: string | null
          badge_text?: string | null
          badge_text_fa?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          cta_text_fa?: string | null
          description?: string | null
          description_fa?: string | null
          display_order?: number
          highlight_words?: string[] | null
          icon_image?: string | null
          id?: string
          is_active?: boolean
          title: string
          title_fa?: string | null
          updated_at?: string
        }
        Update: {
          background_image?: string | null
          badge_text?: string | null
          badge_text_fa?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          cta_text_fa?: string | null
          description?: string | null
          description_fa?: string | null
          display_order?: number
          highlight_words?: string[] | null
          icon_image?: string | null
          id?: string
          is_active?: boolean
          title?: string
          title_fa?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          seller_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity: number
          seller_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          seller_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          buyer_id: string
          created_at: string
          currency: string
          delivery_fee_afn: number
          discount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string
          seller_policies: Json | null
          settlement_currency: string
          shipping_address: Json | null
          shipping_cost: number
          status: string
          subtotal_afn: number
          subtotal_usd: number
          tax: number
          total_afn: number
          total_usd: number
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          buyer_id: string
          created_at?: string
          currency?: string
          delivery_fee_afn?: number
          discount?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string
          seller_policies?: Json | null
          settlement_currency?: string
          shipping_address?: Json | null
          shipping_cost?: number
          status?: string
          subtotal_afn?: number
          subtotal_usd?: number
          tax?: number
          total_afn?: number
          total_usd?: number
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          buyer_id?: string
          created_at?: string
          currency?: string
          delivery_fee_afn?: number
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          seller_policies?: Json | null
          settlement_currency?: string
          shipping_address?: Json | null
          shipping_cost?: number
          status?: string
          subtotal_afn?: number
          subtotal_usd?: number
          tax?: number
          total_afn?: number
          total_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          category_id: string | null
          compare_at_price: number | null
          cost_price: number | null
          created_at: string
          currency: string
          delivery_fee: number
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean
          low_stock_threshold: number | null
          metadata: Json | null
          name: string
          price: number
          quantity: number
          rejection_reason: string | null
          seller_id: string
          sku: string | null
          slug: string
          status: string
          subcategory_id: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          currency?: string
          delivery_fee?: number
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean
          low_stock_threshold?: number | null
          metadata?: Json | null
          name: string
          price: number
          quantity?: number
          rejection_reason?: string | null
          seller_id: string
          sku?: string | null
          slug: string
          status?: string
          subcategory_id?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          currency?: string
          delivery_fee?: number
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean
          low_stock_threshold?: number | null
          metadata?: Json | null
          name?: string
          price?: number
          quantity?: number
          rejection_reason?: string | null
          seller_id?: string
          sku?: string | null
          slug?: string
          status?: string
          subcategory_id?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          addresses: Json | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          addresses?: Json | null
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          addresses?: Json | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_cards: {
        Row: {
          badge_text: string | null
          badge_text_fa: string | null
          badge_variant: string
          category_id: string | null
          color_theme: string
          created_at: string
          currency: string
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          product_id: string | null
          sort_order: number
          starting_price: number
          subtitle: string | null
          subtitle_fa: string | null
          title: string
          title_fa: string | null
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          badge_text_fa?: string | null
          badge_variant?: string
          category_id?: string | null
          color_theme?: string
          created_at?: string
          currency?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          product_id?: string | null
          sort_order?: number
          starting_price?: number
          subtitle?: string | null
          subtitle_fa?: string | null
          title: string
          title_fa?: string | null
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          badge_text_fa?: string | null
          badge_variant?: string
          category_id?: string | null
          color_theme?: string
          created_at?: string
          currency?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          product_id?: string | null
          sort_order?: number
          starting_price?: number
          subtitle?: string | null
          subtitle_fa?: string | null
          title?: string
          title_fa?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_cards_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_cards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          applies_to: string
          applies_to_ids: string[] | null
          code: string | null
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_order_amount: number | null
          name: string
          start_date: string
          updated_at: string
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          applies_to?: string
          applies_to_ids?: string[] | null
          code?: string | null
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_amount?: number | null
          name: string
          start_date: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          applies_to?: string
          applies_to_ids?: string[] | null
          code?: string | null
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_amount?: number | null
          name?: string
          start_date?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          buyer_id: string
          comment: string
          created_at: string
          id: string
          order_id: string
          product_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          comment: string
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          comment?: string
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_orders: {
        Row: {
          buyer_name: string | null
          buyer_phone: string | null
          created_at: string
          currency: string
          delivery_fee: number
          id: string
          notes: string | null
          order_id: string
          order_number: string
          seller_id: string
          shipping_address: Json | null
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string
          currency?: string
          delivery_fee?: number
          id?: string
          notes?: string | null
          order_id: string
          order_number: string
          seller_id: string
          shipping_address?: Json | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string
          currency?: string
          delivery_fee?: number
          id?: string
          notes?: string | null
          order_id?: string
          order_number?: string
          seller_id?: string
          shipping_address?: Json | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_verifications: {
        Row: {
          address: Json | null
          admin_notes: string | null
          business_description: string | null
          business_name: string | null
          business_type: string | null
          completion_step: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          documents: Json | null
          id: string
          phone: string | null
          profile_completed: boolean | null
          rejection_reason: string | null
          return_policy: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          seller_id: string
          shipping_policy: string | null
          status: string
          store_banner: string | null
          store_logo: string | null
          store_visible: boolean | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          admin_notes?: string | null
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          completion_step?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          documents?: Json | null
          id?: string
          phone?: string | null
          profile_completed?: boolean | null
          rejection_reason?: string | null
          return_policy?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seller_id: string
          shipping_policy?: string | null
          status?: string
          store_banner?: string | null
          store_logo?: string | null
          store_visible?: boolean | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          admin_notes?: string | null
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          completion_step?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          documents?: Json | null
          id?: string
          phone?: string | null
          profile_completed?: boolean | null
          rejection_reason?: string | null
          return_policy?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seller_id?: string
          shipping_policy?: string | null
          status?: string
          store_banner?: string | null
          store_logo?: string | null
          store_visible?: boolean | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          favicon_url: string | null
          id: string
          logo_url: string | null
          site_name_en: string
          site_name_fa: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          site_name_en?: string
          site_name_fa?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          site_name_en?: string
          site_name_fa?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          name_fa: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          name_fa?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          name_fa?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "buyer" | "seller"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "buyer", "seller"],
    },
  },
} as const
