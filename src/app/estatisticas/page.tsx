import { DailyRevenue } from "@/components/DailyRevenue";
import { RoleGuard } from "@/components/RoleGuard";

export default function StatisticsPage() {
  return (
    <RoleGuard allowedRoles={["administrador"]}>
      <DailyRevenue />
    </RoleGuard>
  );
}
