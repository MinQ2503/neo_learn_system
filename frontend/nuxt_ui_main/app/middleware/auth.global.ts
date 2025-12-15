export default defineNuxtRouteMiddleware((to, from) => {
  // Chỉ chạy trên client
  if (process.server) return

  const token = localStorage.getItem('auth_token')

  // Các route public (không cần login)
  const publicRoutes = ['/login', '/register', '/forgot-password']

  // Nếu đã login mà vào login/register → redirect về home
  if (token && publicRoutes.includes(to.path)) {
    return navigateTo('/')
  }

  // Nếu chưa login và vào route không public → redirect login
  if (!token && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
})
