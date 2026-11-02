import { Routes, Route, Navigate } from 'react-router-dom'
import CustomerLayout from '../../layouts/CustomerLayout'
import CustomerHome from './CustomerHome'
import CustomerMenu from './CustomerMenu'
import MyOrders from './MyOrders'
import Cart from './Cart'
import Checkout from './Checkout'
import ProductDetails from './ProductDetails'
import CustomerProfile from './CustomerProfile'
import CustomerNotifications from './CustomerNotifications'
import CustomerAbout from './CustomerAbout'

function CustomerRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<CustomerHome />} />
        <Route path="menu" element={<CustomerMenu />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="order" element={<Cart />} />
        <Route path="place-order" element={<Checkout />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="notifications" element={<CustomerNotifications />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="about" element={<CustomerAbout />} />
        <Route path="*" element={<Navigate to="/customer" replace />} />
      </Route>
    </Routes>
  )
}

export default CustomerRoutes
