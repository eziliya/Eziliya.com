import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './page/Home.jsx'
import Profile from './page/Profile.jsx'
import Login from './components/auth/Login.jsx'
import Logout from './components/auth/Logout.jsx'
import Signup from './components/auth/Signup.jsx'
import ForgotPassword from './components/auth/ForgotPassword.jsx'
import OtpVerification from './components/auth/OtpVerification.jsx'
import PhoneAuth from './components/auth/PhoneAuth.jsx'
import Bankname from './components/select banks/Bankname.jsx'
import Ausmallfinanceform from './components/au small finance/Ausmallfinanceform.jsx'


// Role-wise Profile Pages
import Valuer from './pages/role wise profile/valuer/valuer.jsx'
import ValuerReports from './pages/role wise profile/valuer/ValuerReports.jsx'
import ValuerBankSelection from './pages/role wise profile/valuer/ValuerBankSelection.jsx'
import Salesteam from './pages/role wise profile/sale team/Salesteam.jsx'
import SalesTeamForm from './pages/role wise profile/sale team/SalesTeamForm.jsx'
import SalesTeamReportViewer from './pages/role wise profile/sale team/SalesTeamReportViewer.jsx'
import Officeengineer from './pages/role wise profile/office engineer/Officeengineer.jsx'
import Siteengineer from './pages/role wise profile/site engineer/Siteengineer.jsx'
import SiteEngineerReports from './pages/role wise profile/site engineer/SiteEngineerReports.jsx'
import Technicalengineer from './pages/role wise profile/technical engineer/technicalengineer.jsx'
import TechnicalEngineerReports from './pages/role wise profile/technical engineer/TechnicalEngineerReports.jsx'

// Bank Forms (only import forms that actually exist)
import Bhfl from './pages/bhfl/Bhflform.jsx'
import BhflFinalReport from './pages/bhfl/BhflFinalReport.jsx'

// Bank Final Reports (banks without forms)
import JanaFinalReport from './pages/jana bank/JanaFinalReport.jsx'
import IdfcFinalReport from './pages/idfc/IdfcFinalReport.jsx'
import JalgaonBankFinalReport from './pages/jalgaon bank/JalgaonBankFinalReport.jsx'
import LandTFinanceFinalReport from './pages/l&t/LandTFinanceFinalReport.jsx'
import MotilalOswalBankFinalReport from './pages/motilal oswal/MotilalOswalBankFinalReport.jsx'
import NidoFinalReport from './pages/nido/NidoFinalReport.jsx'
import StarHousingFinalReport from './pages/star housing/StarHousingFinalReport.jsx'
import SundaramFinalReport from './pages/sundaram finance/SundaramFinalReport.jsx'
import SvatantraHousingFinanceCorporationFinalReport from './pages/svatantra Housing Finance Corporation/SvatantraHousingFinanceCorporationFinalReport.jsx'
import UgroCapitalFinalReport from './pages/ugrow capital/UgroCapitalFinalReport.jsx'
import YesBankFinalReport from './pages/yes bank/YesBankFinalReport.jsx'
import GodrejcapitalFinalReport from './pages/godrej capital/GodrejcapitalFinalReport.jsx'
import CholamandalamFinalReport from './pages/cholamandalam/CholamandalamFinalReport.jsx'
import AusmallfinanceFinalReport from './pages/au small finance/AusmallfinanceFinalReport.jsx'

import CapitalIndiaFinalReport from './pages/capital india/CapitalIndiaFinalReport.jsx'

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/phone-auth" element={<PhoneAuth />} />
        
        {/* Role-wise Profile Routes */}
        <Route path="/role/valuer" element={<Valuer />} />
        <Route path="/valuer" element={<Valuer />} />
        <Route path="/valuer/reports" element={<ValuerReports />} />
        <Route path="/valuer/select-bank" element={<ValuerBankSelection />} />
        <Route path="/role/salesteam" element={<Salesteam />} />
        <Route path="/salesteam" element={<Salesteam />} />
        <Route path="/salesteam/:userId/form" element={<SalesTeamForm />} />
        <Route path="/salesteam/form" element={<SalesTeamForm />} />
        <Route path="/salesteam/report/:fileId" element={<SalesTeamReportViewer />} />
        <Route path="/role/office-engineer" element={<Officeengineer />} />
        <Route path="/role/site-engineer" element={<Siteengineer />} />
        <Route path="/site-engineer/reports" element={<SiteEngineerReports />} />
        <Route path="/role/technical-engineer" element={<Technicalengineer />} />
        <Route path="/technical-engineer/reports" element={<TechnicalEngineerReports />} />
        
        {/* Bank Selection */}
        <Route path="/select-banks" element={<Bankname />} />
        
        {/* Bank Forms (only for banks with actual form components) */}
        <Route path="/Bhfl" element={<Ausmallfinanceform />} />
        <Route path="/Bhfl-report" element={<BhflFinalReport />} />
        
        {/* Bank Final Reports (banks without forms) */}
        <Route path="/Jana" element={<Ausmallfinanceform />} />
        <Route path="/Jana-report" element={<JanaFinalReport />} />
         <Route path="/Cholamandalam" element={<Ausmallfinanceform />} />
        <Route path="/Cholamandalam-report" element={<CholamandalamFinalReport />} />
        <Route path="/Sundaram" element={<Ausmallfinanceform />} />
        <Route path="/Sundaram-report" element={<SundaramFinalReport />} />
        <Route path="/Godrejcapital" element={<Ausmallfinanceform />} />
        <Route path="/Godrejcapital-report" element={<GodrejcapitalFinalReport />} />
        <Route path="/LandTfinance" element={<Ausmallfinanceform />} />
        <Route path="/LandTfinance-report" element={<LandTFinanceFinalReport />} />
        <Route path="/ausmallfinanceform" element={<Ausmallfinanceform />} />
        <Route path="/ausmallfinance-report" element={<AusmallfinanceFinalReport />} />
        <Route path="/ausmallfinancefinalreport" element={<AusmallfinanceFinalReport />} />
        <Route path="/UgroCapital" element={<Ausmallfinanceform />} />
        <Route path="/UgroCapital-report" element={<UgroCapitalFinalReport />} />
        <Route path="/Nido" element={<Ausmallfinanceform />} />
        <Route path="/Nido-report" element={<NidoFinalReport />} />
        <Route path="/Idfc" element={<Ausmallfinanceform />} />
        <Route path="/Idfc-report" element={<IdfcFinalReport />} />
        <Route path="/YesBank" element={<Ausmallfinanceform />} />
        <Route path="/YesBank-report" element={<YesBankFinalReport />} />
        <Route path="/JalgaonBank" element={<Ausmallfinanceform />} />
        <Route path="/JalgaonBank-report" element={<JalgaonBankFinalReport />} />
        <Route path="/MotilalOswalBank" element={<Ausmallfinanceform />} />
        <Route path="/MotilalOswalBank-report" element={<MotilalOswalBankFinalReport />} />
        <Route path="/StarHousing" element={<Ausmallfinanceform />} />
        <Route path="/StarHousing-report" element={<StarHousingFinalReport />} />
        <Route path="/CapitalIndia" element={<Ausmallfinanceform/>} />
        <Route path="/CapitalIndia-report" element={<CapitalIndiaFinalReport />} />

        <Route path="/SvatantraHousingFinanceCorporation" element={<Ausmallfinanceform />} />
        <Route path="/SvatantraHousingFinanceCorporation-report" element={<SvatantraHousingFinanceCorporationFinalReport />} />

        <Route path="/CreditSaisitionIndia" element={<Ausmallfinanceform />} />
        <Route path="/CreditSaisitionIndia-report" element={<CreditSaisionIndiaFinalReport />} />
      </Routes>
    </div>
  )
}
