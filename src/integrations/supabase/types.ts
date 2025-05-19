export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      auth_users: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean | null
        }
        Insert: {
          created_at?: string | null
          id: string
          is_admin?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string | null
          credential: string | null
          date: string
          id: string
          issuer: string
          link: string | null
          logo_url: string | null
          profile_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credential?: string | null
          date: string
          id?: string
          issuer: string
          link?: string | null
          logo_url?: string | null
          profile_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credential?: string | null
          date?: string
          id?: string
          issuer?: string
          link?: string | null
          logo_url?: string | null
          profile_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          demo_url: string | null
          description: string
          github_url: string | null
          id: string
          image_url: string | null
          profile_id: string | null
          technologies: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          demo_url?: string | null
          description: string
          github_url?: string | null
          id?: string
          image_url?: string | null
          profile_id?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          demo_url?: string | null
          description?: string
          github_url?: string | null
          id?: string
          image_url?: string | null
          profile_id?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string | null
          id: string
          level: number
          name: string
          profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          level: number
          name: string
          profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          level?: number
          name?: string
          profile_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          profile_id: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: string
          profile_id?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          profile_id?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string
          id: string
          location: string | null
          name: string
          phone: string | null
          profile_image: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email: string
          id?: string
          location?: string | null
          name: string
          phone?: string | null
          profile_image?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          profile_image?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_profile_image_column: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_column_exists: {
        Args: { table_name: string; column_name: string }
        Returns: boolean
      }
      check_storage_policy_exists: {
        Args: { policy_name: string; bucket_name: string }
        Returns: boolean
      }
      create_initial_admin: {
        Args: { admin_email: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
