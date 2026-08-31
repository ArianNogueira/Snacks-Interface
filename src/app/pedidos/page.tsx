import { OrdersDashboard } from "@/components/OrdersDashboard";
import { RoleGuard } from "@/components/RoleGuard";
import { ToastContainer } from "react-toastify";

export default function OrdersPage() {
  return <RoleGuard allowedRoles={["administrador", "funcionario"]}><ToastContainer /><OrdersDashboard /></RoleGuard>;
}
