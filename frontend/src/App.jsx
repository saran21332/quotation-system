import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './page/Home.jsx'
import Login from './page/Login.jsx'
import ConfirmOTP from './page/confirmOTP.jsx'
import UserTem from './page/userTem.jsx'
import Admin from './page/Admin.jsx'
import Adminquotation from './page/Adminquotation.jsx'
import Quotationdefault from './page/quotationdefault.jsx'
import Quotationedit from './page/quotationedit.jsx'
import Quotationlogs from './page/Adminlog.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Confirm/OTP" element={<ConfirmOTP />} />
        <Route path="/user/temp" element={<UserTem />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Admin/quotation" element={<Adminquotation />} />
        <Route path="/Admin/quotation/default" element={<Quotationdefault />} />
        <Route path="/Admin/quotation/edit" element={<Quotationedit />} />
        <Route path="/Admin/history" element={<Quotationlogs />} />
      </Routes>
    </Router>
  )
}

export default App
