import React, { useState } from 'react'
import styles from './StageCalculater.module.css'

export default function StageCalculater() {
  // Stage weights as per requirements
  const stageWeights = {
    plinth: 10,
    rccSlab: 40,
    brickWork: 15,
    plasterInternal: 5,
    plasterExternal: 5,
    flooring: 10,
    electricalWork: 2.5,
    plumbing: 2.5,
    doorWoodWork: 2.5,
    painting: 2.5
  }

  // R values (fixed values for each stage)
  const stageRValues = {
    plinth: 30,
    rccSlab: 30,
    brickWork: 15,
    plasterInternal: 5,
    plasterExternal: 5,
    flooring: 5,
    electricalWork: 2.5,
    plumbing: 2.5,
    doorWoodWork: 2.5,
    painting: 2.5
  }

  // State for all stages
  const [stages, setStages] = useState({
    plinth: { approvedSlabs: '', completedWork: '', completion: 0, recommendation: 0 },
    rccSlab: { approvedSlabs: '', completedWork: '', completion: 0, recommendation: 0 },
    brickWork: { approvedSlabs: '', completedWork: '', completion: 0, recommendation: 0 },
    plasterInternal: { approvedSlabs: '', completedWork: '', completion: 0, recommendation: 0 },
    plasterExternal: { approvedSlabs: '', completedWork: '', completion: 0, recommendation: 0 },
    flooring: { approvedSlabs: '', completedWork: '', completion: 0, recommendation: 0 },
    electricalWork: { approvedSlabs: '', completedWork: '', completion: 0, recommendation: 0 },
    plumbing: { approvedSlabs: '', completedWork: '', completion: 0, recommendation: 0 },
    doorWoodWork: { approvedSlabs: '', completedWork: '', completion: 0, recommendation: 0 },
    painting: { approvedSlabs: '', completedWork: '', completion: 0, recommendation: 0 }
  })

  // Calculate completion percentage for a stage
  // Formula: (Stage Weight / Approved Slabs) × Completed Work
  // Special case: For Plinth, directly use fixed value 10
  const calculateCompletion = (stageKey, approvedSlabs, completedWork) => {
    const weight = stageWeights[stageKey]
    
    // For Plinth stage, directly return fixed value 10
    if (stageKey === 'plinth') {
      return 10
    }

    const approved = parseFloat(approvedSlabs) || 0
    const completed = parseFloat(completedWork) || 0

    if (approved === 0) return 0

    const completion = (weight / approved) * completed
    return parseFloat(completion.toFixed(2))
  }

  // Calculate recommendation percentage for a stage
  // Formula: (Completed Work / Approved Slabs) × R
  // Special case: For Plinth, directly use R value
  const calculateRecommendation = (stageKey, approvedSlabs, completedWork) => {
    const rValue = stageRValues[stageKey]
    
    // For Plinth stage, directly return R value
    if (stageKey === 'plinth') {
      return rValue
    }

    const approved = parseFloat(approvedSlabs) || 0
    const completed = parseFloat(completedWork) || 0

    if (approved === 0) return 0

    const recommendation = (completed / approved) * rValue
    return parseFloat(recommendation.toFixed(2))
  }

  // Handle input change
  const handleInputChange = (stageKey, field, value) => {
    setStages(prev => {
      const updated = { ...prev }
      updated[stageKey] = { ...updated[stageKey], [field]: value }

      // Recalculate completion and recommendation if approved slabs or completed work changed
      if (field === 'approvedSlabs' || field === 'completedWork') {
        const completion = calculateCompletion(
          stageKey,
          field === 'approvedSlabs' ? value : updated[stageKey].approvedSlabs,
          field === 'completedWork' ? value : updated[stageKey].completedWork
        )
        const recommendation = calculateRecommendation(
          stageKey,
          field === 'approvedSlabs' ? value : updated[stageKey].approvedSlabs,
          field === 'completedWork' ? value : updated[stageKey].completedWork
        )
        updated[stageKey].completion = completion
        updated[stageKey].recommendation = recommendation
      }

      return updated
    })
  }

  // Prevent form submission on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  // Calculate total completion
  const getTotalCompletion = () => {
    const total = Object.values(stages).reduce((sum, stage) => sum + stage.completion, 0)
    return parseFloat(total.toFixed(2))
  }

  // Calculate total recommendation
  const getTotalRecommendation = () => {
    const total = Object.values(stages).reduce((sum, stage) => sum + stage.recommendation, 0)
    return parseFloat(total.toFixed(2))
  }

  // Render a stage row
  const StageRow = ({ label, stageKey, weight, rValue }) => (
    <tr>
      <td>
        <div className={styles.stageLabel}>{label}</div>
      </td>
      <td>
        <input
          type="text"
          value={weight}
          readOnly
          className={`${styles.input} ${styles.inputWeight}`}
        />
      </td>
      <td>
        <input
          type="text"
          value={rValue}
          readOnly
          className={`${styles.input} ${styles.inputWeight}`}
        />
      </td>
      <td>
        <input
          type="number"
          placeholder='Enter approved slabs'
          value={stages[stageKey].approvedSlabs}
          onChange={(e) => handleInputChange(stageKey, 'approvedSlabs', e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.input}
        />
      </td>
      <td>
        <input
          type="number"
          placeholder='Enter completed work'
          value={stages[stageKey].completedWork}
          onChange={(e) => handleInputChange(stageKey, 'completedWork', e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.input}
        />
      </td>
      <td>
        <input
          type="text"
          value={stages[stageKey].completion ? `${stages[stageKey].completion}%` : ''}
          readOnly
          placeholder='Auto calculated'
          className={`${styles.input} ${styles.inputCompletion}`}
        />
      </td>
      <td>
        <input
          type="text"
          value={stages[stageKey].recommendation ? `${stages[stageKey].recommendation}%` : ''}
          readOnly
          placeholder='Auto calculated'
          className={`${styles.input} ${styles.inputRecommendation}`}
        />
      </td>
    </tr>
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Construction Stage Calculator</h1>
        <p className={styles.subtitle}>Calculate completion percentage based on approved slabs and completed work</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Weight (T)</th>
              <th>R</th>
              <th>Approved Slabs</th>
              <th>Completed Work</th>
              <th>% Completion</th>
              <th>% Recommendation</th>
            </tr>
          </thead>
          <tbody>
            <StageRow label="Plinth" stageKey="plinth" weight={stageWeights.plinth} rValue={stageRValues.plinth} />
            <StageRow label="RCC / SLAB" stageKey="rccSlab" weight={stageWeights.rccSlab} rValue={stageRValues.rccSlab} />
            <StageRow label="Brick Work" stageKey="brickWork" weight={stageWeights.brickWork} rValue={stageRValues.brickWork} />
            <StageRow label="Plaster Internal" stageKey="plasterInternal" weight={stageWeights.plasterInternal} rValue={stageRValues.plasterInternal} />
            <StageRow label="Plaster External" stageKey="plasterExternal" weight={stageWeights.plasterExternal} rValue={stageRValues.plasterExternal} />
            <StageRow label="Flooring" stageKey="flooring" weight={stageWeights.flooring} rValue={stageRValues.flooring} />
            <StageRow label="Electrical Work" stageKey="electricalWork" weight={stageWeights.electricalWork} rValue={stageRValues.electricalWork} />
            <StageRow label="Plumbing" stageKey="plumbing" weight={stageWeights.plumbing} rValue={stageRValues.plumbing} />
            <StageRow label="Door & Wood Work" stageKey="doorWoodWork" weight={stageWeights.doorWoodWork} rValue={stageRValues.doorWoodWork} />
            <StageRow label="Painting" stageKey="painting" weight={stageWeights.painting} rValue={stageRValues.painting} />
            
            <tr className={styles.totalRow}>
              <td colSpan="5"><strong>Total</strong></td>
              <td>
                <input
                  type="text"
                  value={`${getTotalCompletion()}%`}
                  readOnly
                  className={`${styles.input} ${styles.inputReadOnly}`}
                  style={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                  title="Total % Completion"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={`${getTotalRecommendation()}%`}
                  readOnly
                  className={`${styles.input} ${styles.inputReadOnly}`}
                  style={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                  title="Total % Recommendation"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <p>Formula: % Completion = (Stage Weight / Approved Slabs) × Completed Work</p>
      </div>
    </div>
  )
}
