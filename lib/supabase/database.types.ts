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
      atividades: {
        Row: {
          criado_em: string
          icone: string
          id: string
          moedas_delta: number
          texto: string
          user_id: string
          xp_ganho: number
        }
        Insert: {
          criado_em?: string
          icone: string
          id?: string
          moedas_delta?: number
          texto: string
          user_id: string
          xp_ganho?: number
        }
        Update: {
          criado_em?: string
          icone?: string
          id?: string
          moedas_delta?: number
          texto?: string
          user_id?: string
          xp_ganho?: number
        }
        Relationships: [
          {
            foreignKeyName: "atividades_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogo_desafios: {
        Row: {
          desafio_id: string
          moedas_max: number
          xp_max: number
        }
        Insert: {
          desafio_id: string
          moedas_max: number
          xp_max: number
        }
        Update: {
          desafio_id?: string
          moedas_max?: number
          xp_max?: number
        }
        Relationships: []
      }
      catalogo_itens_loja: {
        Row: {
          custo: number
          item_id: string
          quantidade: number
          recurso: string
          tema_valor: string | null
        }
        Insert: {
          custo: number
          item_id: string
          quantidade: number
          recurso: string
          tema_valor?: string | null
        }
        Update: {
          custo?: number
          item_id?: string
          quantidade?: number
          recurso?: string
          tema_valor?: string | null
        }
        Relationships: []
      }
      catalogo_niveis: {
        Row: {
          nivel: number
          xp_min: number
        }
        Insert: {
          nivel: number
          xp_min: number
        }
        Update: {
          nivel?: number
          xp_min?: number
        }
        Relationships: []
      }
      catalogo_plantas_xp: {
        Row: {
          planta_id: string
          xp_recompensa: number
        }
        Insert: {
          planta_id: string
          xp_recompensa: number
        }
        Update: {
          planta_id?: string
          xp_recompensa?: number
        }
        Relationships: []
      }
      colheitas: {
        Row: {
          colhido_em: string
          id: string
          moedas_ganho: number
          planta_id: string
          sementes_ganho: number
          terreno_id: number
          user_id: string
          xp_ganho: number
        }
        Insert: {
          colhido_em?: string
          id?: string
          moedas_ganho?: number
          planta_id: string
          sementes_ganho?: number
          terreno_id: number
          user_id: string
          xp_ganho?: number
        }
        Update: {
          colhido_em?: string
          id?: string
          moedas_ganho?: number
          planta_id?: string
          sementes_ganho?: number
          terreno_id?: number
          user_id?: string
          xp_ganho?: number
        }
        Relationships: [
          {
            foreignKeyName: "colheitas_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_posts: {
        Row: {
          conteudo: string
          criado_em: string
          id: string
          imagem: string | null
          tag: string
          user_id: string
        }
        Insert: {
          conteudo: string
          criado_em?: string
          id?: string
          imagem?: string | null
          tag: string
          user_id: string
        }
        Update: {
          conteudo?: string
          criado_em?: string
          id?: string
          imagem?: string | null
          tag?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunidade_posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      desafios_diarios_concluidos: {
        Row: {
          concluido_em: string
          data: string
          desafio_id: string
          moedas_ganho: number
          user_id: string
          xp_ganho: number
        }
        Insert: {
          concluido_em?: string
          data: string
          desafio_id: string
          moedas_ganho?: number
          user_id: string
          xp_ganho?: number
        }
        Update: {
          concluido_em?: string
          data?: string
          desafio_id?: string
          moedas_ganho?: number
          user_id?: string
          xp_ganho?: number
        }
        Relationships: [
          {
            foreignKeyName: "desafios_diarios_concluidos_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_state: {
        Row: {
          adubo: number
          maior_streak: number
          moedas: number
          sementes: number
          streak: number
          tema_ativo: string
          ultimo_desafio_em: string | null
          user_id: string
          xp: number
        }
        Insert: {
          adubo?: number
          maior_streak?: number
          moedas?: number
          sementes?: number
          streak?: number
          tema_ativo?: string
          ultimo_desafio_em?: string | null
          user_id: string
          xp?: number
        }
        Update: {
          adubo?: number
          maior_streak?: number
          moedas?: number
          sementes?: number
          streak?: number
          tema_ativo?: string
          ultimo_desafio_em?: string | null
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_state_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_troca: {
        Row: {
          ativo: boolean
          criado_em: string
          id: string
          planta_id: string
          procura: string
          quantidade_disponivel: number
          user_id: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          id?: string
          planta_id: string
          procura: string
          quantidade_disponivel: number
          user_id: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          id?: string
          planta_id?: string
          procura?: string
          quantidade_disponivel?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_troca_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_curtidas: {
        Row: {
          criado_em: string
          post_id: string
          user_id: string
        }
        Insert: {
          criado_em?: string
          post_id: string
          user_id: string
        }
        Update: {
          criado_em?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_curtidas_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "comunidade_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_curtidas_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preferencias: {
        Row: {
          alertas_mural: boolean
          disponivel_para_trocas: boolean
          herbario_publico: boolean
          lembrete_desafio_diario: boolean
          solicitacoes_troca: boolean
          unidades: string
          user_id: string
        }
        Insert: {
          alertas_mural?: boolean
          disponivel_para_trocas?: boolean
          herbario_publico?: boolean
          lembrete_desafio_diario?: boolean
          solicitacoes_troca?: boolean
          unidades?: string
          user_id: string
        }
        Update: {
          alertas_mural?: boolean
          disponivel_para_trocas?: boolean
          herbario_publico?: boolean
          lembrete_desafio_diario?: boolean
          solicitacoes_troca?: boolean
          unidades?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferencias_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          criado_em: string
          endereco: string | null
          id: string
          idade: number | null
          instituicao: string | null
          nickname: string | null
          nome_completo: string
          telefone: string | null
          tutorial_concluido: boolean
        }
        Insert: {
          criado_em?: string
          endereco?: string | null
          id: string
          idade?: number | null
          instituicao?: string | null
          nickname?: string | null
          nome_completo: string
          telefone?: string | null
          tutorial_concluido?: boolean
        }
        Update: {
          criado_em?: string
          endereco?: string | null
          id?: string
          idade?: number | null
          instituicao?: string | null
          nickname?: string | null
          nome_completo?: string
          telefone?: string | null
          tutorial_concluido?: boolean
        }
        Relationships: []
      }
      respostas_post: {
        Row: {
          conteudo: string
          criado_em: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          conteudo: string
          criado_em?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          conteudo?: string
          criado_em?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_post_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "comunidade_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_post_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_quiz: {
        Row: {
          correta: boolean
          eixo: string
          id: string
          planta_id: string
          respondido_em: string
          user_id: string
        }
        Insert: {
          correta: boolean
          eixo: string
          id?: string
          planta_id: string
          respondido_em?: string
          user_id: string
        }
        Update: {
          correta?: boolean
          eixo?: string
          id?: string
          planta_id?: string
          respondido_em?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_quiz_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      terrenos_jardim: {
        Row: {
          adubado: boolean
          bonus_adubo_ms: number
          id: number
          planta_id: string | null
          plantado_em: string | null
          user_id: string
        }
        Insert: {
          adubado?: boolean
          bonus_adubo_ms?: number
          id: number
          planta_id?: string | null
          plantado_em?: string | null
          user_id: string
        }
        Update: {
          adubado?: boolean
          bonus_adubo_ms?: number
          id?: number
          planta_id?: string | null
          plantado_em?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terrenos_jardim_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trocas_propostas: {
        Row: {
          criado_em: string
          id: string
          item_troca_id: string
          mensagem: string | null
          oferta_texto: string
          proponente_user_id: string
          status: string
        }
        Insert: {
          criado_em?: string
          id?: string
          item_troca_id: string
          mensagem?: string | null
          oferta_texto: string
          proponente_user_id: string
          status?: string
        }
        Update: {
          criado_em?: string
          id?: string
          item_troca_id?: string
          mensagem?: string | null
          oferta_texto?: string
          proponente_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "trocas_propostas_item_troca_id_fkey"
            columns: ["item_troca_id"]
            referencedRelation: "itens_troca"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trocas_propostas_proponente_user_id_fkey"
            columns: ["proponente_user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_colecao: {
        Row: {
          desbloqueada_em: string
          planta_id: string
          sementes: number
          status_crescimento: string
          ultima_revisao_em: string | null
          user_id: string
        }
        Insert: {
          desbloqueada_em?: string
          planta_id: string
          sementes?: number
          status_crescimento?: string
          ultima_revisao_em?: string | null
          user_id: string
        }
        Update: {
          desbloqueada_em?: string
          planta_id?: string
          sementes?: number
          status_crescimento?: string
          ultima_revisao_em?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_colecao_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      // Migration 14 (20261023100000_estudo_por_especie_sementes_moedas.sql).
      config_economia: {
        Row: { chave: string; descricao: string; valor: number }
        Insert: { chave: string; descricao: string; valor: number }
        Update: { chave?: string; descricao?: string; valor?: number }
        Relationships: []
      }
      fichas_lidas: {
        Row: { lida_em: string; planta_id: string; user_id: string }
        Insert: { lida_em?: string; planta_id: string; user_id: string }
        Update: { lida_em?: string; planta_id?: string; user_id?: string }
        Relationships: []
      }
    }
    Views: {
      // Migration 9 (20260909120000_perfis_publicos_view.sql). Escrito à mão,
      // como o resto deste arquivo desde a Fase 1 — ainda não há projeto
      // Supabase real para rodar `supabase gen types`.
      perfis_publicos: {
        Row: {
          id: string
          nome_completo: string
          xp: number
        }
        Relationships: []
      }
    }
    Functions: {
      // Migration 14
      concluir_quiz_especie: {
        Args: { p_planta_id: string; p_planta_nome?: string }
        Returns: Json
      }
      plantar_especie: {
        Args: { p_terreno_id: number; p_planta_id: string; p_comprar?: boolean }
        Returns: {
          adubo: number
          maior_streak: number
          moedas: number
          sementes: number
          streak: number
          tema_ativo: string
          ultimo_desafio_em: string | null
          user_id: string
          xp: number
        }[]
      }
      registrar_leitura_ficha: {
        Args: { p_planta_id: string }
        Returns: undefined
      }
      adubar_terreno: {
        Args: { p_terreno_id: number }
        Returns: {
          adubo: number
          maior_streak: number
          moedas: number
          sementes: number
          streak: number
          tema_ativo: string
          ultimo_desafio_em: string | null
          user_id: string
          xp: number
        }[]
      }
      comprar_item_loja: {
        Args: { p_item_id: string }
        Returns: {
          adubo: number
          maior_streak: number
          moedas: number
          sementes: number
          streak: number
          tema_ativo: string
          ultimo_desafio_em: string | null
          user_id: string
          xp: number
        }[]
      }
      concluir_desafio_diario: {
        Args: { p_desafio_id: string; p_moedas_ganho: number; p_xp_ganho: number }
        Returns: {
          adubo: number
          maior_streak: number
          moedas: number
          sementes: number
          streak: number
          tema_ativo: string
          ultimo_desafio_em: string | null
          user_id: string
          xp: number
        }[]
      }
      estudar_planta: {
        Args: { p_planta_id: string; p_planta_nome?: string }
        Returns: {
          adubo: number
          maior_streak: number
          moedas: number
          sementes: number
          streak: number
          tema_ativo: string
          ultimo_desafio_em: string | null
          user_id: string
          xp: number
        }[]
      }
      plantar_semente: {
        Args: { p_planta_id: string; p_terreno_id: number }
        Returns: {
          adubo: number
          maior_streak: number
          moedas: number
          sementes: number
          streak: number
          tema_ativo: string
          ultimo_desafio_em: string | null
          user_id: string
          xp: number
        }[]
      }
      realizar_colheita: {
        Args: { p_terreno_id: number }
        Returns: {
          adubo: number
          maior_streak: number
          moedas: number
          sementes: number
          streak: number
          tema_ativo: string
          ultimo_desafio_em: string | null
          user_id: string
          xp: number
        }[]
      }
      // Migration 10 (20260909140000_trocas_propostas_status_servidor.sql).
      // Ainda sem chamador na UI — não existe tela de aceitar/recusar troca.
      // Está aqui porque este arquivo espelha o schema: quem for escrever
      // essa tela depois encontra o tipo pronto, em vez de um erro de
      // compilação que convide a afrouxar a tipagem.
      responder_proposta_troca: {
        Args: { p_proposta_id: string; p_status: string }
        Returns: {
          criado_em: string
          id: string
          item_troca_id: string
          mensagem: string | null
          oferta_texto: string
          proponente_user_id: string
          status: string
        }[]
      }
      uuid_generate_v1: { Args: never; Returns: string }
      uuid_generate_v1mc: { Args: never; Returns: string }
      uuid_generate_v3: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_generate_v4: { Args: never; Returns: string }
      uuid_generate_v5: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_nil: { Args: never; Returns: string }
      uuid_ns_dns: { Args: never; Returns: string }
      uuid_ns_oid: { Args: never; Returns: string }
      uuid_ns_url: { Args: never; Returns: string }
      uuid_ns_x500: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
