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
      assignment_relations: {
        Row: {
          created_at: string | null
          edit_user_id: string
          id: string
          publish_user_id: string
        }
        Insert: {
          created_at?: string | null
          edit_user_id: string
          id?: string
          publish_user_id: string
        }
        Update: {
          created_at?: string | null
          edit_user_id?: string
          id?: string
          publish_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_relations_edit_user_id_fkey"
            columns: ["edit_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_relations_publish_user_id_fkey"
            columns: ["publish_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          assigned_publisher_id: string | null
          author_id: string
          body: string
          created_at: string | null
          id: string
          published_at: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_publisher_id?: string | null
          author_id: string
          body: string
          created_at?: string | null
          id?: string
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_publisher_id?: string | null
          author_id?: string
          body?: string
          created_at?: string | null
          id?: string
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_assigned_publisher_id_fkey"
            columns: ["assigned_publisher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Forms: {
        Row: {
          created_at: string
          form_content: string | null
          form_number: string | null
          form_type: string
          id: string
          name: string | null
          purpose: string | null
          reviewer: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          form_content?: string | null
          form_number?: string | null
          form_type: string
          id?: string
          name?: string | null
          purpose?: string | null
          reviewer?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          form_content?: string | null
          form_number?: string | null
          form_type?: string
          id?: string
          name?: string | null
          purpose?: string | null
          reviewer?: string | null
          status?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_policy_assignment: boolean | null
          email_policy_comment: boolean | null
          email_policy_published: boolean | null
          email_policy_returned: boolean | null
          email_policy_status_change: boolean | null
          id: string
          in_app_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_policy_assignment?: boolean | null
          email_policy_comment?: boolean | null
          email_policy_published?: boolean | null
          email_policy_returned?: boolean | null
          email_policy_status_change?: boolean | null
          id?: string
          in_app_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_policy_assignment?: boolean | null
          email_policy_comment?: boolean | null
          email_policy_published?: boolean | null
          email_policy_returned?: boolean | null
          email_policy_status_change?: boolean | null
          id?: string
          in_app_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Policies: {
        Row: {
          archived_at: string | null
          created_at: string
          creator_id: string | null
          id: string
          name: string | null
          parent_policy_id: string | null
          policy_number: string | null
          policy_text: string | null
          policy_type: string
          procedure: string | null
          published_at: string | null
          publisher_id: string | null
          purpose: string | null
          reviewer: string | null
          reviewer_comment: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          creator_id?: string | null
          id?: string
          name?: string | null
          parent_policy_id?: string | null
          policy_number?: string | null
          policy_text?: string | null
          policy_type: string
          procedure?: string | null
          published_at?: string | null
          publisher_id?: string | null
          purpose?: string | null
          reviewer?: string | null
          reviewer_comment?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          creator_id?: string | null
          id?: string
          name?: string | null
          parent_policy_id?: string | null
          policy_number?: string | null
          policy_text?: string | null
          policy_type?: string
          procedure?: string | null
          published_at?: string | null
          publisher_id?: string | null
          purpose?: string | null
          reviewer?: string | null
          reviewer_comment?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Policies_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Policies_parent_policy_id_fkey"
            columns: ["parent_policy_id"]
            isOneToOne: false
            referencedRelation: "Policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Policies_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_next_form_number: {
        Args: { f_form_type: string }
        Returns: string
      }
      generate_next_policy_number: {
        Args: { p_policy_type: string }
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          user_id: string
          check_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_current_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "read-only" | "edit" | "publish" | "super-admin"
      notification_type:
        | "policy_status_change"
        | "policy_assignment"
        | "policy_comment"
        | "policy_published"
        | "policy_returned"
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
    Enums: {
      app_role: ["read-only", "edit", "publish", "super-admin"],
      notification_type: [
        "policy_status_change",
        "policy_assignment",
        "policy_comment",
        "policy_published",
        "policy_returned",
      ],
    },
  },
} as const
