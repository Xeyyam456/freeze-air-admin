// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    about_card_color: string
    about_card_text: string | null
    about_card_title: string | null
    about_image_main_url: string | null
    about_image_side_url: string | null
    about_points: string | null
    about_text: string | null
    about_title: string | null
    address: string | null
    email: string | null
    facebook_url: string | null
    hero_form_enabled: boolean
    hero_image_url: string | null
    hours: string | null
    id: number
    instagram_url: string | null
    logo_url: string | null
    phone: string | null
    updated_at: string
  }
  Insert: {
    about_card_color?: string
    about_card_text?: string | null
    about_card_title?: string | null
    about_image_main_url?: string | null
    about_image_side_url?: string | null
    about_points?: string | null
    about_text?: string | null
    about_title?: string | null
    address?: string | null
    email?: string | null
    facebook_url?: string | null
    hero_form_enabled?: boolean
    hero_image_url?: string | null
    hours?: string | null
    id?: number
    instagram_url?: string | null
    logo_url?: string | null
    phone?: string | null
    updated_at?: string
  }
  Update: {
    about_card_color?: string
    about_card_text?: string | null
    about_card_title?: string | null
    about_image_main_url?: string | null
    about_image_side_url?: string | null
    about_points?: string | null
    about_text?: string | null
    about_title?: string | null
    address?: string | null
    email?: string | null
    facebook_url?: string | null
    hero_form_enabled?: boolean
    hero_image_url?: string | null
    hours?: string | null
    id?: number
    instagram_url?: string | null
    logo_url?: string | null
    phone?: string | null
    updated_at?: string
  }
  Relationships: []
}
