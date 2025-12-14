import { createRouter, createWebHistory } from "vue-router";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";
import Dashboard from "@/views/Dashboard.vue";
import Students from "@/views/Students.vue";
import Attendance from "@/views/Attendance.vue";
import Login from "@/views/Login.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/",
      component: DashboardLayout,
      children: [
        {
          path: "",
          name: "dashboard",
          component: Dashboard,
        },
        {
          path: "students",
          name: "students",
          component: Students,
        },
        {
          path: "attendance",
          name: "attendance",
          component: Attendance,
        },
      ],
    },
  ],
});

export default router;
