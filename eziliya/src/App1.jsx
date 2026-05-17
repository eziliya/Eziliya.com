import React from 'react'
import Bankname from './components/bankname/Bankname.jsx'
import Login from './auth/Login'
import Signup from './auth/Signup'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home.jsx'
import Icic from './pages/icici/Icic.js'
import Jana from './pages/jana bank/Jana.jsx'
import Idfc from './pages/idfc/Idfc.jsx'
import Bhfl from './pages/bhfl/Bhfl.jsx'
import JalgaonBank from './pages/jalgaon bank/JalgaonBank.jsx'
import Kotak from './pages/kotak/Kotak.jsx'
import LandTFinance from './pages/l&t/LandTFinance.jsx'
import MotilalOswalBank from './pages/motilal oswal/MotilalOswalBank.jsx'
import Nido from './pages/nido/Nido.jsx'
import StarHousing from './pages/star housing/StarHousing.jsx'
import Sundaram from './pages/sundaram finance/Sundaram.jsx'
import SvatantraHousingFinanceCorporation from './pages/svatantra Housing Finance Corporation/SvatantraHousingFinanceCorporation.jsx'
import UgroCapital from './pages/ugrow capital/UgroCapital.jsx'
import YesBank from './pages/yes bank/YesBank.jsx'
import Godrejcapital from './pages/godrej capital/Godrejcapital.jsx'
import Cholamandalam from './pages/cholamandalam/Cholamandalam.jsx'
import Ausmallfinance from './pages/au small finance/Ausmallfinance.jsx'
import Ausmallfinanceform from './pages/au small finance/Ausmallfinanceform.jsx'
import Reports from './components/reports/Reports.jsx'
import Profile from "./pages/profile/profile.jsx"
import CreateReport from './components/reports/CreateReport.jsx'



export default function App() {
  return (
    <div>
      <Routes>
        
        <Route path='/' element={<Home/>} />
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/Reports' element={<Reports/>}/>
        <Route path='/reports'element={<CreateReport/>}/>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/icic' element={<Icic/>}/>
        <Route path='/jana' element={<Jana/>}/>
        <Route path='/idfc' element={<Idfc/>}/>
        <Route path='/godrejcapital' element={<Godrejcapital/>}/>
        <Route path='/bhfl' element={<Bhfl/>}/>
        <Route path='/jalgaonbank' element={<JalgaonBank/>}/>
        <Route path='/kotak' element={<Kotak/>}/>
        <Route path='/landtfinance' element={<LandTFinance/>}/>
        <Route path='/motilaloswalbankbank' element={<MotilalOswalBank/>}/>
        <Route path='/nido' element={<Nido/>}/>
        <Route path='/starhousing' element={<StarHousing/>}/>
        <Route path='/sundaram' element={<Sundaram/>}/>
        <Route path='/svatantrahousingfinancecorporation' element={<SvatantraHousingFinanceCorporation/>}/>
        <Route path='/ugrocapital' element={<UgroCapital/>}/>
        <Route path='/yesbank' element={<YesBank/>}/>
        <Route path='/cholamandalam' element={<Cholamandalam/>}/>
        <Route path='/ausmallfinance' element={<Ausmallfinance/>}/>
        <Route path='/ausmallfinanceform' element={<Ausmallfinanceform/>}/>

      </Routes>
    </div>
  )
}
