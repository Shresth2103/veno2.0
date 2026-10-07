"use client"

import React from "react"

export interface LadderData {
  start: number
  end: number
}

interface SvgLadderProps {
  start: number
  end: number
  getPosition: (num: number) => { x: number; y: number }
  ladderWidth?: number
  rungSpacing?: number
  isHighlighted?: boolean
}

export function SvgLadder({
  start,
  end,
  getPosition,
  ladderWidth = 3.2,
  rungSpacing = 3.2,
  isHighlighted = false,
}: SvgLadderProps) {
  const p1Raw = getPosition(start)
  const p2Raw = getPosition(end)

  // Square center coordinates in SVG viewBox (100x150)
  const p1 = { x: p1Raw.x * 10 + 5, y: p1Raw.y * 10 + 5 }
  const p2 = { x: p2Raw.x * 10 + 5, y: p2Raw.y * 10 + 5 }

  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const length = Math.hypot(dx, dy)

  if (length === 0) return null

  // Unit vector along ladder
  const ux = dx / length
  const uy = dy / length

  // Perpendicular unit normal vector
  const nx = -uy
  const ny = ux

  const halfWidth = ladderWidth / 2

  // Rail endpoints
  const leftRail = {
    x1: p1.x - nx * halfWidth,
    y1: p1.y - ny * halfWidth,
    x2: p2.x - nx * halfWidth,
    y2: p2.y - ny * halfWidth,
  }

  const rightRail = {
    x1: p1.x + nx * halfWidth,
    y1: p1.y + ny * halfWidth,
    x2: p2.x + nx * halfWidth,
    y2: p2.y + ny * halfWidth,
  }

  // Calculate rungs along the ladder length
  const rungCount = Math.max(2, Math.floor(length / rungSpacing))
  const rungs = []

  for (let i = 1; i < rungCount; i++) {
    const t = i / rungCount
    const midX = p1.x + dx * t
    const midY = p1.y + dy * t

    rungs.push({
      x1: midX - nx * halfWidth,
      y1: midY - ny * halfWidth,
      x2: midX + nx * halfWidth,
      y2: midY + ny * halfWidth,
      key: `rung-${start}-${end}-${i}`,
    })
  }

  const railColor = isHighlighted ? "#fbbf24" : "#b45309"
  const rungColor = isHighlighted ? "#fef08a" : "#d97706"
  const shadowColor = "rgba(0, 0, 0, 0.25)"

  return (
    <g className="svg-ladder" id={`ladder-${start}-${end}`}>
      {/* Drop shadow for rails and rungs */}
      <line
        x1={leftRail.x1 + 0.3}
        y1={leftRail.y1 + 0.5}
        x2={leftRail.x2 + 0.3}
        y2={leftRail.y2 + 0.5}
        stroke={shadowColor}
        strokeWidth={0.7}
        strokeLinecap="round"
      />
      <line
        x1={rightRail.x1 + 0.3}
        y1={rightRail.y1 + 0.5}
        x2={rightRail.x2 + 0.3}
        y2={rightRail.y2 + 0.5}
        stroke={shadowColor}
        strokeWidth={0.7}
        strokeLinecap="round"
      />

      {/* Main Rails */}
      <line
        x1={leftRail.x1}
        y1={leftRail.y1}
        x2={leftRail.x2}
        y2={leftRail.y2}
        stroke={railColor}
        strokeWidth={0.8}
        strokeLinecap="round"
      />
      <line
        x1={rightRail.x1}
        y1={rightRail.y1}
        x2={rightRail.x2}
        y2={rightRail.y2}
        stroke={railColor}
        strokeWidth={0.8}
        strokeLinecap="round"
      />

      {/* Rungs */}
      {rungs.map((rung) => (
        <line
          key={rung.key}
          x1={rung.x1}
          y1={rung.y1}
          x2={rung.x2}
          y2={rung.y2}
          stroke={rungColor}
          strokeWidth={0.55}
          strokeLinecap="round"
        />
      ))}

      {/* Top and Bottom Caps */}
      <circle cx={leftRail.x1} cy={leftRail.y1} r={0.6} fill={railColor} />
      <circle cx={rightRail.x1} cy={rightRail.y1} r={0.6} fill={railColor} />
      <circle cx={leftRail.x2} cy={leftRail.y2} r={0.6} fill={railColor} />
      <circle cx={rightRail.x2} cy={rightRail.y2} r={0.6} fill={railColor} />
    </g>
  )
}
