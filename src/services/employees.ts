import { supabase } from "@/lib/supabase";

export interface CreateEmployeeInput {
  nome: string;
  email: string;
  password: string;
}

interface CreateEmployeeResponse {
  message?: string;
  error?: string;
}

export async function createEmployee(input: CreateEmployeeInput) {
  const { data, error } = await supabase.functions.invoke<CreateEmployeeResponse>(
    "create-employee",
    { body: input }
  );

  if (error) {
    let message = error.message;
    if ("context" in error && error.context instanceof Response) {
      const response = await error.context.clone().json().catch(() => null) as CreateEmployeeResponse | null;
      message = response?.error ?? message;
    }
    throw new Error(message);
  }

  if (data?.error) throw new Error(data.error);
  return data;
}
