  const routes = [
  {
  path: '/',
  component: () => import('pages/LoginPage.vue')
},
    {
      path: '/admin',
      component: () => import('layouts/MainLayout.vue'),
      children: 
      [{ path: 'dashboard', component: () => import('pages/admin/AdminDashboardPage.vue') }],

    },

    // Always leave this as last one,
    // but you can also remove it
    {
      path: '/:catchAll(.*)*',
      component: () => import('pages/ErrorNotFound.vue'),
    },
  ]

  export default routes
