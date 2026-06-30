import React from 'react'
import styles from './Bankname.module.css'
import { Link, useNavigate } from 'react-router-dom'

export default function Bankname() {
  const navigate = useNavigate()

  return (
    <div className={styles.banknameContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Select Bank</h1>
        <button onClick={() => navigate(-1)} className={styles.backBtn} aria-label="Go back">
          ←
        </button>
      </div>

      <p className={styles.instruction}>Choose a bank to create a report:</p>

      <ul className={styles.banknameList}>
        <li className={styles.bankname}><Link to="/icic">ICICI BANK</Link></li>
        <li className={styles.bankname}><Link to="/Jana">JANA BANK</Link></li>
        <li className={styles.bankname}><Link to="/kotak">KOTAK MAHINDRA BANK</Link></li>
        <li className={styles.bankname}><Link to="/Cholamandalam">CHOLAMANDALAM FINANCE</Link></li>
        <li className={styles.bankname}><Link to="/Sundaram">SUNDARAM FINANCE</Link></li>
        <li className={styles.bankname}><Link to="/Godrejcapital">GODREJ CAPITAL</Link></li>
        <li className={styles.bankname}><Link to="/LandTfinance">L&T FINANCE</Link></li>
        <li className={styles.bankname}><Link to="/ausmallfinanceform">AU SMALL FINANCE</Link></li>
        <li className={styles.bankname}><Link to="/UgroCapital">UGROW CAPITAL LTD</Link></li>
        <li className={styles.bankname}><Link to="/Nido">NIDO FINANCE</Link></li>
        <li className={styles.bankname}><Link to="/Idfc">IDFC BANK</Link></li>
        <li className={styles.bankname}><Link to="/Bhfl">BHFL</Link></li>
        <li className={styles.bankname}><Link to="/YesBank">YES BANK</Link></li>
        <li className={styles.bankname}><Link to="/JalgaonBank">JALGAON JANTA BANK</Link></li>
        <li className={styles.bankname}><Link to="/MotilalOswalBank">MOTILAL OSWAL HOME FINANCE</Link></li>
        <li className={styles.bankname}><Link to="/StarHousing">STAR HOUSING</Link></li>
        <li className={styles.bankname}><Link to="/CapitalIndia">CAPITAL INDIA</Link></li>
        <li className={styles.bankname}><Link to="/SvatantraHousingFinanceCorporation">SVATANTRA HOUSING FINANCE CORPORATION</Link></li>
        <li className={styles.bankname}><Link to="/CreditSaisitionIndia">CREDIT SAISON INDIA</Link></li>
      </ul>
    </div>
  )
}
