export type TaskInput = {
  employee_ids: number[]; // bir neçə usta = qrup tapşırığı (hər üzvə ayrı sətir, eyni group_id; 0071)
  task_date: string;
  store_id: number | null;
  company_id: number | null;
  place_text: string | null;
  reason: string;
};
