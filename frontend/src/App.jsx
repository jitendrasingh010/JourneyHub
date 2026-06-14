import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './auth-components/Login'
import Signup from './auth-components/Signup'
import Forget from './auth-components/Forget'
import RegisterHotel from './auth-components/RegisterHotel'
import SuperA from './super-admin-dashboard/SuperA'
import AddBus from './super-admin-dashboard/AddBus'
import { ThemeProvider } from './customhooks/ThemeContext'
import BookingDashboard from './booking/BookingDashboard'
import HotelDahboard from './hotel/HotelDahboard'
import LandingPage from './landing/LandingPage'
import ExploreDestination from './landing/ExploreDestination'
import Wishlists from './wishlist/Wishlists'
import HotelDetails from './hotel/HotelDetails'
import BusDetails from './bus/BusDetails'
import RegisterOperator from './auth-components/RegisterOperator'
import OperatorDash from './operator/OperatorDash'
import GetOperator from './super-admin-dashboard/GetOperator'
import GetOperatorBuses from './operator/GetOperatorBuses'
const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/destination/:id' element={<ExploreDestination />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/forget' element={<Forget />} />
          <Route path='/registerhotel' element={<RegisterHotel />} />
          <Route path='/admin/dashboard' element={<SuperA />} />
          <Route path='/super-admin-dashboard/addbus' element={<AddBus />} />
          <Route path='/bookings' element={<BookingDashboard />} />
          <Route path='/hotel/dashboard' element={<HotelDahboard />} />
          <Route path='/hotel/:id' element={<HotelDetails />} />
          <Route path='/bus/:id' element={<BusDetails />} />
          <Route path='/wishlists' element={<Wishlists />} />
          <Route path='/register-operator' element={<RegisterOperator />} />
          <Route path='/operator-dashboard' element={<OperatorDash />} />
          <Route path='/super-admin-dashboard/GetOperator' element={<GetOperator />} />
          <Route path='/operator/GetOperatorBuses' element={<GetOperatorBuses />} />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
