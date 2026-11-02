import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../../layouts/AdminLayout'
import AdminOverview from './AdminOverview'
import AdminOrders from './AdminOrders'
import AdminProducts from './AdminProducts'
import AdminCategories from './AdminCategories'
import AdminInventory from './AdminInventory'
import AdminCustomers from './AdminCustomers'
import AdminNotifications from './AdminNotifications'
import AdminReports from './AdminReports'

function AdminDashboard() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}

export default AdminDashboard
