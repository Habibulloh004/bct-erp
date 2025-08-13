import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from '@/layouts/RootLayout';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import Loading from '@/components/shared/Loading';
import Protected from '@/components/shared/Protected';
import RoleGuard from '@/components/shared/Role';

const Login = lazy(() => import('@/pages/auth/Login'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Reports = lazy(() => import('@/pages/reports'));
const Users = lazy(() => import('@/pages/settings/users/Users'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Products = lazy(() => import("@/pages/products"))
const CategoryUpdate = lazy(() => import("@/pages/products/CategoryUpdate"))
const ProductUpdate = lazy(() => import("@/pages/products/ProductUpdate"))
const AddProduct = lazy(() => import("@/pages/products/AddProduct"))
const AddCategory = lazy(() => import("@/pages/products/AddCategory"))
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/app" replace /> },
      {
        path: '/login',
        element: (
          <AuthLayout>
            <Suspense fallback={<Loading />}>
              <Login />
            </Suspense>
          </AuthLayout>
        ),
      },

      {
        path: '/app',
        element: (
          <Protected>
            <DashboardLayout />
          </Protected>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<Loading />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: 'reports',
            element: (
              <RoleGuard roles={['ADMIN', 'MANAGER']}>
                <Suspense fallback={<Loading />}>
                  <Reports />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: 'products',
            element: (
              <Suspense fallback={<Loading />}>
                <Products />
              </Suspense>
            ),
          },
          {
            path: 'products/:categoryId',
            element: (
              <Suspense fallback={<Loading />}>
                <CategoryUpdate />
              </Suspense>
            ),
          },
          {
            path: 'products/:categoryId/:productId',
            element: (
              <Suspense fallback={<Loading />}>
                <ProductUpdate />
              </Suspense>
            ),
          },
          {
            path: 'products/add-product',
            element: (
              <Suspense fallback={<Loading />}>
                <AddProduct />
              </Suspense>
            ),
          },
          {
            path: 'products/add-category',
            element: (
              <Suspense fallback={<Loading />}>
                <AddCategory />
              </Suspense>
            ),
          },
          {
            path: 'settings/users',
            element: (
              <RoleGuard roles={['ADMIN']}>
                <Suspense fallback={<Loading />}>
                  <Users />
                </Suspense>
              </RoleGuard>
            ),
          },
        ],
      },

      {
        path: '*',
        element: (
          <Suspense fallback={<Loading />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);
