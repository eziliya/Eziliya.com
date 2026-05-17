import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './page/Home.jsx'
import Profile from './page/Profile.jsx'
import Login from './components/auth/Login.jsx'
import Logout from './components/auth/Logout.jsx'
import Signup from './components/auth/Signup.jsx'
import Bankname from './components/select banks/Bankname.jsx'

// Role-wise Profile Pages
import Valuer from './pages/role wise profile/valuer/valuer.jsx'
import ValuerReports from './pages/role wise profile/valuer/ValuerReports.jsx'
import ValuerBankSelection from './pages/role wise profile/valuer/ValuerBankSelection.jsx'
import Salesteam from './pages/role wise profile/sale team/Salesteam.jsx'
import SalesTeamForm from './pages/role wise profile/sale team/SalesTeamForm.jsx'
import Officeengineer from './pages/role wise profile/office engineer/Officeengineer.jsx'
import Siteengineer from './pages/role wise profile/site engineer/Siteengineer.jsx'
import SiteEngineerReports from './pages/role wise profile/site engineer/SiteEngineerReports.jsx'
import Technicalengineer from './pages/role wise profile/technical engineer/technicalengineer.jsx'

// Bank Forms
import Jana from './pages/jana bank/JanaForm.jsx'
import JanaFinalReport from './pages/jana bank/JanaFinalReport.jsx'
import Idfc from './pages/idfc/IdfcForm.jsx'
import IdfcFinalReport from './pages/idfc/IdfcFinalReport.jsx'
import Bhfl from './pages/bhfl/Bhflform.jsx'
import BhflFinalReport from './pages/bhfl/BhflFinalReport.jsx'
import JalgaonBank from './pages/jalgaon bank/JalgaonBankForm.jsx'
import JalgaonBankFinalReport from './pages/jalgaon bank/JalgaonBankFinalReport.jsx'
import LandTFinance from './pages/l&t/LandTFinanceForm.jsx'
import LandTFinanceFinalReport from './pages/l&t/LandTFinanceFinalReport.jsx'
import MotilalOswalBank from './pages/motilal oswal/MotilalOswalBankForm.jsx'
import MotilalOswalBankFinalReport from './pages/motilal oswal/MotilalOswalBankFinalReport.jsx'
import Nido from './pages/nido/NidoForm.jsx'
import NidoFinalReport from './pages/nido/NidoFinalReport.jsx'
import StarHousing from './pages/star housing/StarHousingForm.jsx'
import StarHousingFinalReport from './pages/star housing/StarHousingFinalReport.jsx'
import Sundaram from './pages/sundaram finance/SundaramForm.jsx'
import SundaramFinalReport from './pages/sundaram finance/SundaramFinalReport.jsx'
import SvatantraHousingFinanceCorporation from './pages/svatantra Housing Finance Corporation/SvatantraHousingFinanceCorporationForm.jsx'
import SvatantraHousingFinanceCorporationFinalReport from './pages/svatantra Housing Finance Corporation/SvatantraHousingFinanceCorporationFinalReport.jsx'
import UgroCapital from './pages/ugrow capital/UgroCapitalForm.jsx'
import UgroCapitalFinalReport from './pages/ugrow capital/UgroCapitalFinalReport.jsx'
import YesBank from './pages/yes bank/YesBankForm.jsx'
import YesBankFinalReport from './pages/yes bank/YesBankFinalReport.jsx'
import Godrejcapital from './pages/godrej capital/GodrejcapitalForm.jsx'
import GodrejcapitalFinalReport from './pages/godrej capital/GodrejcapitalFinalReport.jsx'
import Cholamandalam from './pages/cholamandalam/CholamandalamForm.jsx'
import CholamandalamFinalReport from './pages/cholamandalam/CholamandalamFinalReport.jsx'
import Ausmallfinanceform from './pages/au small finance/Ausmallfinanceform.jsx'
import Ausmallfinance from './pages/au small finance/AusmallfinanceFinalReport.jsx'
import CapitalIndia from './pages/capital india/CapitalIndiaForm.jsx'
import CapitalIndiaFinalReport from './pages/capital india/CapitalIndiaFinalReport.jsx'
import CreditSaisionIndia from './pages/credit saision india/CreditSaisionIndiaForm.jsx'
import CreditSaisionIndiaFinalReport from './pages/credit saision india/CreditSaisionIndiaFinalReport.jsx'

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/logout" element={<Logout />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Role-wise Profile Routes */}
        <Route path="/role/valuer" element={<Valuer />} />
        <Route path="/valuer" element={<Valuer />} />
        <Route path="/valuer/reports" element={<ValuerReports />} />
        <Route path="/valuer/select-bank" element={<ValuerBankSelection />} />
        <Route path="/role/salesteam" element={<Salesteam />} />
        <Route path="/salesteam" element={<Salesteam />} />
        <Route path="/salesteam/form" element={<SalesTeamForm />} />
        <Route path="/role/office-engineer" element={<Officeengineer />} />
        <Route path="/role/site-engineer" element={<Siteengineer />} />
        <Route path="/site-engineer/reports" element={<SiteEngineerReports />} />
        <Route path="/role/technical-engineer" element={<Technicalengineer />} />
        
        {/* Bank Selection */}
        <Route path="/select-banks" element={<Bankname />} />
        
        {/* Bank Forms and Final Reports */}
        <Route path="/Jana" element={<Jana />} />
        <Route path="/Jana-report" element={<JanaFinalReport />} />
        <Route path="/Cholamandalam" element={<Cholamandalam />} />
        <Route path="/Cholamandalam-report" element={<CholamandalamFinalReport />} />
        <Route path="/Sundaram" element={<Sundaram />} />
        <Route path="/Sundaram-report" element={<SundaramFinalReport />} />
        <Route path="/Godrejcapital" element={<Godrejcapital />} />
        <Route path="/Godrejcapital-report" element={<GodrejcapitalFinalReport />} />
        <Route path="/LandTfinance" element={<LandTFinance />} />
        <Route path="/LandTfinance-report" element={<LandTFinanceFinalReport />} />
        <Route path="/ausmallfinanceform" element={<Ausmallfinanceform />} />
        <Route path="/ausmallfinance" element={<Ausmallfinance />} />
        <Route path="/UgroCapital" element={<UgroCapital />} />
        <Route path="/UgroCapital-report" element={<UgroCapitalFinalReport />} />
        <Route path="/Nido" element={<Nido />} />
        <Route path="/Nido-report" element={<NidoFinalReport />} />
        <Route path="/Idfc" element={<Idfc />} />
        <Route path="/Idfc-report" element={<IdfcFinalReport />} />
        <Route path="/Bhfl" element={<Bhfl />} />
        <Route path="/Bhfl-report" element={<BhflFinalReport />} />
        <Route path="/YesBank" element={<YesBank />} />
        <Route path="/YesBank-report" element={<YesBankFinalReport />} />
        <Route path="/JalgaonBank" element={<JalgaonBank />} />
        <Route path="/JalgaonBank-report" element={<JalgaonBankFinalReport />} />
        <Route path="/MotilalOswalBank" element={<MotilalOswalBank />} />
        <Route path="/MotilalOswalBank-report" element={<MotilalOswalBankFinalReport />} />
        <Route path="/StarHousing" element={<StarHousing />} />
        <Route path="/StarHousing-report" element={<StarHousingFinalReport />} />
        <Route path="/CapitalIndia" element={<CapitalIndia />} />
        <Route path="/CapitalIndia-report" element={<CapitalIndiaFinalReport />} />
        <Route path="/SvatantraHousingFinanceCorporation" element={<SvatantraHousingFinanceCorporation />} />
        <Route path="/SvatantraHousingFinanceCorporation-report" element={<SvatantraHousingFinanceCorporationFinalReport />} />
        <Route path="/CreditSaisitionIndia" element={<CreditSaisionIndia />} />
        <Route path="/CreditSaisitionIndia-report" element={<CreditSaisionIndiaFinalReport />} />
      </Routes>
    </div>
  )
}
